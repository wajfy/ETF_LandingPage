/** React provider for the tracker; hooks live in hooks.ts. */
import type { ReactNode } from 'react'
import { TrackerContext } from './trackerContext'
import type { Tracker } from './tracker'

export function AnalyticsProvider({ tracker, children }: { tracker: Tracker; children: ReactNode }) {
  return <TrackerContext.Provider value={tracker}>{children}</TrackerContext.Provider>
}
