import { describe, expect, it } from 'vitest'
import { AMOUNT, CONVERSION_RATE } from '../domain/calc'
import { amountBucket, EVENT_NAMES, rateBucket, sanitizeProps } from './events'

describe('event catalogue', () => {
  it('contains the agreed funnel events plus the conversion-rate change and the form error', () => {
    expect([...EVENT_NAMES].sort()).toEqual(
      [
        'landing_view',
        'etf_selected',
        'result_viewed',
        'lead_form_viewed',
        'lead_form_started',
        'lead_submitted',
        'lead_email_accepted',
        'guide_opened',
        'conversion_rate_changed',
        'lead_form_error',
      ].sort(),
    )
  })
})

describe('buckets (raw amounts and rates are never sent)', () => {
  it('keeps presets and buckets custom amounts', () => {
    for (const p of AMOUNT.presets) expect(amountBucket(p)).toBe(String(p))
    expect(amountBucket(AMOUNT.min)).toBe('custom_lt_10k')
    expect(amountBucket(12_345)).toBe('custom_10k_100k')
    expect(amountBucket(100_001)).toBe('custom_100k_1m')
    expect(amountBucket(1_000_000)).toBe('custom_100k_1m')
    expect(amountBucket(AMOUNT.max)).toBe('custom_gt_1m')
  })

  it('maps every slider step to the documented rate buckets', () => {
    const seen = new Map<string, number[]>()
    const steps = Math.round((CONVERSION_RATE.maxPct - CONVERSION_RATE.minPct) / CONVERSION_RATE.stepPct)
    for (let i = 0; i <= steps; i++) {
      const r = Number((CONVERSION_RATE.minPct + i * CONVERSION_RATE.stepPct).toFixed(2))
      const b = rateBucket(r)
      seen.set(b, [...(seen.get(b) ?? []), r])
    }
    expect(seen.get('0')).toEqual([0])
    expect(seen.get('0.05-0.25')?.at(-1)).toBe(0.25)
    expect(seen.get('0.3-0.5')).toEqual([0.3, 0.35, 0.4, 0.45, 0.5])
    expect(seen.get('0.55-1')?.[0]).toBe(0.55)
    // Float noise from slider arithmetic does not move a value across a border.
    expect(rateBucket(0.1 + 0.15)).toBe('0.05-0.25')
    expect(rateBucket(CONVERSION_RATE.defaultPct)).toBe('0.3-0.5')
  })
})

describe('sanitizeProps (allow-list)', () => {
  it('strips every property that is not in the schema, so personal data cannot slip through', () => {
    const dirty = {
      position: 'inline',
      error_type: 'unconfirmed',
      email: 'jana.novakova@example.cz',
      requestId: '3f0e8f9a-1c2b-4d5e-8f70-123456789abc',
      ip: '192.168.1.20',
      apiKey: 're_secret',
    }
    expect(sanitizeProps('lead_form_error', dirty)).toEqual({ position: 'inline', error_type: 'unconfirmed' })
  })

  it('drops an event whose required property is missing or invalid', () => {
    expect(sanitizeProps('etf_selected', { ticker: 'VOO', previous_ticker: 'IVV', source: 'picker' })).toBeNull()
    expect(sanitizeProps('etf_selected', { ticker: 'QQQ', previous_ticker: 'IVV', source: 'picker', selection_count: 1 })).toBeNull()
    expect(
      sanitizeProps('lead_submitted', { position: 'sticky', ticker: 'VOO', amount_bucket: '100000', rate_bucket: '0.3-0.5', attempt: 'first' }),
    ).toBeNull()
    expect(sanitizeProps('result_viewed', { ticker: 'VOO', amount_bucket: '123456', rate_bucket: '0.3-0.5' })).toBeNull()
  })

  it('drops an invalid optional property but keeps the event', () => {
    expect(sanitizeProps('landing_view', { referrer_host: 'https://x.cz/?email=a@b.cz' })).toEqual({})
    expect(sanitizeProps('landing_view', { referrer_host: 'm.facebook.com' })).toEqual({ referrer_host: 'm.facebook.com' })
  })
})
