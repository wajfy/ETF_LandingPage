/**
 * Event semantics of the lead flow, kept out of the component so they can be tested:
 *
 * - lead_submitted        – a request was actually sent to /api/lead (client validation passed).
 *                           attempt "retry" = the same send intent re-sent after an error.
 * - lead_email_accepted   – the server answered 200 "sent", which it does ONLY after the email
 *                           provider accepted the email (README §13). Acceptance, not inbox delivery.
 *                           At most once per send intent. accepted_on_page = 1 for the first
 *                           acceptance on this page load (both forms together), 2 for the next, …
 * - lead_form_error       – client validation failed, or the attempt ended without confirmation.
 *                           "unconfirmed" (timeout, network error, 504) is an error, never a success.
 *
 * Request ids stay inside this object (memory only) to tell retries apart; they are never put in
 * an event.
 */
import type { LeadOutcome } from '../lead/client'
import { amountBucket, rateBucket, type LeadPosition } from './events'
import type { Tracker } from './tracker'

export interface LeadSelection {
  position: LeadPosition
  ticker: string
  amountCzk: number
  conversionRatePct: number
}

/** Accepted sends per page load, shared by both forms (one tracker per page load). Memory only. */
const acceptedPerPage = new WeakMap<Tracker, number>()

export class LeadFunnel {
  private readonly tracker: Tracker
  private readonly attempted = new Set<string>()
  private readonly accepted = new Set<string>()

  constructor(tracker: Tracker) {
    this.tracker = tracker
  }

  invalidEmail(position: LeadPosition): void {
    this.tracker.track('lead_form_error', { position, error_type: 'invalid_email' })
  }

  submitted(requestId: string, s: LeadSelection): void {
    const attempt = this.attempted.has(requestId) ? 'retry' : 'first'
    this.attempted.add(requestId)
    this.tracker.track('lead_submitted', {
      position: s.position,
      ticker: s.ticker,
      amount_bucket: amountBucket(s.amountCzk),
      rate_bucket: rateBucket(s.conversionRatePct),
      attempt,
    })
  }

  outcome(requestId: string, s: LeadSelection, outcome: LeadOutcome): void {
    if (outcome.status === 'sent') {
      if (this.accepted.has(requestId)) return // a confirmed intent is counted once
      this.accepted.add(requestId)
      const n = (acceptedPerPage.get(this.tracker) ?? 0) + 1
      acceptedPerPage.set(this.tracker, n)
      this.tracker.track('lead_email_accepted', {
        position: s.position,
        ticker: s.ticker,
        amount_bucket: amountBucket(s.amountCzk),
        delivery: outcome.delivery,
        accepted_on_page: n,
      })
      return
    }
    this.tracker.track('lead_form_error', { position: s.position, error_type: outcome.code })
  }
}
