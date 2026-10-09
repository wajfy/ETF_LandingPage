/** The tracker context (a no-op tracker by default). */
import { createContext } from 'react'
import { noopTracker, type Tracker } from './tracker'

export const TrackerContext = createContext<Tracker>(noopTracker)
