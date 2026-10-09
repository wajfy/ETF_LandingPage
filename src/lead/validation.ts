/**
 * Lead request validation – shared by the browser form and the server endpoint,
 * so both apply exactly the same rules.
 */
import { CONVERSION_RATE, isValidAmount, isValidRate } from '../domain/calc.js'

export const EMAIL_MAX_LENGTH = 254
export const EMAIL_LOCAL_MAX_LENGTH = 64

/** Name of the hidden honeypot field. Deliberately not a name browsers or password managers autofill. */
export const HONEYPOT_FIELD = 'topic'

/** A request body as sent by the form. `topic` is the honeypot field (must stay empty). */
export interface LeadRequestBody {
  email: string
  ticker: string
  amountCzk: number
  conversionRatePct: number
  /** One id per send intent (UUID). A retry of the same intent reuses it; a new send gets a new one. */
  requestId: string
  topic?: string
}

export type LeadValidation =
  | { ok: true; value: LeadRequestBody & { topic: string } }
  | { ok: false; code: 'invalid_email' | 'invalid_input'; field: string }

/**
 * A plain address only (practical subset of RFC 5321/5322, close to the HTML "valid e-mail address"):
 * - local part: dot-atom characters, no leading/trailing/double dots, no quotes;
 * - domain: at least two LDH labels (letters, digits, inner hyphens) and an alphabetic or punycode TLD.
 * Display names ("Name <a@b.cz>"), quoted strings, comments, lists (",", ";"), spaces, IP literals and
 * non-ASCII characters are rejected, so the recipient can never be ambiguous. (An internationalised
 * domain must be entered in its punycode form.)
 */
const EMAIL_RE =
  /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+(?:[A-Za-z]{2,63}|xn--[A-Za-z0-9-]{1,59})$/
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function normalizeEmail(raw: string): string {
  return raw.trim()
}

export function isValidEmail(raw: string): boolean {
  const email = normalizeEmail(raw)
  return email.length <= EMAIL_MAX_LENGTH && email.indexOf('@') <= EMAIL_LOCAL_MAX_LENGTH && EMAIL_RE.test(email)
}

export function isValidRequestId(id: unknown): id is string {
  return typeof id === 'string' && UUID_RE.test(id)
}

/** The slider moves in fixed steps; reject anything else (tolerating float noise). */
export function isOnRateStep(ratePct: number): boolean {
  const steps = ratePct / CONVERSION_RATE.stepPct
  return Math.abs(steps - Math.round(steps)) < 1e-9
}

export function validateLeadBody(body: unknown, knownTickers: readonly string[]): LeadValidation {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) return { ok: false, code: 'invalid_input', field: 'body' }
  const b = body as Record<string, unknown>

  if (typeof b.email !== 'string' || !isValidEmail(b.email)) return { ok: false, code: 'invalid_email', field: 'email' }
  if (typeof b.ticker !== 'string' || !knownTickers.includes(b.ticker)) return { ok: false, code: 'invalid_input', field: 'ticker' }
  if (typeof b.amountCzk !== 'number' || !isValidAmount(b.amountCzk) || !Number.isInteger(b.amountCzk))
    return { ok: false, code: 'invalid_input', field: 'amountCzk' }
  if (typeof b.conversionRatePct !== 'number' || !isValidRate(b.conversionRatePct) || !isOnRateStep(b.conversionRatePct))
    return { ok: false, code: 'invalid_input', field: 'conversionRatePct' }
  if (!isValidRequestId(b.requestId)) return { ok: false, code: 'invalid_input', field: 'requestId' }
  if (b.topic !== undefined && typeof b.topic !== 'string') return { ok: false, code: 'invalid_input', field: 'topic' }

  return {
    ok: true,
    value: {
      email: normalizeEmail(b.email),
      ticker: b.ticker,
      amountCzk: b.amountCzk,
      conversionRatePct: b.conversionRatePct,
      requestId: b.requestId.toLowerCase(),
      topic: typeof b.topic === 'string' ? b.topic : '',
    },
  }
}
