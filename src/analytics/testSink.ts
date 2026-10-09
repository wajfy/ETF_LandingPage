import type { AnalyticsEvent } from './events'
import { createDebugSink, type AnalyticsSink } from './tracker'

type Recording = AnalyticsSink & { events: AnalyticsEvent[] }

/** Test helper: an ordinary adapter (treated as transmitting, so consent-gated) that records what it receives. */
export function recordingSink(): Recording {
  const events: AnalyticsEvent[] = []
  return { events, send: (e) => void events.push(e) }
}

/** Test helper: the dev debug sink (page memory only, not consent-gated), exposing its buffer. */
export function localRecorder(): Recording {
  const target: { __analyticsEvents?: AnalyticsEvent[] } = {}
  const sink = createDebugSink(target, 10_000) as Recording
  sink.events = target.__analyticsEvents!
  return sink
}
