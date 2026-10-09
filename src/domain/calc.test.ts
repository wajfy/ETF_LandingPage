import { describe, expect, it } from 'vitest'
import { costLines, feeGapPctPoints, trailingYieldPct } from './calc'
import { etfData, getFund } from './etfData'
import { roundCzk } from './format'

/**
 * Reference figures: research/claims-verification.md F3 (100 000 CZK, 0.5 % model rate, 1 year).
 * [fee per year, conversion one-off, dividend tax 15 %, dividend tax 30 %] after display rounding.
 */
const F3: Record<string, [number, number, number, number]> = {
  IVV: [30, 500, 161, 323],
  SCHD: [60, 500, 484, 969],
  SPY: [95, 500, 147, 294],
  SPYM: [20, 500, 150, 300],
  VOO: [30, 500, 156, 312],
  VT: [60, 500, 227, 454],
  VTI: [30, 500, 155, 311],
}

describe('research F3 reference figures', () => {
  it('covers exactly the seven core funds', () => {
    expect(etfData.funds.map((f) => f.ticker).sort()).toEqual(Object.keys(F3).sort())
  })

  it.each(Object.entries(F3))('%s matches F3 at 100 000 Kč and 0.5 %%', (ticker, expected) => {
    const l = costLines(getFund(ticker), 100_000, 0.5)
    expect([l.feePerYear, l.conversionOneOff, l.dividendTaxTreaty, l.dividendTaxDefault].map(roundCzk)).toEqual(expected)
  })
})

describe('full precision internally', () => {
  it('uses the unrounded historical yield (distributions ÷ NAV)', () => {
    // VOO: (1.8226 + 1.9622 + 1.8724 + 1.7710) ÷ 714.56 × 100 = 1.039548…
    expect(trailingYieldPct(getFund('VOO'))).toBeCloseTo(1.0395488, 6)
    // The unrounded tax is 155.93…, not 156 – rounding is a display concern.
    expect(costLines(getFund('VOO'), 100_000, 0.5).dividendTaxTreaty).toBeCloseTo(155.932, 2)
  })

  it('uses the issuer-published yield where only that exists', () => {
    expect(trailingYieldPct(getFund('SPY'))).toBe(0.98)
    expect(trailingYieldPct(getFund('SPYM'))).toBe(1.0)
  })

  it('derives the S&P 500 fee gap from the data', () => {
    const sp = etfData.funds.filter((f) => f.indexName === 'S&P 500 Index')
    expect(sp.map((f) => f.ticker)).toEqual(['IVV', 'SPY', 'SPYM', 'VOO'])
    expect(feeGapPctPoints(sp)).toBeCloseTo(0.0745, 10)
  })
})

describe('lines are independent', () => {
  const fund = getFund('VOO')
  it('the conversion rate changes only the conversion line', () => {
    const a = costLines(fund, 100_000, 0)
    const b = costLines(fund, 100_000, 1)
    expect(b.feePerYear).toBe(a.feePerYear)
    expect(b.dividendTaxTreaty).toBe(a.dividendTaxTreaty)
    expect(a.conversionOneOff).toBe(0)
    expect(b.conversionOneOff).toBe(1_000)
  })

  it('the fund changes only the fee and the tax', () => {
    const a = costLines(getFund('VOO'), 100_000, 0.5)
    const b = costLines(getFund('SCHD'), 100_000, 0.5)
    expect(b.conversionOneOff).toBe(a.conversionOneOff)
    expect(b.feePerYear).not.toBe(a.feePerYear)
    expect(b.dividendTaxTreaty).not.toBe(a.dividendTaxTreaty)
  })

  it('the amount scales all three lines linearly', () => {
    const a = costLines(fund, 10_000, 0.5)
    const b = costLines(fund, 100_000, 0.5)
    expect(b.feePerYear / a.feePerYear).toBeCloseTo(10, 10)
    expect(b.conversionOneOff / a.conversionOneOff).toBeCloseTo(10, 10)
    expect(b.dividendTaxTreaty / a.dividendTaxTreaty).toBeCloseTo(10, 10)
  })
})

describe('input ranges', () => {
  const fund = getFund('IVV')
  it('accepts the boundaries', () => {
    expect(() => costLines(fund, 1_000, 0)).not.toThrow()
    expect(() => costLines(fund, 10_000_000, 1)).not.toThrow()
  })
  it('rejects values outside the ranges', () => {
    expect(() => costLines(fund, 999, 0.5)).toThrow(RangeError)
    expect(() => costLines(fund, 10_000_001, 0.5)).toThrow(RangeError)
    expect(() => costLines(fund, Number.NaN, 0.5)).toThrow(RangeError)
    expect(() => costLines(fund, 100_000, 1.05)).toThrow(RangeError)
    expect(() => costLines(fund, 100_000, -0.05)).toThrow(RangeError)
  })
})
