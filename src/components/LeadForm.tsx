import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { LeadFunnel, type LeadSelection } from '../analytics/leadFunnel'
import { useSeenOnce, useTracker } from '../analytics/hooks'
import { lead as copy } from '../content/cs'
import { newRequestId, submitLead, type DeliveryMode, type LeadErrorCode } from '../lead/client'
import { isValidEmail, normalizeEmail } from '../lead/validation'

export type LeadPosition = 'inline' | 'repeat'

export interface SentLead {
  email: string
  from: LeadPosition
  delivery: DeliveryMode
}

interface Props {
  position: LeadPosition
  ticker: string
  amountCzk: number
  conversionRatePct: number
  /** "IVV · 100 000 Kč · směna 0,5 %" – shown in the inline bullet list. */
  selectionText: string
  /** The confirmed send (from either form), or null. */
  sent: SentLead | null
  onSent: (lead: SentLead) => void
  /** Checklist shown inside the inline confirmation (the repeat form sits right under the checklist). */
  confirmationChecklist?: Array<{ title: string; body: string }>
  onBackToTop?: () => void
}

type Status = { kind: 'idle' } | { kind: 'submitting' } | { kind: 'error'; code: LeadErrorCode | 'invalid_email_client' }

/**
 * One email form (inline after the result, or repeated after the checklist).
 * Success is shown only after the server confirmed the send. Retries of a failed/unconfirmed
 * attempt reuse the same requestId (no duplicate email); "pošlete znovu" starts a new request.
 */
export function LeadForm(props: Props) {
  const { position, sent } = props
  const id = useId()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const [reopened, setReopened] = useState(false)
  const intent = useRef<{ requestId: string; fingerprint: string } | null>(null)
  const confirmationRef = useRef<HTMLHeadingElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  /** Synchronous in-flight guard: React state updates too late to stop a fast double click. */
  const inFlight = useRef(false)

  const isOwnSuccess = sent?.from === position && !reopened
  const sentElsewhere = sent !== null && sent.from !== position

  useEffect(() => {
    if (isOwnSuccess) confirmationRef.current?.focus()
  }, [isOwnSuccess])

  // Funnel events (README §6). The form counts as viewed only while the form itself is shown,
  // not the confirmation or the "already sent" line.
  const tracker = useTracker()
  const funnel = useMemo(() => new LeadFunnel(tracker), [tracker])
  const formRef = useRef<HTMLDivElement>(null)
  const showsForm = !(sentElsewhere && !reopened) && !(isOwnSuccess && sent)
  const markViewed = () => tracker.trackOnce(`lead_form_viewed:${position}`, 'lead_form_viewed', { position })
  useSeenOnce(formRef, markViewed, showsForm)
  const markStarted = () => {
    markViewed() // focusing the field implies the form was seen, even within the 1 s dwell
    tracker.trackOnce(`lead_form_started:${position}`, 'lead_form_started', { position })
  }

  if (sentElsewhere && !reopened) {
    return <p className="text-[14px] leading-snug text-ink-2">{copy.alreadySent(sent.email)}</p>
  }

  if (isOwnSuccess && sent) {
    return (
      <div role="status" className="border-l-2 border-accent pl-4">
        <h3 ref={confirmationRef} tabIndex={-1} className="text-xl font-semibold tracking-[-0.015em] outline-offset-4">
          {copy.success.title}
        </h3>
        <p className="mt-1 text-[15px] leading-relaxed text-ink">
          {copy.success.sentTo} <strong className="font-semibold break-all">{sent.email}</strong>.
        </p>
        <p className="mt-1 text-[14px] leading-relaxed text-ink-2">
          {copy.success.notArrived}{' '}
          <button
            type="button"
            className="font-medium text-accent underline underline-offset-2 hover:text-accent-strong"
            onClick={() => {
              setReopened(true)
              setStatus({ kind: 'idle' })
              setEmail(sent.email)
              intent.current = null // a new send intent → new requestId
              requestAnimationFrame(() => inputRef.current?.focus())
            }}
          >
            {copy.success.resend}
          </button>
          .
        </p>
        {sent.delivery === 'mock' && (
          <p className="mt-3 font-mono text-[11.5px] leading-snug text-ink-3">
            <span className="mr-1.5 bg-ink px-1 py-px text-white">MOCK</span>
            {copy.success.mockNotice}
          </p>
        )}
        {props.confirmationChecklist && (
          <div className="mt-5">
            <p className="text-[14px] font-semibold">{copy.success.checklistLead}</p>
            <ol className="mt-2 space-y-2">
              {props.confirmationChecklist.map((item, i) => (
                <li key={item.title} className="grid grid-cols-[1.75rem_1fr] text-[14px] leading-snug">
                  <span aria-hidden="true" className="pt-0.5 font-mono text-label text-ink-3">{String(i + 1).padStart(2, '0')}</span>
                  <span>
                    <strong className="font-semibold">{item.title}</strong> <span className="text-ink-2">{item.body}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}
        {props.onBackToTop && (
          <button type="button" onClick={props.onBackToTop} className="mt-5 min-h-11 text-[14px] font-medium text-accent underline underline-offset-2">
            {copy.success.backToTop}
          </button>
        )}
      </div>
    )
  }

  const submitting = status.kind === 'submitting'
  const errorText =
    status.kind !== 'error'
      ? null
      : status.code === 'invalid_email' || status.code === 'invalid_email_client'
        ? copy.errors.invalidEmail
        : copy.errors[status.code === 'send_failed' ? 'sendFailed' : status.code === 'rate_limited' ? 'rateLimited' : status.code]
  const isFieldError = status.kind === 'error' && (status.code === 'invalid_email' || status.code === 'invalid_email_client')
  const canRetry = status.kind === 'error' && (status.code === 'send_failed' || status.code === 'unconfirmed' || status.code === 'unavailable')

  const submit = async () => {
    if (inFlight.current) return // repeated clicks while a request is in flight are ignored
    const value = normalizeEmail(email)
    if (!isValidEmail(value)) {
      funnel.invalidEmail(position)
      setStatus({ kind: 'error', code: 'invalid_email_client' })
      inputRef.current?.focus()
      return
    }
    const fingerprint = `${value.toLowerCase()}|${props.ticker}|${props.amountCzk}|${props.conversionRatePct}`
    if (!intent.current || intent.current.fingerprint !== fingerprint) intent.current = { requestId: newRequestId(), fingerprint }
    inFlight.current = true
    setStatus({ kind: 'submitting' })
    const honeypot = (document.getElementById(`${id}-company`) as HTMLInputElement | null)?.value ?? ''
    const requestId = intent.current.requestId
    const selection: LeadSelection = { position, ticker: props.ticker, amountCzk: props.amountCzk, conversionRatePct: props.conversionRatePct }
    funnel.submitted(requestId, selection)
    const outcome = await submitLead({
      email: value,
      ticker: props.ticker,
      amountCzk: props.amountCzk,
      conversionRatePct: props.conversionRatePct,
      requestId,
      company: honeypot,
    })
    inFlight.current = false
    funnel.outcome(requestId, selection, outcome)
    if (outcome.status === 'sent') {
      setStatus({ kind: 'idle' })
      setReopened(false)
      props.onSent({ email: value, from: position, delivery: outcome.delivery })
    } else {
      setStatus({ kind: 'error', code: outcome.code })
    }
  }

  const isInline = position === 'inline'
  return (
    <div ref={formRef} className={isInline ? 'lg:grid lg:grid-cols-12 lg:gap-10' : ''}>
      {isInline ? (
        <div className="lg:col-span-5">
          <h2 id={`${id}-title`} className="text-[1.375rem] font-semibold leading-tight tracking-[-0.025em] lg:text-[1.75rem]">
            {copy.inline.title}
          </h2>
          <p className="mt-2 text-[15px] text-ink-2">{copy.inline.intro}</p>
          <ul className="mt-1.5 space-y-1 text-[15px] leading-snug text-ink">
            {copy.inline.bullets(props.selectionText).map((b) => (
              <li key={b} className="grid grid-cols-[1rem_1fr]">
                <span aria-hidden="true" className="text-ink-3">–</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <h3 id={`${id}-title`} className="text-[15px] font-semibold leading-snug">
          {copy.repeat.title}
        </h3>
      )}

      <form
        noValidate
        aria-labelledby={`${id}-title`}
        aria-busy={submitting}
        className={isInline ? 'mt-5 lg:col-span-7 lg:mt-1' : 'mt-3'}
        onSubmit={(e) => {
          e.preventDefault()
          void submit()
        }}
      >
        <label htmlFor={`${id}-email`} className="font-mono text-label uppercase text-ink-3">
          {copy.emailLabel}
        </label>
        <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-end">
          <input
            ref={inputRef}
            id={`${id}-email`}
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            placeholder={copy.emailPlaceholder}
            value={email}
            disabled={submitting}
            aria-invalid={isFieldError}
            aria-describedby={errorText ? `${id}-error` : `${id}-micro`}
            onFocus={markStarted}
            onChange={(e) => {
              setEmail(e.target.value)
              if (isFieldError) setStatus({ kind: 'idle' })
            }}
            className="h-12 min-w-0 flex-1 border-b-[1.5px] border-ink bg-transparent text-lg text-ink outline-offset-4 placeholder:text-ink-3 disabled:opacity-60 aria-[invalid=true]:border-error"
          />
          <button
            type="submit"
            disabled={submitting}
            className="h-12 shrink-0 rounded-sm bg-accent px-5 text-[15px] font-semibold text-white hover:bg-accent-strong disabled:cursor-wait disabled:opacity-70"
          >
            {submitting ? copy.sending : isInline ? copy.inline.submit : copy.repeat.submit}
          </button>
        </div>

        {/* Honeypot: hidden from people and assistive tech; bots tend to fill every field. */}
        <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
          <label htmlFor={`${id}-company`}>Firma</label>
          <input id={`${id}-company`} name="company" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
        </div>

        {errorText && (
          <div id={`${id}-error`} role="alert" className="mt-3 text-[14px] leading-snug text-error">
            {errorText}{' '}
            {canRetry && (
              <button type="button" onClick={() => void submit()} className="ml-1 font-medium underline underline-offset-2">
                {copy.errors.retry}
              </button>
            )}
          </div>
        )}

        <p id={`${id}-micro`} className="mt-3 text-[13px] leading-snug text-ink-3">
          {copy.micro}{' '}
          <a href="#provozovatel" className="text-ink-2 underline underline-offset-2">
            {copy.privacyLink}
          </a>
        </p>
      </form>
    </div>
  )
}
