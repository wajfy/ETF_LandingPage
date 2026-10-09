import { afterEach, describe, expect, it, vi } from 'vitest'
import { REAL_DELIVERY_ACK } from '../config'
import { createLeadEndpoint } from './endpoint'

const quiet = () => {}
afterEach(() => vi.restoreAllMocks())

describe('createLeadEndpoint – choosing the delivery mode', () => {
  it('uses mock delivery when nothing is configured', () => {
    vi.spyOn(console, 'info').mockImplementation(quiet)
    const ep = createLeadEndpoint({}, quiet)
    expect(ep.mode).toBe('mock')
    expect(ep.mockOutbox).not.toBeNull()
  })

  it('disables the endpoint (503) when real delivery is requested but incomplete – no silent mock fallback', async () => {
    vi.spyOn(console, 'error').mockImplementation(quiet)
    const ep = createLeadEndpoint({ EMAIL_DELIVERY_MODE: 'resend', RESEND_API_KEY: 're_x' }, quiet)
    expect(ep.mode).toBe('misconfigured')
    expect(ep.mockOutbox).toBeNull()
    const res = await ep.handle(new Request('http://x/api/lead', { method: 'POST' }), 'ip')
    expect(res.status).toBe(503)
    expect(await res.json()).toEqual({ status: 'error', code: 'unavailable' })
  })

  it('selects Resend only with the complete, acknowledged configuration (no request is made here)', () => {
    vi.spyOn(console, 'info').mockImplementation(quiet)
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const ep = createLeadEndpoint(
      {
        EMAIL_DELIVERY_MODE: 'resend',
        EMAIL_DELIVERY_CONFIRM: REAL_DELIVERY_ACK,
        RESEND_API_KEY: 're_test_key',
        EMAIL_FROM: 'Prověrka ETF <srovnani@example.cz>',
        EMAIL_OPERATOR_LINE: 'Provozovatel: Test s.r.o.',
        ALLOWED_ORIGINS: 'https://example.cz',
      },
      quiet,
    )
    expect(ep.mode).toBe('resend')
    expect(ep.mockOutbox).toBeNull()
    expect(fetchSpy).not.toHaveBeenCalled()
  })
})
