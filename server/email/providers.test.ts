import { describe, expect, it, vi } from 'vitest'
import { maskEmail, MockEmailProvider } from './mockProvider'
import { ResendEmailProvider, type ResendLikeClient } from './resendProvider'

const email = { to: 'jana.novakova@example.cz', subject: 'S', html: '<p>H</p>', text: 'T' }
const opts = { idempotencyKey: 'lead-abc', timeoutMs: 1_000 }

describe('MockEmailProvider', () => {
  it('accepts without any network access and keeps a masked outbox entry', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const mock = new MockEmailProvider()
    const r = await mock.send(email, opts)
    expect(r.ok).toBe(true)
    expect(fetchSpy).not.toHaveBeenCalled()
    expect(mock.entries()[0].toMasked).toBe('j***@e***.cz')
    expect(JSON.stringify(mock.entries())).not.toContain('jana.novakova')
    fetchSpy.mockRestore()
  })

  it('honours idempotency keys like the real provider', async () => {
    const mock = new MockEmailProvider()
    const a = await mock.send(email, opts)
    const b = await mock.send(email, opts)
    expect(a).toEqual(b)
    expect(mock.entries()).toHaveLength(1)
  })

  it('keeps only a bounded number of entries in memory', async () => {
    const mock = new MockEmailProvider(2)
    for (let i = 0; i < 5; i++) await mock.send(email, { ...opts, idempotencyKey: `k${i}` })
    expect(mock.entries()).toHaveLength(2)
  })

  it('masks addresses', () => {
    expect(maskEmail('a@b.cz')).toBe('a***@b***.cz')
  })
})

function fakeClient(impl: ResendLikeClient['emails']['send']): ResendLikeClient {
  return { emails: { send: impl } }
}

describe('ResendEmailProvider (fake SDK client – never contacts Resend)', () => {
  it('sends with the idempotency key and returns the provider id', async () => {
    const send = vi.fn(async () => ({ data: { id: 're_email_1' }, error: null, headers: null }))
    const p = new ResendEmailProvider('re_x', 'Prověrka ETF <a@example.cz>', undefined, fakeClient(send as never))
    expect(await p.send(email, opts)).toEqual({ ok: true, id: 're_email_1' })
    const [payload, reqOpts] = send.mock.calls[0] as unknown as [Record<string, unknown>, Record<string, unknown>]
    expect(payload).toMatchObject({ from: 'Prověrka ETF <a@example.cz>', to: email.to, subject: 'S', html: '<p>H</p>', text: 'T' })
    expect(reqOpts.idempotencyKey).toBe('lead-abc')
    expect(reqOpts.signal).toBeInstanceOf(AbortSignal)
  })

  it.each([
    ['validation_error', 422, 'rejected'],
    ['invalid_from_address', 403, 'config'],
    ['invalid_api_key', 403, 'config'],
    ['rate_limit_exceeded', 429, 'rate_limited'],
    ['daily_quota_exceeded', 429, 'rate_limited'],
    ['concurrent_idempotent_requests', 409, 'unknown'],
    ['invalid_idempotent_request', 409, 'unknown'],
    ['internal_server_error', 500, 'unknown'],
  ])('maps %s (%d) to "%s"', async (name, statusCode, kind) => {
    const send = vi.fn(async () => ({ data: null, error: { name, statusCode, message: 'x' }, headers: null }))
    const p = new ResendEmailProvider('re_x', 'a@example.cz', undefined, fakeClient(send as never))
    const r = await p.send(email, opts)
    expect(r).toMatchObject({ ok: false, kind })
    expect(JSON.stringify(r)).not.toContain(email.to)
  })

  it('reports a timeout (not success) when the provider does not answer in time', async () => {
    const send = vi.fn(
      (_payload: unknown, o?: { signal?: AbortSignal }) =>
        new Promise((_resolve, reject) => o?.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')))),
    )
    const p = new ResendEmailProvider('re_x', 'a@example.cz', undefined, fakeClient(send as never))
    expect(await p.send(email, { ...opts, timeoutMs: 20 })).toEqual({ ok: false, kind: 'timeout', detail: 'provider timeout' })
  })

  it('reports transport errors as unknown (acceptance unknown, retry-safe)', async () => {
    const send = vi.fn(async () => {
      throw new TypeError('fetch failed')
    })
    const p = new ResendEmailProvider('re_x', 'a@example.cz', undefined, fakeClient(send as never))
    expect(await p.send(email, opts)).toMatchObject({ ok: false, kind: 'unknown' })
  })
})
