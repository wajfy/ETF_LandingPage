/**
 * Guard: the browser code uses no device storage, no tracking transports and no click identifiers.
 * If a future provider adapter needs any of these, this test must be changed deliberately, together
 * with the consent decision in README §6.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const SRC = join(import.meta.dirname, '..')

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) return sourceFiles(p)
    return /\.(ts|tsx)$/.test(name) && !/\.test\.ts$/.test(name) && name !== 'testSink.ts' ? [p] : []
  })
}

/** Code without comments (comments may name what the code deliberately avoids). */
const stripComments = (code: string) => code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|\s)\/\/.*$/gm, '$1')
const files = sourceFiles(SRC).map((p) => ({ p: p.slice(SRC.length + 1).replace(/\\/g, '/'), s: stripComments(readFileSync(p, 'utf8')) }))

describe('privacy guard (browser code)', () => {
  it.each([
    ['cookies', /document\.cookie/],
    ['localStorage', /localStorage/],
    ['sessionStorage', /sessionStorage/],
    ['IndexedDB', /indexedDB/],
    ['sendBeacon', /sendBeacon/],
    ['XMLHttpRequest', /XMLHttpRequest/],
    ['tracking pixels', /new Image\(/],
    ['click ids', /gclid|fbclid|ttclid|msclkid/],
  ])('uses no %s', (_label, pattern) => {
    expect(files.filter((f) => pattern.test(f.s)).map((f) => f.p)).toEqual([])
  })

  it('makes network requests only from the lead client', () => {
    expect(files.filter((f) => /\bfetch\b/.test(f.s)).map((f) => f.p)).toEqual(['lead/client.ts'])
  })

  it('nothing outside the tracker starts with consent granted', () => {
    // Consent may only change through a visitor's choice (a consent interface passing a variable).
    expect(files.filter((f) => f.p !== 'analytics/tracker.ts' && /setConsent\(\s*['"]granted/.test(f.s)).map((f) => f.p)).toEqual([])
  })

  it('the analytics code has no network transport at all', () => {
    const analytics = files.filter((f) => f.p.startsWith('analytics/'))
    expect(analytics.length).toBeGreaterThan(0)
    for (const f of analytics) expect(f.s).not.toMatch(/fetch|WebSocket|EventSource|navigator\.sendBeacon/)
  })
})

describe('privacy guard (third-party code)', () => {
  // A provider SDK or tag would bypass the tracker's consent gate. Adding one must be a deliberate
  // change of this test together with the consent decision in README section 6.
  const root = join(SRC, '..')

  it('the page loads no external scripts', () => {
    const html = readFileSync(join(root, 'index.html'), 'utf8')
    expect(html).not.toMatch(/<script[^>]+src=["']?(https?:)?\/\//i)
    expect(html).not.toMatch(/<img[^>]+src=["']?(https?:)?\/\//i)
  })

  it('has no runtime dependency beyond the reviewed set', () => {
    const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as { dependencies: Record<string, string> }
    expect(Object.keys(pkg.dependencies).sort()).toEqual([
      '@fontsource-variable/schibsted-grotesk',
      '@fontsource/ibm-plex-mono',
      '@fontsource/instrument-serif',
      'react',
      'react-dom',
      'resend', // server-side only (server/), never imported from src/
    ])
    expect(files.filter((f) => /from ['"]resend['"]/.test(f.s)).map((f) => f.p)).toEqual([])
  })
})
