/**
 * Comparison model for all funds – same data, calculation and display rounding as the result card
 * (and, later, the email table). Framework-free.
 */
import { costLines, feeGapPctPoints } from './calc.js'
import type { Fund } from './etfData.js'
import { formatCzkEstimate, formatPctPoints, formatTer, formatYield } from './format.js'

/** Funds tracking this index form the "same index, different fee" group (research B3). */
export const SAME_INDEX_NAME = 'S&P 500 Index'

export interface ComparisonRow {
  ticker: string
  name: string
  issuer: string
  indexName: string
  sinceYear: number
  terText: string
  feeText: string
  yieldText: string
  taxText: string
}

export interface ComparisonGroup {
  id: 'same-index' | 'other-index'
  rows: ComparisonRow[]
}

export interface ComparisonModel {
  groups: ComparisonGroup[]
  /** Largest TER gap within the same-index group, formatted ("0,0745"). */
  sameIndexGapText: string
  /** Tickers the gap refers to, alphabetical (["IVV", "SPY", "SPYM", "VOO"]). */
  sameIndexTickers: string[]
  /** Conversion is identical for every fund (amount × rate), so it is stated once, not per row. */
  conversionText: string
  /** Min and max TER across all funds, formatted. */
  terRangeText: [string, string]
  /** True when every fund distributes (pays out) dividends – checked from the data. */
  allDistributing: boolean
  fundCount: number
}

export function buildComparison(funds: Fund[], amountCzk: number, conversionRatePct: number): ComparisonModel {
  const rows = funds.map((f): ComparisonRow => {
    const l = costLines(f, amountCzk, conversionRatePct)
    return {
      ticker: f.ticker,
      name: f.name,
      issuer: f.issuer,
      indexName: f.indexName,
      sinceYear: Number(f.inceptionDate.slice(0, 4)),
      terText: formatTer(f.terPct),
      feeText: formatCzkEstimate(l.feePerYear),
      yieldText: formatYield(l.yieldPct),
      taxText: formatCzkEstimate(l.dividendTaxTreaty),
    }
  })
  const same = funds.filter((f) => f.indexName === SAME_INDEX_NAME)
  const ters = funds.map((f) => f.terPct)
  // Conversion does not depend on the fund; any fund gives the same value.
  const conversion = costLines(funds[0], amountCzk, conversionRatePct).conversionOneOff

  return {
    groups: [
      { id: 'same-index', rows: rows.filter((r) => r.indexName === SAME_INDEX_NAME) },
      { id: 'other-index', rows: rows.filter((r) => r.indexName !== SAME_INDEX_NAME) },
    ],
    sameIndexGapText: formatPctPoints(feeGapPctPoints(same)),
    sameIndexTickers: same.map((f) => f.ticker),
    conversionText: formatCzkEstimate(conversion),
    terRangeText: [formatTer(Math.min(...ters)), formatTer(Math.max(...ters))],
    allDistributing: funds.every((f) => /^distributing/i.test(f.distribution)),
    fundCount: funds.length,
  }
}
