/**
 * Browser client for POST /api/lead.
 * Success is reported ONLY when the server answers 200 with status "sent" – i.e. after the email
 * provider accepted the request (or, in mock mode, the mock outbox did). A network error or timeout
 * is "unconfirmed", never success; retrying with the same requestId is safe (no duplicate email).
 */
import type { LeadRequestBody } from './validation'

export type DeliveryMode = 'mock' | 'resend'

export type LeadErrorCode = 'invalid_email' | 'send_failed' | 'unconfirmed' | 'rate_limited' | 'unavailable'

export type LeadOutcome =
  | { status: 'sent'; delivery: DeliveryMode }
  | { status: 'error'; code: LeadErrorCode }

export const CLIENT_TIMEOUT_MS = 20_000

export function newRequestId(): string {
  return crypto.randomUUID()
}

function mapError(httpStatus: number, code: unknown): LeadErrorCode {
  if (code === 'invalid_email') return 'invalid_email'
  if (code === 'unconfirmed' || httpStatus === 504) return 'unconfirmed'
  if (code === 'rate_limited' || httpStatus === 429) return 'rate_limited'
  if (httpStatus === 503) return 'unavailable'
  return 'send_failed'
}

export async function submitLead(
  body: LeadRequestBody,
  opts: { fetchImpl?: typeof fetch; timeoutMs?: number } = {},
): Promise<LeadOutcome> {
  const fetchImpl = opts.fetchImpl ?? fetch
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), opts.timeoutMs ?? CLIENT_TIMEOUT_MS)
  try {
    const res = await fetchImpl('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    })
    let json: Record<string, unknown> = {}
    try {
      json = (await res.json()) as Record<string, unknown>
    } catch {
      // Non-JSON answer (e.g. a proxy error page): treat as a failure below.
    }
    if (res.status === 200 && json.status === 'sent' && (json.delivery === 'mock' || json.delivery === 'resend')) {
      return { status: 'sent', delivery: json.delivery }
    }
    return { status: 'error', code: mapError(res.status, json.code) }
  } catch {
    // Network failure or client timeout: the server may or may not have sent the email.
    return { status: 'error', code: 'unconfirmed' }
  } finally {
    clearTimeout(timer)
  }
}
