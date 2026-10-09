/**
 * Guards vercel.json (not deployed yet). Shapes follow the published schema
 * https://openapi.vercel.sh/vercel.json (functions: glob → {maxDuration 1–1800 | "max", …};
 * headers: [{source, headers: [{key, value}]}], additionalProperties: false).
 */
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { CLIENT_TIMEOUT_MS } from '../src/lead/client'
import { PROVIDER_TIMEOUT_RANGE_MS } from './config'

const root = join(import.meta.dirname, '..')
const vercel = JSON.parse(readFileSync(join(root, 'vercel.json'), 'utf8')) as {
  $schema?: string
  functions: Record<string, Record<string, unknown>>
  headers: Array<{ source: string; headers: Array<{ key: string; value: string }> }>
}

const FUNCTION_KEYS = ['maxDuration', 'memory', 'runtime', 'includeFiles', 'excludeFiles', 'maxConcurrency', 'regions', 'functionFailoverRegions', 'supportsCancellation', 'affinity', 'experimentalTriggers']
/** Hobby and Pro both allow 300 s with Fluid compute (vercel.com/docs/functions/configuring-functions/duration). */
const HOBBY_MAX_DURATION_S = 300

describe('vercel.json – shape', () => {
  it('only uses known top-level keys and points editors at the schema', () => {
    expect(Object.keys(vercel).sort()).toEqual(['$schema', 'functions', 'headers'])
    expect(vercel.$schema).toBe('https://openapi.vercel.sh/vercel.json')
  })

  it('configures only functions that exist, with schema-valid properties', () => {
    for (const [pattern, cfg] of Object.entries(vercel.functions)) {
      expect(existsSync(join(root, pattern)), pattern).toBe(true)
      for (const key of Object.keys(cfg)) expect(FUNCTION_KEYS).toContain(key)
    }
  })

  it('header rules have exactly {source, headers: [{key, value}]}', () => {
    for (const rule of vercel.headers) {
      expect(Object.keys(rule).sort()).toEqual(['headers', 'source'])
      for (const h of rule.headers) {
        expect(Object.keys(h).sort()).toEqual(['key', 'value'])
        expect(typeof h.value).toBe('string')
      }
    }
  })
})

describe('vercel.json – function time limit', () => {
  const maxDuration = vercel.functions['api/lead.ts']?.maxDuration as number

  it('sets a numeric limit for the lead function within the Hobby maximum', () => {
    expect(typeof maxDuration).toBe('number')
    expect(maxDuration).toBeGreaterThanOrEqual(1)
    expect(maxDuration).toBeLessThanOrEqual(HOBBY_MAX_DURATION_S)
  })

  it('keeps the chain provider timeout < browser timeout < function limit', () => {
    expect(PROVIDER_TIMEOUT_RANGE_MS.max).toBeLessThan(CLIENT_TIMEOUT_MS)
    expect(CLIENT_TIMEOUT_MS).toBeLessThan(maxDuration * 1000)
  })

  it('has a single source: api/lead.ts does not also export a duration', () => {
    const entry = readFileSync(join(root, 'api/lead.ts'), 'utf8')
    expect(entry).not.toMatch(/export const (maxDuration|config)\b/)
  })
})

describe('vercel.json – security headers', () => {
  const all = vercel.headers.find((r) => r.source === '/(.*)')?.headers ?? []
  const header = (k: string) => all.find((h) => h.key.toLowerCase() === k.toLowerCase())?.value

  it('sets the baseline headers on every path', () => {
    expect(header('X-Content-Type-Options')).toBe('nosniff')
    expect(header('Referrer-Policy')).toBe('strict-origin-when-cross-origin')
    expect(header('X-Frame-Options')).toBe('DENY')
    expect(header('Permissions-Policy')).toMatch(/camera=\(\)/)
    expect(header('Cross-Origin-Opener-Policy')).toBe('same-origin')
  })

  it('the CSP only blocks framing/base/form/object – it does not restrict the app’s own resources', () => {
    const csp = header('Content-Security-Policy') ?? ''
    expect(csp).toContain("frame-ancestors 'none'")
    expect(csp).toContain("base-uri 'self'")
    expect(csp).toContain("object-src 'none'")
    // A fetch/script/style/font/img restriction could break the app; it needs a report-only trial first (README §10).
    expect(csp).not.toMatch(/(default|script|style|connect|img|font|media|worker)-src/)
  })
})
