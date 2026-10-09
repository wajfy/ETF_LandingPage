import { describe, expect, it } from 'vitest'
import { isValidEmail, isOnRateStep, validateLeadBody } from './validation'

const tickers = ['IVV', 'VOO']
const good = {
  email: 'jana.novakova@example.cz',
  ticker: 'IVV',
  amountCzk: 100_000,
  conversionRatePct: 0.5,
  requestId: '3f2b8c1e-4d5a-4b6c-8d7e-9f0a1b2c3d4e',
  company: '',
}

describe('email validation', () => {
  it.each(['jana@example.cz', 'j.novak+etf@mail.example.com', '  jana@example.cz  '])('accepts %s', (e) => {
    expect(isValidEmail(e)).toBe(true)
  })
  it.each(['', 'jana', 'jana@', '@example.cz', 'jana@example', 'jana novak@example.cz', 'jana@@example.cz', `${'a'.repeat(65)}@example.cz`, `a@${'b'.repeat(250)}.cz`])(
    'rejects "%s"',
    (e) => {
      expect(isValidEmail(e)).toBe(false)
    },
  )
})

describe('request body validation', () => {
  it('accepts a well-formed body and trims the email', () => {
    const r = validateLeadBody({ ...good, email: ' jana@example.cz ' }, tickers)
    expect(r).toEqual({ ok: true, value: { ...good, email: 'jana@example.cz' } })
  })

  it.each([
    [{ email: 'nope' }, 'invalid_email', 'email'],
    [{ ticker: 'QQQ' }, 'invalid_input', 'ticker'],
    [{ amountCzk: 999 }, 'invalid_input', 'amountCzk'],
    [{ amountCzk: 10_000_001 }, 'invalid_input', 'amountCzk'],
    [{ amountCzk: 1500.5 }, 'invalid_input', 'amountCzk'],
    [{ conversionRatePct: 1.05 }, 'invalid_input', 'conversionRatePct'],
    [{ conversionRatePct: 0.33 }, 'invalid_input', 'conversionRatePct'],
    [{ requestId: 'not-a-uuid' }, 'invalid_input', 'requestId'],
    [{ company: 42 }, 'invalid_input', 'company'],
  ])('rejects %j', (patch, code, field) => {
    expect(validateLeadBody({ ...good, ...patch }, tickers)).toEqual({ ok: false, code, field })
  })

  it('rejects non-object bodies', () => {
    expect(validateLeadBody(null, tickers).ok).toBe(false)
    expect(validateLeadBody([good], tickers).ok).toBe(false)
  })

  it('accepts every slider step, tolerating float noise', () => {
    for (let i = 0; i <= 20; i++) expect(isOnRateStep(i * 0.05)).toBe(true)
  })
})
