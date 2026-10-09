/**
 * Lead / email configuration from environment variables (server-side only; never VITE_-prefixed,
 * so Vite never exposes them to the browser bundle).
 *
 * Delivery mode is explicit and hard to misconfigure:
 * - "mock" (default when EMAIL_DELIVERY_MODE is unset outside production): nothing leaves the server.
 * - "resend": real delivery. Requires ALL of: EMAIL_DELIVERY_MODE=resend, the acknowledgement
 *   EMAIL_DELIVERY_CONFIRM=send-real-emails, RESEND_API_KEY, EMAIL_FROM on a verified domain
 *   (not resend.dev), EMAIL_OPERATOR_LINE and ALLOWED_ORIGINS. Anything missing → the endpoint
 *   refuses to run (503), it never silently falls back to mock or pretends to send.
 * - In production (NODE_ENV/VERCEL_ENV = production) the mode must be set explicitly.
 * - On the live production deployment (VERCEL_ENV=production) mock is refused: visitors must never
 *   see a confirmation for an email that was not sent. (Preview deployments may still use mock.)
 */

export type DeliveryMode = 'mock' | 'resend'

export interface LeadConfig {
  mode: DeliveryMode
  resend?: { apiKey: string; from: string; replyTo?: string }
  /** Footer identity line for the email; required for real delivery (operator identity is a launch blocker). */
  operatorLine?: string
  /** Allowed request origins; null = do not check (local mock only). */
  allowedOrigins: string[] | null
  /** How long to wait for the provider before reporting "unconfirmed". */
  providerTimeoutMs: number
  limits: {
    /** Requests per IP per window (all requests, valid or not). */
    perIp: { max: number; windowMs: number }
    /** Successful sends per recipient address per window. */
    perAddress: { max: number; windowMs: number }
  }
}

export type ConfigResult = { ok: true; config: LeadConfig; warnings: string[] } | { ok: false; error: string }

type Env = Record<string, string | undefined>

export const REAL_DELIVERY_ACK = 'send-real-emails'

/**
 * Allowed provider timeout. The upper bound keeps the chain provider < browser (CLIENT_TIMEOUT_MS,
 * 20 s) < function limit (vercel.json maxDuration, 25 s), so a slow provider ends as "unconfirmed"
 * on the server before the browser gives up or the platform cuts the function off.
 */
export const PROVIDER_TIMEOUT_RANGE_MS = { min: 1_000, max: 15_000 } as const

const DEFAULT_LIMITS: LeadConfig['limits'] = {
  perIp: { max: 10, windowMs: 10 * 60_000 },
  perAddress: { max: 3, windowMs: 24 * 60 * 60_000 },
}

const isProduction = (env: Env) => env.VERCEL_ENV === 'production' || env.NODE_ENV === 'production'

function parseOrigins(raw: string | undefined): string[] | null {
  const list = (raw ?? '')
    .split(',')
    .map((s) => s.trim().replace(/\/$/, ''))
    .filter(Boolean)
  return list.length ? list : null
}

export function loadLeadConfig(env: Env): ConfigResult {
  const warnings: string[] = []
  const rawMode = env.EMAIL_DELIVERY_MODE?.trim().toLowerCase()
  const timeout = Number(env.EMAIL_PROVIDER_TIMEOUT_MS ?? 10_000)
  const providerTimeoutMs =
    Number.isFinite(timeout) && timeout >= PROVIDER_TIMEOUT_RANGE_MS.min && timeout <= PROVIDER_TIMEOUT_RANGE_MS.max ? timeout : 10_000

  if (rawMode !== undefined && rawMode !== '' && rawMode !== 'mock' && rawMode !== 'resend') {
    return { ok: false, error: `EMAIL_DELIVERY_MODE must be "mock" or "resend" (got "${rawMode}")` }
  }
  if (!rawMode && isProduction(env)) {
    return { ok: false, error: 'EMAIL_DELIVERY_MODE must be set explicitly in production' }
  }
  if (rawMode !== 'resend' && env.VERCEL_ENV === 'production') {
    return { ok: false, error: 'Mock delivery is not allowed on the production deployment (VERCEL_ENV=production)' }
  }

  if (rawMode === 'resend') {
    const missing: string[] = []
    if (env.EMAIL_DELIVERY_CONFIRM !== REAL_DELIVERY_ACK) missing.push(`EMAIL_DELIVERY_CONFIRM=${REAL_DELIVERY_ACK}`)
    const apiKey = env.RESEND_API_KEY?.trim()
    if (!apiKey || !apiKey.startsWith('re_')) missing.push('RESEND_API_KEY (starts with "re_")')
    const from = env.EMAIL_FROM?.trim()
    const fromDomain = from?.match(/@([^>\s]+)>?$/)?.[1]?.toLowerCase()
    if (!from || !fromDomain) missing.push('EMAIL_FROM (e.g. "Prověrka ETF <srovnani@vase-domena.cz>")')
    else if (fromDomain === 'resend.dev' || fromDomain.endsWith('.resend.dev'))
      missing.push('EMAIL_FROM on your own verified domain (resend.dev test sender is not allowed)')
    const operatorLine = env.EMAIL_OPERATOR_LINE?.trim()
    if (!operatorLine) missing.push('EMAIL_OPERATOR_LINE (operator name, address, IČO, contact)')
    const allowedOrigins = parseOrigins(env.ALLOWED_ORIGINS)
    if (!allowedOrigins) missing.push('ALLOWED_ORIGINS (e.g. https://vase-domena.cz)')
    if (missing.length) return { ok: false, error: `Real email delivery is not fully configured. Missing: ${missing.join('; ')}` }
    return {
      ok: true,
      warnings,
      config: {
        mode: 'resend',
        resend: { apiKey: apiKey!, from: from!, replyTo: env.EMAIL_REPLY_TO?.trim() || undefined },
        operatorLine,
        allowedOrigins,
        providerTimeoutMs,
        limits: DEFAULT_LIMITS,
      },
    }
  }

  // Mock mode.
  if (env.RESEND_API_KEY) warnings.push('RESEND_API_KEY is set, but EMAIL_DELIVERY_MODE is not "resend" – using MOCK delivery, nothing is sent.')
  return {
    ok: true,
    warnings,
    config: {
      mode: 'mock',
      operatorLine: env.EMAIL_OPERATOR_LINE?.trim() || undefined,
      allowedOrigins: parseOrigins(env.ALLOWED_ORIGINS),
      providerTimeoutMs,
      limits: DEFAULT_LIMITS,
    },
  }
}
