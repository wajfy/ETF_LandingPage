import { describe, expect, it } from 'vitest'
import { etfData, getFund } from './etfData'
import { buildResult, parseWindow } from './result'

const n = (s: string) => s.replace(/ /g, ' ')

describe('result model (shared by page and future email)', () => {
  it('builds the default IVV card at 100 000 Kč and 0,5 %', () => {
    const r = buildResult(getFund('IVV'), 100_000, 0.5)
    expect(n(r.amountText)).toBe('100 000 Kč')
    expect(n(r.fee.value)).toBe('≈ 30 Kč')
    expect(n(r.fee.sub)).toBe('TER 0,03 % ročně')
    expect(n(r.conversion.value)).toBe('≈ 500 Kč')
    expect(n(r.conversion.sub)).toBe('modelová sazba 0,5 %')
    expect(n(r.tax.value)).toBe('≈ 161 Kč')
    expect(n(r.tax.note)).toContain('přibližně 1,08 % své hodnoty')
    expect(n(r.tax.note)).toContain('tedy ≈ 161 Kč ročně')
    expect(n(r.tax.note)).toContain('až 30 % (≈ 323 Kč)')
    expect(n(r.stamp)).toContain('Poplatek: iShares, dle prospektu')
    expect(n(r.stamp)).toContain('dividendy: 12 měsíců do 7. 10. 2026')
  })

  it('uses each issuer’s own TER date', () => {
    expect(n(buildResult(getFund('VOO'), 100_000, 0.5).stamp)).toContain('Vanguard, k 28. 4. 2026')
    expect(n(buildResult(getFund('VT'), 100_000, 0.5).stamp)).toContain('Vanguard, k 27. 2. 2026')
    expect(n(buildResult(getFund('SPY'), 100_000, 0.5).stamp)).toContain('State Street, k 8. 10. 2026')
  })

  it('derives the fact tags from the data for every fund', () => {
    for (const f of etfData.funds) {
      const r = buildResult(f, 100_000, 0.5)
      expect(r.facts).toContain('NYSE Arca')
      expect(r.facts).toContain('dividendy čtvrtletně')
      expect(r.facts.some((x) => /^od \d{4}$/.test(x))).toBe(true)
      expect(r.description.length).toBeGreaterThan(10)
    }
  })

  it('parses the dividend window', () => {
    expect(parseWindow('ex-dates 2025-10-08..2026-10-07')).toEqual(['2025-10-08', '2026-10-07'])
    expect(parseWindow(null)).toBeNull()
  })
})
