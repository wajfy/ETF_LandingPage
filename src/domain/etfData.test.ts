import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'
import raw from '../../research/etf-data.json'
import { defaultTicker, EtfDataError, etfData, parseEtfData } from './etfData'

// Mutable deep copy of the raw JSON for negative tests (the JSON's literal type is too narrow to edit).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const clone = (v: unknown): any => JSON.parse(JSON.stringify(v))

describe('loading research/etf-data.json', () => {
  it('loads the seven core funds in alphabetical order (AGG is dropped)', () => {
    expect(etfData.funds.map((f) => f.ticker)).toEqual(['IVV', 'SCHD', 'SPY', 'SPYM', 'VOO', 'VT', 'VTI'])
  })

  it('selects IVV by default because it is first alphabetically', () => {
    expect(defaultTicker).toBe('IVV')
  })

  it('reads the exchange rate and access date from the metadata', () => {
    expect(etfData.accessed).toBe('2026-10-08')
    expect(etfData.exchangeRate.usdCzk).toBeGreaterThan(0)
  })

  it('distinguishes computed yields from issuer-published ones', () => {
    const kinds = Object.fromEntries(etfData.funds.map((f) => [f.ticker, f.yieldSource.kind]))
    expect(kinds).toMatchObject({ SPY: 'issuer', SPYM: 'issuer', IVV: 'distributions', VOO: 'distributions' })
  })
})

describe('validation', () => {
  it('rejects a fund without a TER', () => {
    const bad = clone(raw)
    delete bad.funds.find((f: { ticker: string }) => f.ticker === 'VOO').expense_ratio_pct
    expect(() => parseEtfData(bad)).toThrow(EtfDataError)
    try {
      parseEtfData(bad)
    } catch (e) {
      expect((e as EtfDataError).issues.join('\n')).toMatch(/VOO: expense_ratio_pct/)
    }
  })

  it('rejects distributions without a NAV', () => {
    const bad = clone(raw)
    delete bad.funds.find((f: { ticker: string }) => f.ticker === 'IVV').trailing_dividend_yield_pct.nav_usd
    expect(() => parseEtfData(bad)).toThrow(/IVV: nav_usd/)
  })

  it('rejects a missing exchange rate', () => {
    const bad = clone(raw)
    delete bad._meta.exchange_rate
    expect(() => parseEtfData(bad)).toThrow(/exchange_rate/)
  })

  it('rejects a non-object root', () => {
    expect(() => parseEtfData(null)).toThrow(EtfDataError)
  })
})

describe('single source of truth', () => {
  // Every fund figure in the JSON (TER, distributions, NAV, issuer yields). None may be typed
  // anywhere in src/ – the app must read them from research/etf-data.json.
  const figures = new Set<string>()
  for (const f of (raw as { funds: Array<Record<string, any>> }).funds) {
    if (f.role !== 'core') continue
    figures.add(String(f.expense_ratio_pct.value))
    const y = f.trailing_dividend_yield_pct
    for (const d of y.distributions_per_share_usd ?? []) figures.add(String(d))
    if (y.nav_usd) figures.add(String(y.nav_usd))
    if (y.status === 'verified') figures.add(String(y.value))
  }
  // Tests may restate expected outputs; production sources may not restate inputs.
  const sourceFiles: string[] = []
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name)
      if (statSync(p).isDirectory()) walk(p)
      else if (/\.(ts|tsx)$/.test(name) && !/\.test\.ts$/.test(name)) sourceFiles.push(p)
    }
  }
  walk(join(import.meta.dirname, '..'))

  it('finds source files to check', () => {
    expect(sourceFiles.length).toBeGreaterThan(3)
  })

  it('contains no hard-coded fund figures outside the data file', () => {
    const offenders: string[] = []
    for (const file of sourceFiles) {
      const text = readFileSync(file, 'utf8')
      for (const fig of figures) {
        // Only flag figures with enough digits to be meaningful (skip e.g. "1").
        if (fig.replace(/\D/g, '').length < 3) continue
        const re = new RegExp(`(?<![\\d.])${fig.replace('.', '\\.')}(?![\\d])`)
        if (re.test(text)) offenders.push(`${relative(join(import.meta.dirname, '..', '..'), file)}: ${fig}`)
      }
    }
    expect(offenders).toEqual([])
  })
})
