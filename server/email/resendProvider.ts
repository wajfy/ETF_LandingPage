/**
 * Resend adapter (official SDK, HTTPS API – no SMTP).
 * - Sends every request with an Idempotency-Key, so a retry of the same intent cannot create a
 *   second email (Resend keeps keys for 24 h and returns the original result).
 * - Enforces a timeout with AbortController. A timeout is reported as "timeout" (= unconfirmed),
 *   never as success; the caller may retry with the same key.
 * - Maps Resend error codes to outcomes; never logs or returns the recipient address.
 */
import { Resend } from 'resend'
import type { EmailProvider, OutgoingEmail, SendFailureKind, SendOptions, SendOutcome } from './provider.js'

/** The part of the SDK we use – lets tests inject a fake client. */
export interface ResendLikeClient {
  emails: {
    send: Resend['emails']['send']
  }
}

const KIND_BY_CODE: Record<string, SendFailureKind> = {
  rate_limit_exceeded: 'rate_limited',
  daily_quota_exceeded: 'rate_limited',
  monthly_quota_exceeded: 'rate_limited',
  missing_api_key: 'config',
  invalid_api_key: 'config',
  restricted_api_key: 'config',
  invalid_from_address: 'config',
  invalid_access: 'config',
  security_error: 'config',
  // Another request with the same key is still in flight – acceptance unknown, retry is safe.
  concurrent_idempotent_requests: 'unknown',
  // Same key reused with a different payload (e.g. data changed by a redeploy between attempts):
  // the first attempt may have been delivered, so this is "unknown", not a plain failure.
  invalid_idempotent_request: 'unknown',
  // Provider-side failure – we cannot be sure nothing was queued, so report "unknown" (retry-safe).
  application_error: 'unknown',
  internal_server_error: 'unknown',
}

export class ResendEmailProvider implements EmailProvider {
  readonly mode = 'resend' as const
  private readonly client: ResendLikeClient
  private readonly from: string
  private readonly replyTo?: string

  constructor(apiKey: string, from: string, replyTo?: string, client?: ResendLikeClient) {
    this.from = from
    this.replyTo = replyTo
    this.client = client ?? new Resend(apiKey)
  }

  async send(email: OutgoingEmail, opts: SendOptions): Promise<SendOutcome> {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), opts.timeoutMs)
    try {
      const { data, error } = await this.client.emails.send(
        {
          from: this.from,
          to: email.to,
          subject: email.subject,
          html: email.html,
          text: email.text,
          ...(this.replyTo ? { replyTo: this.replyTo } : {}),
        },
        { idempotencyKey: opts.idempotencyKey, signal: ctrl.signal },
      )
      if (ctrl.signal.aborted) return { ok: false, kind: 'timeout', detail: 'provider timeout' }
      if (data?.id) return { ok: true, id: data.id }
      const code = error?.name ?? 'unknown'
      const status = error?.statusCode ?? null
      const kind: SendFailureKind = KIND_BY_CODE[code] ?? (status !== null && status >= 500 ? 'unknown' : 'rejected')
      return { ok: false, kind, detail: `${code}${status ? ` (${status})` : ''}` }
    } catch (err) {
      if (ctrl.signal.aborted) return { ok: false, kind: 'timeout', detail: 'provider timeout' }
      return { ok: false, kind: 'unknown', detail: err instanceof Error ? err.name : 'transport error' }
    } finally {
      clearTimeout(timer)
    }
  }
}
