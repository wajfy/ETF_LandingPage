import { describe, expect, it, vi } from 'vitest'
import { newRequestId, submitLead } from './client'

const body = {
  email: 'jana@example.cz',
  ticker: 'IVV',
  amountCzk: 100_000,
  conversionRatePct: 0.5,
  requestId: newRequestId(),
}

const respond = (status: number, json: unknown) =>
  vi.fn(async () => new Response(JSON.stringify(json), { status, headers: { 'Content-Type': 'application/json' } }))

describe('submitLead', () => {
  it('reports success only for 200 + status "sent" from the server', async () => {
    expect(await submitLead(body, { fetchImpl: respond(200, { status: 'sent', delivery: 'resend' }) })).toEqual({ status: 'sent', delivery: 'resend' })
    expect(await submitLead(body, { fetchImpl: respond(200, { status: 'sent', delivery: 'mock' }) })).toEqual({ status: 'sent', delivery: 'mock' })
  })

  it('never treats a 200 without confirmation as success', async () => {
    expect(await submitLead(body, { fetchImpl: respond(200, {}) })).toEqual({ status: 'error', code: 'send_failed' })
    const html = vi.fn(async () => new Response('<html>ok</html>', { status: 200 }))
    expect(await submitLead(body, { fetchImpl: html })).toEqual({ status: 'error', code: 'send_failed' })
  })

  it.each([
    [400, { code: 'invalid_email' }, 'invalid_email'],
    [502, { code: 'send_failed' }, 'send_failed'],
    [504, { code: 'unconfirmed' }, 'unconfirmed'],
    [429, { code: 'rate_limited' }, 'rate_limited'],
    [503, { code: 'unavailable' }, 'unavailable'],
    [500, {}, 'send_failed'],
  ])('maps HTTP %d to %s', async (status, json, code) => {
    expect(await submitLead(body, { fetchImpl: respond(status, json) })).toEqual({ status: 'error', code })
  })

  it('treats a network failure as unconfirmed (the server may have sent)', async () => {
    const fail = vi.fn(async () => {
      throw new TypeError('Failed to fetch')
    })
    expect(await submitLead(body, { fetchImpl: fail })).toEqual({ status: 'error', code: 'unconfirmed' })
  })

  it('treats a client timeout as unconfirmed', async () => {
    const hang = vi.fn(
      (_url: RequestInfo | URL, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => init?.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')))),
    )
    expect(await submitLead(body, { fetchImpl: hang as unknown as typeof fetch, timeoutMs: 20 })).toEqual({ status: 'error', code: 'unconfirmed' })
  })

  it('posts JSON to /api/lead with the given requestId', async () => {
    const f = respond(200, { status: 'sent', delivery: 'mock' })
    await submitLead(body, { fetchImpl: f })
    const [url, init] = f.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('/api/lead')
    expect(init.method).toBe('POST')
    expect(JSON.parse(String(init.body))).toMatchObject({ requestId: body.requestId, email: body.email })
  })

  it('generates a fresh UUID per send intent', () => {
    expect(newRequestId()).not.toBe(newRequestId())
  })
})
