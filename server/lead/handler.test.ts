import { describe, expect, it, vi } from 'vitest'
import type { LeadConfig } from '../config'
import { MockEmailProvider } from '../email/mockProvider'
import type { EmailProvider, SendOutcome } from '../email/provider'
import { createLeadHandler, MAX_BODY_BYTES, type LogEvent } from './handler'

const baseConfig: LeadConfig = {
  mode: 'mock',
  allowedOrigins: null,
  providerTimeoutMs: 1_000,
  limits: { perIp: { max: 100, windowMs: 60_000 }, perAddress: { max: 3, windowMs: 24 * 3_600_000 } },
}

let n = 0
const uuid = () => `3f2b8c1e-4d5a-4b6c-8d7e-${String(++n).padStart(12, '0')}`
const body = (patch: Record<string, unknown> = {}) => ({
  email: 'jana@example.cz',
  ticker: 'IVV',
  amountCzk: 100_000,
  conversionRatePct: 0.5,
  requestId: uuid(),
  company: '',
  ...patch,
})
const post = (b: unknown, headers: Record<string, string> = {}) =>
  new Request('http://localhost/api/lead', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:5173', ...headers },
    body: typeof b === 'string' ? b : JSON.stringify(b),
  })

function setup(opts: { config?: Partial<LeadConfig>; behaviour?: () => Promise<SendOutcome | null> } = {}) {
  const provider = new MockEmailProvider(10, opts.behaviour)
  const sendSpy = vi.spyOn(provider, 'send')
  const logs: LogEvent[] = []
  const handle = createLeadHandler({ config: { ...baseConfig, ...opts.config }, provider, log: (e) => logs.push(e) })
  return { provider, sendSpy, logs, handle }
}

const read = async (res: Response) => ({ status: res.status, json: (await res.json()) as Record<string, unknown> })

describe('POST /api/lead – happy path', () => {
  it('sends the email and confirms only after the provider accepted it', async () => {
    const { handle, sendSpy, provider } = setup()
    const r = await read(await handle(post(body()), '1.1.1.1'))
    expect(r).toEqual({ status: 200, json: { status: 'sent', delivery: 'mock' } })
    expect(sendSpy).toHaveBeenCalledTimes(1)
    const [email, opts] = sendSpy.mock.calls[0]
    expect(email.to).toBe('jana@example.cz')
    expect(email.text.replace(/ /g, ' ')).toContain('≈ 161 Kč') // IVV tax at 100 000 Kč (research F3)
    expect(opts.idempotencyKey).toMatch(/^lead-3f2b8c1e-/)
    expect(provider.entries()).toHaveLength(1)
  })

  it('never logs the email address or IP', async () => {
    const { handle, logs } = setup()
    await handle(post(body()), '9.9.9.9')
    await handle(post(body({ email: 'bad' })), '9.9.9.9')
    expect(JSON.stringify(logs)).not.toMatch(/jana|example\.cz|9\.9\.9\.9/)
  })
})

describe('validation and request hygiene', () => {
  it('rejects an invalid email with 400 invalid_email and sends nothing', async () => {
    const { handle, sendSpy } = setup()
    expect(await read(await handle(post(body({ email: 'jana@' })), 'ip'))).toEqual({ status: 400, json: { status: 'error', code: 'invalid_email' } })
    expect(sendSpy).not.toHaveBeenCalled()
  })

  it.each([
    [{ ticker: 'QQQ' }],
    [{ amountCzk: 5 }],
    [{ conversionRatePct: 7 }],
    [{ requestId: 'x' }],
  ])('rejects invalid input %j', async (patch) => {
    const { handle, sendSpy } = setup()
    expect((await handle(post(body(patch)), 'ip')).status).toBe(400)
    expect(sendSpy).not.toHaveBeenCalled()
  })

  it('rejects malformed JSON, wrong content type, wrong method and oversized bodies', async () => {
    const { handle } = setup()
    expect((await handle(post('{nope'), 'ip')).status).toBe(400)
    expect((await handle(post(body(), { 'Content-Type': 'text/plain' }), 'ip')).status).toBe(415)
    expect((await handle(new Request('http://localhost/api/lead', { method: 'GET' }), 'ip')).status).toBe(405)
    expect((await handle(post({ ...body(), pad: 'x'.repeat(MAX_BODY_BYTES) }), 'ip')).status).toBe(413)
  })

  it('enforces allowed origins when configured', async () => {
    const { handle } = setup({ config: { allowedOrigins: ['https://example.cz'] } })
    expect((await handle(post(body(), { Origin: 'https://evil.example' }), 'ip')).status).toBe(403)
    expect((await handle(post(body(), { Origin: 'https://example.cz' }), 'ip')).status).toBe(200)
  })
})

describe('honeypot', () => {
  it('answers like a success but sends nothing when the hidden field is filled', async () => {
    const { handle, sendSpy, logs } = setup()
    const r = await read(await handle(post(body({ company: 'ACME' })), 'ip'))
    expect(r.status).toBe(200)
    expect(sendSpy).not.toHaveBeenCalled()
    expect(logs).toContainEqual({ event: 'lead_honeypot' })
  })
})

describe('duplicate submissions', () => {
  it('a repeated request with the same requestId does not send a second email', async () => {
    const { handle, sendSpy } = setup()
    const b = body()
    expect((await handle(post(b), 'ip')).status).toBe(200)
    expect((await handle(post(b), 'ip')).status).toBe(200)
    expect(sendSpy).toHaveBeenCalledTimes(1)
  })

  it('concurrent double submits (double click) share one send', async () => {
    let release!: () => void
    const gate = new Promise<void>((r) => (release = r))
    const { handle, sendSpy } = setup({ behaviour: async () => (await gate, null) })
    const b = body()
    const a1 = handle(post(b), 'ip')
    const a2 = handle(post(b), 'ip')
    release()
    expect((await a1).status).toBe(200)
    expect((await a2).status).toBe(200)
    expect(sendSpy).toHaveBeenCalledTimes(1)
  })

  it('refuses to reuse a requestId for a different payload', async () => {
    const { handle } = setup()
    const b = body()
    await handle(post(b), 'ip')
    expect((await handle(post({ ...b, ticker: 'VOO' }), 'ip')).status).toBe(409)
  })
})

describe('provider failures and timeouts', () => {
  it('a provider timeout returns 504 unconfirmed – never success', async () => {
    const { handle } = setup({ behaviour: async () => ({ ok: false, kind: 'timeout', detail: 'provider timeout' }) })
    expect(await read(await handle(post(body()), 'ip'))).toEqual({ status: 504, json: { status: 'error', code: 'unconfirmed' } })
  })

  it('retrying an unconfirmed send reuses the same idempotency key (provider deduplicates)', async () => {
    let calls = 0
    const behaviour = async (): Promise<SendOutcome | null> => (++calls === 1 ? { ok: false, kind: 'timeout', detail: 't' } : null)
    const { handle, sendSpy } = setup({ behaviour })
    const b = body()
    expect((await handle(post(b), 'ip')).status).toBe(504)
    expect((await handle(post(b), 'ip')).status).toBe(200)
    const keys = sendSpy.mock.calls.map((c) => c[1].idempotencyKey)
    expect(keys).toHaveLength(2)
    expect(keys[0]).toBe(keys[1])
  })

  it.each([
    ['rejected', 502, 'send_failed'],
    ['rate_limited', 503, 'unavailable'],
    ['config', 503, 'unavailable'],
    ['unknown', 504, 'unconfirmed'],
  ] as const)('provider "%s" → %d %s', async (kind, status, code) => {
    const { handle } = setup({ behaviour: async () => ({ ok: false, kind, detail: 'x' }) })
    expect(await read(await handle(post(body()), 'ip'))).toEqual({ status, json: { status: 'error', code } })
  })

  it('an exception inside the provider is reported as unconfirmed, not success', async () => {
    const throwing: EmailProvider = {
      mode: 'mock',
      send: async () => {
        throw new Error('boom')
      },
    }
    const handle = createLeadHandler({ config: baseConfig, provider: throwing })
    expect((await handle(post(body()), 'ip')).status).toBe(504)
  })
})

describe('resend ("pošlete znovu") and abuse limits', () => {
  it('a new send intent (new requestId) sends again, up to the per-address limit', async () => {
    const { handle, sendSpy } = setup({ config: { limits: { perIp: { max: 100, windowMs: 60_000 }, perAddress: { max: 2, windowMs: 3_600_000 } } } })
    expect((await handle(post(body()), 'ip')).status).toBe(200)
    expect((await handle(post(body()), 'ip')).status).toBe(200) // resend
    const third = await handle(post(body()), 'ip')
    expect(third.status).toBe(429)
    expect(third.headers.get('Retry-After')).toBeTruthy()
    expect(sendSpy).toHaveBeenCalledTimes(2)
  })

  it('the per-address limit ignores letter case and surrounding spaces', async () => {
    const { handle } = setup({ config: { limits: { perIp: { max: 100, windowMs: 60_000 }, perAddress: { max: 1, windowMs: 3_600_000 } } } })
    expect((await handle(post(body({ email: 'Jana@Example.cz' })), 'ip')).status).toBe(200)
    expect((await handle(post(body({ email: ' jana@example.cz ' })), 'ip')).status).toBe(429)
  })

  it('limits requests per IP, valid or not', async () => {
    const { handle } = setup({ config: { limits: { perIp: { max: 2, windowMs: 60_000 }, perAddress: { max: 10, windowMs: 3_600_000 } } } })
    expect((await handle(post(body({ email: 'x' })), '7.7.7.7')).status).toBe(400)
    expect((await handle(post(body()), '7.7.7.7')).status).toBe(200)
    expect((await handle(post(body()), '7.7.7.7')).status).toBe(429)
    expect((await handle(post(body()), '8.8.8.8')).status).toBe(200) // other IPs unaffected
  })
})
