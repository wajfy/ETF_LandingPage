import { describe, expect, it, vi } from 'vitest'
import { localRecorder, recordingSink } from './testSink'
import { createDebugSink, createTracker } from './tracker'

const ctx = { device: 'mobile' as const, in_app: false }

describe('tracker: disabled by default', () => {
  it('does nothing without sinks and does not even read the page context', () => {
    const getContext = vi.fn(() => ctx)
    const t = createTracker({ getContext })
    expect(t.active).toBe(false)
    t.track('lead_form_started', { position: 'inline' })
    expect(getContext).not.toHaveBeenCalled()
  })
})

describe('tracker: consent gate', () => {
  it('sends nothing to an adapter while consent is unknown or denied', () => {
    const ext = recordingSink()
    const t = createTracker({ sinks: [ext], getContext: () => ctx })
    expect(t.consent).toBe('unknown')
    expect(t.active).toBe(false)
    t.track('lead_form_started', { position: 'inline' })
    t.setConsent('denied')
    t.track('lead_form_started', { position: 'repeat' })
    expect(ext.events).toHaveLength(0)
  })

  it('sends only after a grant, never replays earlier events, and stops on withdrawal', () => {
    const ext = recordingSink()
    const t = createTracker({ sinks: [ext], getContext: () => ctx })
    t.track('lead_form_viewed', { position: 'inline' }) // before consent: dropped, not queued
    t.setConsent('granted')
    expect(t.active).toBe(true)
    t.track('lead_form_started', { position: 'inline' })
    t.setConsent('denied')
    t.track('lead_form_error', { position: 'inline', error_type: 'invalid_email' })
    expect(ext.events.map((e) => e.name)).toEqual(['lead_form_started'])
  })

  it('does not read the page context before consent (no device access for a gated adapter)', () => {
    const getContext = vi.fn(() => ctx)
    const t = createTracker({ sinks: [recordingSink()], getContext })
    t.track('lead_form_started', { position: 'inline' })
    expect(getContext).not.toHaveBeenCalled()
  })

  it('does not re-send "once per page" events after a later grant', () => {
    const ext = recordingSink()
    const t = createTracker({ sinks: [ext], getContext: () => ctx })
    t.trackOnce('landing_view', 'landing_view', {})
    t.trackOnce('lead_form_viewed:inline', 'lead_form_viewed', { position: 'inline' })
    t.setConsent('granted')
    t.trackOnce('landing_view', 'landing_view', {})
    t.trackOnce('lead_form_viewed:inline', 'lead_form_viewed', { position: 'inline' })
    expect(ext.events).toHaveLength(0)
  })

  it('an adapter cannot exempt itself from the gate', () => {
    // Look-alikes of the old "external: false" flag and of the debug sink are still gated:
    // only the object created by createDebugSink is recognised (by identity).
    const flagged = Object.assign(recordingSink(), { external: false, local: true })
    const lookalike = recordingSink()
    const t = createTracker({ sinks: [flagged, lookalike], getContext: () => ctx })
    t.track('lead_form_started', { position: 'inline' })
    expect(flagged.events).toHaveLength(0)
    expect(lookalike.events).toHaveLength(0)
  })

  it('cannot be created with consent already granted', () => {
    const ext = recordingSink()
    const t = createTracker({ sinks: [ext], getContext: () => ctx, consent: 'granted' } as never)
    expect(t.consent).toBe('unknown')
    t.track('lead_form_started', { position: 'inline' })
    expect(ext.events).toHaveLength(0)
  })

  it('feeds a local (non-transmitting) sink regardless of consent', () => {
    const local = localRecorder()
    const ext = recordingSink()
    const t = createTracker({ sinks: [local, ext], getContext: () => ctx })
    t.track('lead_form_started', { position: 'inline' })
    expect(local.events).toHaveLength(1)
    expect(ext.events).toHaveLength(0)
  })
})

describe('tracker: payload hygiene and duplicates', () => {
  it('sends sanitized props and the coarse context only', () => {
    const local = localRecorder()
    const t = createTracker({ sinks: [local], getContext: () => ({ ...ctx, utm_source: 'facebook' }) })
    t.track('lead_form_error', { position: 'inline', error_type: 'unconfirmed', email: 'a@b.cz', requestId: 'x' } as never)
    expect(local.events[0]).toEqual({
      name: 'lead_form_error',
      props: { position: 'inline', error_type: 'unconfirmed' },
      context: { device: 'mobile', in_app: false, utm_source: 'facebook' },
    })
  })

  it('reads the context once per page load', () => {
    const getContext = vi.fn(() => ctx)
    const t = createTracker({ sinks: [localRecorder()], getContext })
    t.track('lead_form_viewed', { position: 'inline' })
    t.track('lead_form_viewed', { position: 'repeat' })
    expect(getContext).toHaveBeenCalledTimes(1)
  })

  it('trackOnce fires once per key (landing_view, StrictMode double effects, per-position form events)', () => {
    const local = localRecorder()
    const t = createTracker({ sinks: [local], getContext: () => ctx })
    t.trackOnce('landing_view', 'landing_view', {})
    t.trackOnce('landing_view', 'landing_view', {})
    t.trackOnce('lead_form_started:inline', 'lead_form_started', { position: 'inline' })
    t.trackOnce('lead_form_started:inline', 'lead_form_started', { position: 'inline' })
    t.trackOnce('lead_form_started:repeat', 'lead_form_started', { position: 'repeat' })
    expect(local.events.map((e) => e.name)).toEqual(['landing_view', 'lead_form_started', 'lead_form_started'])
  })

  it('refuses the reserved guide_opened event and drops invalid events', () => {
    const local = localRecorder()
    const t = createTracker({ sinks: [local], getContext: () => ctx })
    t.track('guide_opened', {})
    t.track('etf_selected', { ticker: 'QQQ', previous_ticker: 'IVV', source: 'picker', selection_count: 1 })
    expect(local.events).toHaveLength(0)
  })

  it('a failing adapter never breaks the page', () => {
    const failing = {
      send: () => {
        throw new Error('adapter down')
      },
    }
    const t = createTracker({ sinks: [failing], getContext: () => ctx })
    t.setConsent('granted')
    expect(() => t.track('lead_form_started', { position: 'inline' })).not.toThrow()
  })
})

describe('debug sink (development only)', () => {
  it('keeps a bounded buffer in page memory and transmits nothing', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const win: { __analyticsEvents?: unknown[] } = {}
    const sink = createDebugSink(win as never, 2)
    const t = createTracker({ sinks: [sink], getContext: () => ctx })
    for (let i = 0; i < 3; i++) t.track('lead_form_started', { position: 'inline' })
    expect(win.__analyticsEvents).toHaveLength(2)
    expect(fetchSpy).not.toHaveBeenCalled()
    fetchSpy.mockRestore()
  })
})
