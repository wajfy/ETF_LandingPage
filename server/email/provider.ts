/** Email provider adapter – the handler only knows this interface (mock or Resend behind it). */
import type { DeliveryMode } from '../config'

export interface OutgoingEmail {
  to: string
  subject: string
  html: string
  text: string
}

export type SendFailureKind =
  /** The provider did not answer in time – the email MAY have been accepted. */
  | 'timeout'
  /** Transport error or provider-side error where acceptance is unknown. */
  | 'unknown'
  /** The provider definitely rejected the request (validation etc.). */
  | 'rejected'
  /** Provider rate limit or quota. */
  | 'rate_limited'
  /** Bad credentials / sender – a configuration problem. */
  | 'config'

export type SendOutcome = { ok: true; id: string } | { ok: false; kind: SendFailureKind; detail: string }

export interface SendOptions {
  /** Same key for retries of the same send intent → the provider sends at most once. */
  idempotencyKey: string
  timeoutMs: number
}

export interface EmailProvider {
  readonly mode: DeliveryMode
  send(email: OutgoingEmail, opts: SendOptions): Promise<SendOutcome>
}
