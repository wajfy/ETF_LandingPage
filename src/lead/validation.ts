/**
 * Lead request validation – shared by the browser form and the server endpoint,
 * so both apply exactly the same rules.
 */
import { CONVERSION_RATE, isValidAmount, isValidRate } from '../domain/calc'

export const EMAIL_MAX_LENGTH = 254

/** A request body as sent by the form. `company` is the honeypot field (must stay empty). */
export interface LeadRequestBody {
  email: string
  ticker: string
  amountCzk: number
  conversionRatePct: number
  /** One id per send intent (UUID). A retry of the same intent reuses it; a new send gets a new one. */
  requestId: string
  company?: string
}

export type LeadValidation =
  | { ok: true; value: LeadRequestBody & { company: string } }
  | { ok: false; code: 'invalid_email' | 'invalid_input'; field: string }

// Pragmatic address check: one @, no spaces, a dot in the domain, sensible lengths.
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@.]+(\.[^\s@.]+)+$/
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function normalizeEmail(raw: string): string {
  return raw.trim()
}

export function isValidEmail(raw: string): boolean {
  const email = normalizeEmail(raw)
  return email.length <= EMAIL_MAX_LENGTH && EMAIL_RE.test(email)
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
  if (b.company !== undefined && typeof b.company !== 'string') return { ok: false, code: 'invalid_input', field: 'company' }

  return {
    ok: true,
    value: {
      email: normalizeEmail(b.email),
      ticker: b.ticker,
      amountCzk: b.amountCzk,
      conversionRatePct: b.conversionRatePct,
      requestId: b.requestId.toLowerCase(),
      company: typeof b.company === 'string' ? b.company : '',
    },
  }
}
