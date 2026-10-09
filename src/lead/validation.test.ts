import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { HONEYPOT_FIELD, isValidEmail, isOnRateStep, validateLeadBody } from './validation'

const tickers = ['IVV', 'VOO']
const good = {
  email: 'jana.novakova@example.cz',
  ticker: 'IVV',
  amountCzk: 100_000,
  conversionRatePct: 0.5,
  requestId: '3f2b8c1e-4d5a-4b6c-8d7e-9f0a1b2c3d4e',
  topic: '',
}

describe('email validation', () => {
  it.each([
    'jana@example.cz',
    'j.novak+etf@mail.example.com',
    '  jana@example.cz  ',
    'Jana.Novakova@Example.CZ',
    "o'brien@example.co.uk",
    'jana_n-2@sub-domain.example.cz',
    'jana@example.xn--p1ai',
    `${'a'.repeat(64)}@example.cz`,
  ])('accepts %s', (e) => {
    expect(isValidEmail(e)).toBe(true)
  })

  // Plain address only: anything that could make the recipient ambiguous is rejected (M5 audit).
  it.each([
    '"Bank" <victim@example.cz>',
    '"Bank"<victim@example.cz>',
    'Bank <victim@example.cz>',
    'x<victim@example.cz>',
    '<victim@example.cz>',
    'victim@example.cz>',
    'a,b@example.cz',
    'a@example.cz,b@example.cz',
    'a@example.cz;b@example.cz',
    'a;b@example.cz',
    '"jana novak"@example.cz',
    'jana(comment)@example.cz',
    'jana@example.cz (Jana)',
    'jana:x@example.cz',
    'jana\\x@example.cz',
    'jana@[192.168.1.1]',
    'jana@192.168.1.1',
    'jana@example.cz\nBcc: x@example.cz',
    'jana@example.cz\r\nX: y',
  ])('rejects the ambiguous form %j', (e) => {
    expect(isValidEmail(e)).toBe(false)
  })

  it.each([
    '.jana@example.cz',
    'jana.@example.cz',
    'ja..na@example.cz',
    'jana@-example.cz',
    'jana@example-.cz',
    'jana@example..cz',
    'jana@example.c',
    'jana@example.123',
    'jána@example.cz',
    'jana@příklad.cz',
  ])('rejects the malformed %j', (e) => {
    expect(isValidEmail(e)).toBe(false)
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
    [{ email: '"Bank" <victim@example.cz>' }, 'invalid_email', 'email'],
    [{ topic: 42 }, 'invalid_input', 'topic'],
  ])('rejects %j', (patch, code, field) => {
    expect(validateLeadBody({ ...good, ...patch }, tickers)).toEqual({ ok: false, code, field })
  })

  it('reads the honeypot from the renamed field; the old "company" key is ignored', () => {
    expect(HONEYPOT_FIELD).toBe('topic')
    const filled = validateLeadBody({ ...good, topic: 'bot text' }, tickers)
    expect(filled.ok && filled.value.topic).toBe('bot text')
    const legacy = validateLeadBody({ ...good, topic: undefined, company: 'ACME' }, tickers)
    expect(legacy.ok && legacy.value.topic).toBe('')
  })

  it('the honeypot name avoids common autofill vocabulary (an autofilled honeypot = fake success for a person)', () => {
    const autofillHints = /company|organi[sz]ation|firm|name|mail|tel|phone|address|street|city|zip|postal|country|url|website|user|pass|card|cc-|birth/i
    expect(HONEYPOT_FIELD).not.toMatch(autofillHints)
    const form = readFileSync(join(import.meta.dirname, '../components/LeadForm.tsx'), 'utf8')
    expect(form).toContain('name={HONEYPOT_FIELD}')
    expect(form).toContain('[HONEYPOT_FIELD]: honeypot')
    expect(form).not.toMatch(/name="company"|company:/)
  })

  it('rejects non-object bodies', () => {
    expect(validateLeadBody(null, tickers).ok).toBe(false)
    expect(validateLeadBody([good], tickers).ok).toBe(false)
  })

  it('accepts every slider step, tolerating float noise', () => {
    for (let i = 0; i <= 20; i++) expect(isOnRateStep(i * 0.05)).toBe(true)
  })
})
