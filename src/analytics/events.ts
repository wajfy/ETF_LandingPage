/**
 * Funnel event catalogue (README §6). Every event has a fixed, allow-listed set of properties;
 * anything else is stripped before an event reaches a sink. No email addresses, IPs, request ids,
 * free text, raw amounts or identifiers of any kind.
 */
import { AMOUNT, CONVERSION_RATE } from '../domain/calc'
import { etfData } from '../domain/etfData'

export type LeadPosition = 'inline' | 'repeat'
export type AmountBucket = '10000' | '50000' | '100000' | 'custom_lt_10k' | 'custom_10k_100k' | 'custom_100k_1m' | 'custom_gt_1m'
export type RateBucket = '0' | '0.05-0.25' | '0.3-0.5' | '0.55-1'
export type LeadErrorType = 'invalid_email' | 'unconfirmed' | 'send_failed' | 'rate_limited' | 'unavailable'
export type DeviceClass = 'mobile' | 'tablet' | 'desktop'

export interface EventPropsMap {
  landing_view: { referrer_host?: string }
  etf_selected: { ticker: string; previous_ticker: string; source: 'picker' | 'comparison'; selection_count: number }
  result_viewed: { ticker: string; amount_bucket: AmountBucket; rate_bucket: RateBucket }
  conversion_rate_changed: { rate_bucket: RateBucket }
  lead_form_viewed: { position: LeadPosition }
  lead_form_started: { position: LeadPosition }
  lead_submitted: { position: LeadPosition; ticker: string; amount_bucket: AmountBucket; rate_bucket: RateBucket; attempt: 'first' | 'retry' }
  /** The email provider ACCEPTED the email (server-confirmed). Not proof of inbox delivery. */
  lead_email_accepted: { position: LeadPosition; ticker: string; amount_bucket: AmountBucket; delivery: 'resend' | 'mock'; accepted_on_page: number }
  lead_form_error: { position: LeadPosition; error_type: LeadErrorType }
  /** Reserved – not emitted. Measuring email opens needs open tracking (pixel / rewritten links); see README §6. */
  guide_opened: Record<string, never>
}

export type EventName = keyof EventPropsMap

/** Coarse page context attached to every event so the funnel can be split without any visitor id. */
export interface EventContext {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  device: DeviceClass
  in_app: boolean
}

export interface AnalyticsEvent<N extends EventName = EventName> {
  name: N
  props: EventPropsMap[N]
  context: EventContext
}

// ---------------------------------------------------------------------------------------------
// Buckets – raw amounts are never sent (an unusual exact amount could single a visitor out).
// ---------------------------------------------------------------------------------------------

export function amountBucket(amountCzk: number): AmountBucket {
  if ((AMOUNT.presets as readonly number[]).includes(amountCzk)) return String(amountCzk) as AmountBucket
  if (amountCzk < 10_000) return 'custom_lt_10k'
  if (amountCzk <= 100_000) return 'custom_10k_100k'
  if (amountCzk <= 1_000_000) return 'custom_100k_1m'
  return 'custom_gt_1m'
}

export function rateBucket(ratePct: number): RateBucket {
  // Integer hundredths avoid float edge cases at the bucket borders (slider step 0.05).
  const h = Math.round(ratePct * 100)
  if (h <= 0) return '0'
  if (h <= 25) return '0.05-0.25'
  if (h <= 50) return '0.3-0.5'
  return '0.55-1'
}

// ---------------------------------------------------------------------------------------------
// Runtime schema: allow-list + value checks. Unknown keys and invalid values are dropped.
// ---------------------------------------------------------------------------------------------

type Check = (v: unknown) => boolean
const oneOf =
  (...values: readonly (string | boolean)[]): Check =>
  (v) =>
    values.includes(v as string)
const TICKERS = etfData.funds.map((f) => f.ticker)
const ticker: Check = oneOf(...TICKERS)
const position: Check = oneOf('inline', 'repeat')
const amount: Check = oneOf('10000', '50000', '100000', 'custom_lt_10k', 'custom_10k_100k', 'custom_100k_1m', 'custom_gt_1m')
const rate: Check = oneOf('0', '0.05-0.25', '0.3-0.5', '0.55-1')
const smallInt: Check = (v) => Number.isInteger(v) && (v as number) >= 1 && (v as number) <= 1000
const host: Check = (v) => typeof v === 'string' && /^[a-z0-9.-]{1,100}$/.test(v)

const SCHEMA: { [N in EventName]: { [K in keyof EventPropsMap[N]]-?: { check: Check; optional?: true } } } = {
  landing_view: { referrer_host: { check: host, optional: true } },
  etf_selected: {
    ticker: { check: ticker },
    previous_ticker: { check: ticker },
    source: { check: oneOf('picker', 'comparison') },
    selection_count: { check: smallInt },
  },
  result_viewed: { ticker: { check: ticker }, amount_bucket: { check: amount }, rate_bucket: { check: rate } },
  conversion_rate_changed: { rate_bucket: { check: rate } },
  lead_form_viewed: { position: { check: position } },
  lead_form_started: { position: { check: position } },
  lead_submitted: {
    position: { check: position },
    ticker: { check: ticker },
    amount_bucket: { check: amount },
    rate_bucket: { check: rate },
    attempt: { check: oneOf('first', 'retry') },
  },
  lead_email_accepted: {
    position: { check: position },
    ticker: { check: ticker },
    amount_bucket: { check: amount },
    delivery: { check: oneOf('resend', 'mock') },
    accepted_on_page: { check: smallInt },
  },
  lead_form_error: {
    position: { check: position },
    error_type: { check: oneOf('invalid_email', 'unconfirmed', 'send_failed', 'rate_limited', 'unavailable') },
  },
  guide_opened: {},
}

export const EVENT_NAMES = Object.keys(SCHEMA) as EventName[]

/** Not emitted by the page (see README §6). The tracker refuses them. */
export const RESERVED_EVENTS: readonly EventName[] = ['guide_opened']

/**
 * Returns only the allow-listed, valid properties, or null when a required property is missing or
 * invalid (the event is then dropped rather than sent half-formed).
 */
export function sanitizeProps<N extends EventName>(name: N, raw: unknown): EventPropsMap[N] | null {
  const schema = SCHEMA[name] as Record<string, { check: Check; optional?: true }> | undefined
  if (!schema) return null
  const input = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const out: Record<string, unknown> = {}
  for (const [key, rule] of Object.entries(schema)) {
    const v = input[key]
    if (v === undefined) {
      if (rule.optional) continue
      return null
    }
    if (!rule.check(v)) {
      if (rule.optional) continue
      return null
    }
    out[key] = v
  }
  return out as EventPropsMap[N]
}

/** The rate slider's range, re-exported for tests of the bucket edges. */
export const RATE_RANGE = { min: CONVERSION_RATE.minPct, max: CONVERSION_RATE.maxPct, step: CONVERSION_RATE.stepPct }
