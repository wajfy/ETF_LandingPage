import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Self-hosted fonts (all subsets, incl. latin-ext for Czech diacritics). Nothing loads from a CDN.
import '@fontsource-variable/schibsted-grotesk'
import '@fontsource/instrument-serif/400-italic.css'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
