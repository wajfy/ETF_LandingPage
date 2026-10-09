import { describe, expect, it } from 'vitest'
import { submitLead, type LeadOutcome } from '../lead/client'
import { LeadFunnel, type LeadSelection } from './leadFunnel'
import { localRecorder } from './testSink'
import { createTracker } from './tracker'

const sel: LeadSelection = { position: 'inline', ticker: 'VOO', amountCzk: 100_000, conversionRatePct: 0.5 }
const ID_A = '3f0e8f9a-1c2b-4d5e-8f70-123456789abc'
const ID_B = '7d1c2e3f-4a5b-4c6d-9e8f-0a1b2c3d4e5f'

function setup() {
  const sink = localRecorder()
  const funnel = new LeadFunnel(createTracker({ sinks: [sink], getContext: () => ({ device: 'mobile', in_app: false }) }))
  const names = () => sink.events.map((e) => e.name)
  return { sink, funnel, names }
}

const sent: LeadOutcome = { status: 'sent', delivery: 'resend' }
const error = (code: Extract<LeadOutcome, { status: 'error' }>['code']): LeadOutcome => ({ status: 'error', code })

describe('lead funnel: submission vs confirmed provider acceptance', () => {
  it('a confirmed send produces lead_submitted then lead_email_accepted', () => {
    const { funnel, sink, names } = setup()
    funnel.submitted(ID_A, sel)
    funnel.outcome(ID_A, sel, sent)
    expect(names()).toEqual(['lead_submitted', 'lead_email_accepted'])
    expect(sink.events[0].props).toEqual({ position: 'inline', ticker: 'VOO', amount_bucket: '100000', rate_bucket: '0.3-0.5', attempt: 'first' })
    expect(sink.events[1].props).toEqual({ position: 'inline', ticker: 'VOO', amount_bucket: '100000', delivery: 'resend', accepted_on_page: 1 })
  })

  it.each(['unconfirmed', 'send_failed', 'rate_limited', 'unavailable', 'invalid_email'] as const)(
    '"%s" is an error, never a delivery',
    (code) => {
      const { funnel, sink, names } = setup()
      funnel.submitted(ID_A, sel)
      funnel.outcome(ID_A, sel, error(code))
      expect(names()).toEqual(['lead_submitted', 'lead_form_error'])
      expect(sink.events[1].props).toEqual({ position: 'inline', error_type: code })
    },
  )

  it('client-side validation failure is an error without a submission', () => {
    const { funnel, names } = setup()
    funnel.invalidEmail('repeat')
    expect(names()).toEqual(['lead_form_error'])
  })

  it('marks a retry of the same intent and counts the delivery once', () => {
    const { funnel, sink, names } = setup()
    funnel.submitted(ID_A, sel)
    funnel.outcome(ID_A, sel, error('unconfirmed'))
    funnel.submitted(ID_A, sel)
    funnel.outcome(ID_A, sel, sent) // the server returns the original (cached) send
    funnel.outcome(ID_A, sel, sent) // a duplicate confirmation for the same intent
    expect(names()).toEqual(['lead_submitted', 'lead_form_error', 'lead_submitted', 'lead_email_accepted'])
    expect(sink.events[2].props).toMatchObject({ attempt: 'retry' })
  })

  it('a new intent ("pošlete znovu") is a new first attempt and a new delivery', () => {
    const { funnel, sink, names } = setup()
    funnel.submitted(ID_A, sel)
    funnel.outcome(ID_A, sel, sent)
    funnel.submitted(ID_B, sel)
    funnel.outcome(ID_B, sel, sent)
    expect(names()).toEqual(['lead_submitted', 'lead_email_accepted', 'lead_submitted', 'lead_email_accepted'])
    expect(sink.events[2].props).toMatchObject({ attempt: 'first' })
    expect(sink.events[3].props).toMatchObject({ accepted_on_page: 2 })
  })

  it('counts accepted sends per page load across both forms (for the conversion-rate numerator)', () => {
    const sink = localRecorder()
    const tracker = createTracker({ sinks: [sink], getContext: () => ({ device: 'mobile', in_app: false }) })
    const inline = new LeadFunnel(tracker)
    const repeat = new LeadFunnel(tracker)
    inline.submitted(ID_A, sel)
    inline.outcome(ID_A, sel, sent)
    repeat.submitted(ID_B, { ...sel, position: 'repeat' })
    repeat.outcome(ID_B, { ...sel, position: 'repeat' }, sent)
    const accepted = sink.events.filter((e) => e.name === 'lead_email_accepted').map((e) => e.props)
    expect(accepted).toEqual([
      expect.objectContaining({ position: 'inline', accepted_on_page: 1 }),
      expect.objectContaining({ position: 'repeat', accepted_on_page: 2 }),
    ])
    // A new page load (new tracker) starts again at 1 – there is no cross-visit memory.
    const next = new LeadFunnel(createTracker({ sinks: [sink], getContext: () => ({ device: 'mobile', in_app: false }) }))
    next.submitted(ID_A, sel)
    next.outcome(ID_A, sel, sent)
    expect(sink.events.at(-1)?.props).toMatchObject({ accepted_on_page: 1 })
  })

  it('keeps mock sends distinguishable from real ones', () => {
    const { funnel, sink } = setup()
    funnel.submitted(ID_A, sel)
    funnel.outcome(ID_A, sel, { status: 'sent', delivery: 'mock' })
    expect(sink.events[1].props).toMatchObject({ delivery: 'mock' })
  })

  it('never puts the request id or any address into an event', () => {
    const { funnel, sink } = setup()
    funnel.submitted(ID_A, sel)
    funnel.outcome(ID_A, sel, error('unconfirmed'))
    funnel.submitted(ID_A, sel)
    funnel.outcome(ID_A, sel, sent)
    const payload = JSON.stringify(sink.events)
    expect(payload).not.toContain(ID_A)
    expect(payload).not.toContain('@')
  })
})

describe('lead funnel with the real client: failure paths never count as delivered', () => {
  const body = { email: 'jana.novakova@example.cz', ticker: 'VOO', amountCzk: 100_000, conversionRatePct: 0.5, requestId: ID_A, company: '' }
  const respond = (status: number, json: unknown) => (async () => new Response(JSON.stringify(json), { status })) as unknown as typeof fetch

  async function run(fetchImpl: typeof fetch, timeoutMs?: number) {
    const { funnel, sink, names } = setup()
    funnel.submitted(ID_A, sel)
    funnel.outcome(ID_A, sel, await submitLead(body, { fetchImpl, timeoutMs }))
    return { names: names(), last: sink.events.at(-1)?.props }
  }

  it('200 "sent" counts as delivered', async () => {
    expect((await run(respond(200, { status: 'sent', delivery: 'resend' }))).names).toContain('lead_email_accepted')
  })

  it('client timeout is unconfirmed', async () => {
    const hang = ((_url: string, init: RequestInit) =>
      new Promise((_resolve, reject) => init.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError'))))) as unknown as typeof fetch
    const r = await run(hang, 20)
    expect(r.names).toEqual(['lead_submitted', 'lead_form_error'])
    expect(r.last).toEqual({ position: 'inline', error_type: 'unconfirmed' })
  })

  it('network failure is unconfirmed', async () => {
    const offline = (async () => {
      throw new TypeError('Failed to fetch')
    }) as unknown as typeof fetch
    expect((await run(offline)).last).toEqual({ position: 'inline', error_type: 'unconfirmed' })
  })

  it('server 504 "unconfirmed" and a platform 504 page are unconfirmed', async () => {
    expect((await run(respond(504, { status: 'error', code: 'unconfirmed' }))).last).toMatchObject({ error_type: 'unconfirmed' })
    const gateway = (async () => new Response('<html>Gateway Timeout</html>', { status: 504 })) as unknown as typeof fetch
    expect((await run(gateway)).last).toMatchObject({ error_type: 'unconfirmed' })
  })

  it('a 200 without a valid "sent" body is not a delivery', async () => {
    const r = await run(respond(200, { status: 'ok' }))
    expect(r.names).not.toContain('lead_email_accepted')
  })
})
