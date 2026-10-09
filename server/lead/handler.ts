/**
 * POST /api/lead – validates the request, applies abuse protection and sends the requested
 * email through the configured provider. Web-standard Request/Response, so the same handler runs
 * in the Vite dev server, in tests and (later) as a serverless function.
 *
 * Success (200 {status:"sent"}) is returned ONLY after the provider accepted the email.
 * Provider timeouts/unknown failures → 504 "unconfirmed" (retry with the same requestId is safe:
 * the provider idempotency key is derived from it). Nothing personal is logged.
 */
import { etfData } from '../../src/domain/etfData'
import { renderLeadEmail, type LeadEmailInput, type RenderedEmail } from '../../src/email/leadEmail'
import { validateLeadBody } from '../../src/lead/validation'
import type { LeadConfig } from '../config'
import type { EmailProvider } from '../email/provider'
import { IntentStore, sha256Hex, SlidingWindowLimiter, type IntentResult } from './stores'

export const MAX_BODY_BYTES = 4096

export type LogEvent =
  | { event: 'lead_sent'; mode: string; providerId: string; ticker: string; duplicate: boolean }
  | { event: 'lead_failed'; mode: string; kind: string; detail: string }
  | { event: 'lead_rejected'; reason: string }
  | { event: 'lead_honeypot' }

export interface LeadDeps {
  config: LeadConfig
  provider: EmailProvider
  intents?: IntentStore
  ipLimiter?: SlidingWindowLimiter
  addressLimiter?: SlidingWindowLimiter
  now?: () => number
  log?: (e: LogEvent) => void
  render?: (input: LeadEmailInput) => RenderedEmail
}

const json = (status: number, body: Record<string, unknown>, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers },
  })

function toResponse(result: IntentResult, mode: string): Response {
  if (result.kind === 'sent') return json(200, { status: 'sent', delivery: mode })
  if (result.kind === 'unconfirmed') return json(504, { status: 'error', code: 'unconfirmed' })
  return json(result.status, { status: 'error', code: result.code })
}

export function createLeadHandler(deps: LeadDeps) {
  const { config, provider } = deps
  const intents = deps.intents ?? new IntentStore()
  const ipLimiter = deps.ipLimiter ?? new SlidingWindowLimiter(config.limits.perIp.max, config.limits.perIp.windowMs)
  const addressLimiter = deps.addressLimiter ?? new SlidingWindowLimiter(config.limits.perAddress.max, config.limits.perAddress.windowMs)
  const now = deps.now ?? (() => Date.now())
  const log = deps.log ?? (() => {})
  const render = deps.render ?? renderLeadEmail
  const tickers = etfData.funds.map((f) => f.ticker)
  // Per-instance random salt: the in-memory keys cannot be matched against a list of known
  // addresses (an unsalted SHA-256 of an email address is easy to reverse by guessing).
  const salt = crypto.randomUUID()

  return async function handleLead(request: Request, clientIp: string): Promise<Response> {
    if (request.method !== 'POST') return json(405, { status: 'error', code: 'method_not_allowed' }, { Allow: 'POST' })

    // Origin check: browsers always send Origin on POST. Required for real delivery.
    const origin = request.headers.get('origin')?.replace(/\/$/, '') ?? null
    if (config.allowedOrigins) {
      if ((origin === null && config.mode === 'resend') || (origin !== null && !config.allowedOrigins.includes(origin))) {
        log({ event: 'lead_rejected', reason: 'origin' })
        return json(403, { status: 'error', code: 'forbidden' })
      }
    }

    if (!(request.headers.get('content-type') ?? '').toLowerCase().startsWith('application/json')) {
      return json(415, { status: 'error', code: 'invalid_input' })
    }

    // Per-IP limit on every request (valid or not), before any work is done.
    const t = now()
    const ipKey = `ip:${clientIp || 'unknown'}`
    if (!ipLimiter.hit(ipKey, t)) {
      log({ event: 'lead_rejected', reason: 'ip_rate_limit' })
      return json(429, { status: 'error', code: 'rate_limited' }, { 'Retry-After': String(ipLimiter.retryAfterSeconds(ipKey, t)) })
    }

    const declared = Number(request.headers.get('content-length') ?? '0')
    if (declared > MAX_BODY_BYTES) return json(413, { status: 'error', code: 'invalid_input' })
    const raw = await request.text()
    if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) return json(413, { status: 'error', code: 'invalid_input' })

    let body: unknown
    try {
      body = JSON.parse(raw)
    } catch {
      return json(400, { status: 'error', code: 'invalid_input' })
    }

    const v = validateLeadBody(body, tickers)
    if (!v.ok) {
      log({ event: 'lead_rejected', reason: `invalid_${v.field}` })
      return json(400, { status: 'error', code: v.code })
    }
    const req = v.value

    // Honeypot: real visitors never see the field. Answer like a success, send nothing.
    if (req.company.trim() !== '') {
      log({ event: 'lead_honeypot' })
      return json(200, { status: 'sent', delivery: config.mode })
    }

    // Hash first (async), so the idempotency check-and-register below runs without any await in
    // between – concurrent double submits can then never both start a send.
    const fingerprint = await sha256Hex(`${salt}|${req.email.toLowerCase()}|${req.ticker}|${req.amountCzk}|${req.conversionRatePct}`)
    const addressKey = `addr:${await sha256Hex(`${salt}|${req.email.toLowerCase()}`)}`

    // Idempotency per send intent.
    const existing = intents.get(req.requestId, t)
    if (existing && existing.fingerprint !== fingerprint) {
      log({ event: 'lead_rejected', reason: 'request_id_reused' })
      return json(409, { status: 'error', code: 'invalid_input' })
    }
    if (existing?.state === 'pending') return toResponse(await existing.promise, config.mode)
    if (existing?.state === 'done' && existing.result.kind === 'sent') {
      log({ event: 'lead_sent', mode: config.mode, providerId: 'cached', ticker: req.ticker, duplicate: true })
      return toResponse(existing.result, config.mode)
    }
    const isRetryOfUnconfirmed = existing?.state === 'done' && existing.result.kind === 'unconfirmed'

    // Per-address limit applies to NEW sends only (a retry of an unconfirmed intent is the same send).
    if (!isRetryOfUnconfirmed && !addressLimiter.isAllowed(addressKey, t)) {
      log({ event: 'lead_rejected', reason: 'address_rate_limit' })
      return json(429, { status: 'error', code: 'rate_limited' }, { 'Retry-After': String(addressLimiter.retryAfterSeconds(addressKey, t)) })
    }

    const run = async (): Promise<IntentResult> => {
      const rendered = render({
        ticker: req.ticker,
        amountCzk: req.amountCzk,
        conversionRatePct: req.conversionRatePct,
        operatorLine: config.operatorLine,
      })
      const outcome = await provider.send(
        { to: req.email, subject: rendered.subject, html: rendered.html, text: rendered.text },
        { idempotencyKey: `lead-${req.requestId}`, timeoutMs: config.providerTimeoutMs },
      )
      if (outcome.ok) {
        if (!isRetryOfUnconfirmed) addressLimiter.hit(addressKey, now())
        log({ event: 'lead_sent', mode: provider.mode, providerId: outcome.id, ticker: req.ticker, duplicate: false })
        return { kind: 'sent' }
      }
      log({ event: 'lead_failed', mode: provider.mode, kind: outcome.kind, detail: outcome.detail })
      switch (outcome.kind) {
        case 'timeout':
        case 'unknown':
          return { kind: 'unconfirmed' }
        case 'rate_limited':
        case 'config':
          return { kind: 'failed', status: 503, code: 'unavailable' }
        default:
          return { kind: 'failed', status: 502, code: 'send_failed' }
      }
    }

    const promise = run().catch((): IntentResult => ({ kind: 'unconfirmed' }))
    intents.set(req.requestId, { state: 'pending', fingerprint, promise })
    const result = await promise
    intents.set(req.requestId, { state: 'done', fingerprint, result, at: now() })
    return toResponse(result, config.mode)
  }
}
