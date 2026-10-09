import { describe, expect, it } from 'vitest'
import { loadLeadConfig, REAL_DELIVERY_ACK } from './config'

const realEnv = {
  EMAIL_DELIVERY_MODE: 'resend',
  EMAIL_DELIVERY_CONFIRM: REAL_DELIVERY_ACK,
  RESEND_API_KEY: 're_test_123',
  EMAIL_FROM: 'Prověrka ETF <srovnani@example.cz>',
  EMAIL_OPERATOR_LINE: 'Provozovatel: Test s.r.o.',
  ALLOWED_ORIGINS: 'https://example.cz',
}

describe('delivery mode configuration', () => {
  it('defaults to mock when nothing is set (local development)', () => {
    const r = loadLeadConfig({})
    expect(r.ok && r.config.mode).toBe('mock')
  })

  it('stays in mock mode even if an API key is present, and warns', () => {
    const r = loadLeadConfig({ RESEND_API_KEY: 're_test_123' })
    expect(r.ok && r.config.mode).toBe('mock')
    expect(r.ok && r.warnings.join(' ')).toMatch(/MOCK/)
  })

  it('accepts real delivery only when fully configured', () => {
    const r = loadLeadConfig(realEnv)
    expect(r.ok && r.config.mode).toBe('resend')
    expect(r.ok && r.config.allowedOrigins).toEqual(['https://example.cz'])
  })

  it.each([
    ['EMAIL_DELIVERY_CONFIRM', /EMAIL_DELIVERY_CONFIRM/],
    ['RESEND_API_KEY', /RESEND_API_KEY/],
    ['EMAIL_FROM', /EMAIL_FROM/],
    ['EMAIL_OPERATOR_LINE', /EMAIL_OPERATOR_LINE/],
    ['ALLOWED_ORIGINS', /ALLOWED_ORIGINS/],
  ])('refuses real delivery without %s (fails closed, no fallback to mock)', (key, msg) => {
    const env: Record<string, string | undefined> = { ...realEnv, [key]: undefined }
    const r = loadLeadConfig(env)
    expect(r.ok).toBe(false)
    expect(!r.ok && r.error).toMatch(msg)
  })

  it('refuses the resend.dev test sender', () => {
    const r = loadLeadConfig({ ...realEnv, EMAIL_FROM: 'onboarding@resend.dev' })
    expect(!r.ok && r.error).toMatch(/verified domain/)
  })

  it('refuses an API key that does not look like a Resend key', () => {
    expect(loadLeadConfig({ ...realEnv, RESEND_API_KEY: 'abc' }).ok).toBe(false)
  })

  it('rejects unknown modes', () => {
    expect(loadLeadConfig({ EMAIL_DELIVERY_MODE: 'smtp' }).ok).toBe(false)
  })

  it('requires an explicit mode in production', () => {
    expect(loadLeadConfig({ NODE_ENV: 'production' }).ok).toBe(false)
    expect(loadLeadConfig({ VERCEL_ENV: 'production' }).ok).toBe(false)
    expect(loadLeadConfig({ NODE_ENV: 'production', EMAIL_DELIVERY_MODE: 'mock' }).ok).toBe(true)
  })

  it('refuses mock delivery on the live production deployment (no fake confirmations for visitors)', () => {
    expect(loadLeadConfig({ VERCEL_ENV: 'production', EMAIL_DELIVERY_MODE: 'mock' }).ok).toBe(false)
    expect(loadLeadConfig({ VERCEL_ENV: 'preview', EMAIL_DELIVERY_MODE: 'mock' }).ok).toBe(true)
  })

  it('clamps the provider timeout to a sane range', () => {
    const r = loadLeadConfig({ EMAIL_PROVIDER_TIMEOUT_MS: '5' })
    expect(r.ok && r.config.providerTimeoutMs).toBe(10_000)
  })
})
