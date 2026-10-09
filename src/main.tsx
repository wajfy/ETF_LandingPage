import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Self-hosted fonts (all subsets, incl. latin-ext for Czech diacritics). Nothing loads from a CDN.
import '@fontsource-variable/schibsted-grotesk'
import '@fontsource/instrument-serif/400-italic.css'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'
import './index.css'
import App from './App.tsx'
import { buildContext } from './analytics/context'
import { AnalyticsProvider } from './analytics/react'
import { createDebugSink, createTracker, type AnalyticsSink } from './analytics/tracker'

// Analytics (README §6): no provider is connected, so nothing ever leaves the browser. In local
// development a debug sink keeps events in page memory (window.__analyticsEvents) for checking the
// funnel; production builds register no sink at all, so the tracker does no work.
// Every other sink (a future provider adapter) is consent-gated by the tracker; consent starts "unknown".
const sinks: AnalyticsSink[] = []
if (import.meta.env.DEV) sinks.push(createDebugSink(window as never))
const tracker = createTracker({
  sinks,
  getContext: () => buildContext({ search: window.location.search, viewportWidth: window.innerWidth, userAgent: navigator.userAgent }),
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AnalyticsProvider tracker={tracker}>
      <App />
    </AnalyticsProvider>
  </StrictMode>,
)
