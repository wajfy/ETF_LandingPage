/**
 * Provider-independent tracker. The UI calls track(name, props); sinks (adapters) decide where
 * events go. Disabled by default: with no sinks registered nothing is collected and nothing is read
 * from the device.
 *
 * Consent gate – not bypassable by an adapter:
 * - Every sink is treated as transmitting and receives events ONLY while consent is "granted".
 *   An adapter cannot declare itself exempt. The single exception is the dev debug sink created by
 *   createDebugSink() in this module (page memory only), recognised by identity, not by a flag.
 * - Consent always starts as "unknown"; there is no option to start a tracker as "granted". Only
 *   setConsent() – i.e. a visitor's choice in a consent interface – changes it.
 * - Events from before a grant are dropped: never queued, never replayed. trackOnce keys used
 *   before the grant stay used, so "once per page load" events are not re-sent after it either.
 *
 * Nothing here uses cookies, localStorage, sessionStorage, IndexedDB or any identifier.
 */
import { RESERVED_EVENTS, sanitizeProps, type AnalyticsEvent, type EventContext, type EventName, type EventPropsMap } from './events'

export interface AnalyticsSink {
  send(event: AnalyticsEvent): void
}

export type ConsentState = 'unknown' | 'granted' | 'denied'

export interface Tracker {
  track<N extends EventName>(name: N, props: EventPropsMap[N]): void
  /** Like track, but at most once per key for this page load (e.g. landing_view, per-position form views). */
  trackOnce<N extends EventName>(key: string, name: N, props: EventPropsMap[N]): void
  setConsent(state: ConsentState): void
  readonly consent: ConsentState
  /** True when at least one sink would receive an event now. Use it to skip reading page data. */
  readonly active: boolean
}

export interface TrackerOptions {
  sinks?: AnalyticsSink[]
  /** Called lazily – only when at least one sink will receive an event. */
  getContext?: () => EventContext
}

/** Sinks that never transmit (created only by createDebugSink below). */
const localSinks = new WeakSet<AnalyticsSink>()

export function createTracker(opts: TrackerOptions = {}): Tracker {
  const sinks = [...(opts.sinks ?? [])]
  let consent: ConsentState = 'unknown'
  let context: EventContext | null = null
  const once = new Set<string>()

  const receivers = () => sinks.filter((s) => localSinks.has(s) || consent === 'granted')

  const track = <N extends EventName>(name: N, props: EventPropsMap[N]) => {
    if (RESERVED_EVENTS.includes(name)) return
    const targets = receivers()
    if (targets.length === 0) return // disabled / no consent: do no work at all, keep nothing
    const clean = sanitizeProps(name, props)
    if (!clean) return
    context ??= opts.getContext ? opts.getContext() : { device: 'desktop', in_app: false }
    const event = { name, props: clean, context } as AnalyticsEvent
    for (const sink of targets) {
      try {
        sink.send(event)
      } catch {
        // A failing adapter must never break the page or the lead flow.
      }
    }
  }

  return {
    track,
    trackOnce(key, name, props) {
      if (once.has(key)) return
      once.add(key)
      track(name, props)
    },
    setConsent(state) {
      consent = state
    },
    get consent() {
      return consent
    },
    get active() {
      return receivers().length > 0
    },
  }
}

/** A tracker that does nothing – the default when no provider is registered (and in tests). */
export const noopTracker: Tracker = createTracker()

/**
 * Local-only sink for development: keeps the last events in page memory (window.__analyticsEvents)
 * so the funnel can be checked in the browser. Never transmits; registered only when import.meta.env.DEV.
 */
export function createDebugSink(target: { __analyticsEvents?: AnalyticsEvent[] }, max = 200): AnalyticsSink {
  const buffer: AnalyticsEvent[] = []
  target.__analyticsEvents = buffer
  const sink: AnalyticsSink = {
    send(event) {
      buffer.push(event)
      if (buffer.length > max) buffer.shift()
    },
  }
  localSinks.add(sink)
  return sink
}
