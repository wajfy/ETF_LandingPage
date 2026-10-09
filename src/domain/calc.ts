/**
 * Financial calculations – full precision, no rounding, no UI.
 *
 * Basis (README §3a, research claims-verification.md F3):
 * - 1-year view, no growth, constant exchange rate.
 * - Each line uses only its own inputs, all from the full amount entered:
 *     fee        = amount × TER
 *     conversion = amount × model conversion rate
 *     tax        = amount × historical dividend yield × withholding rate
 * - The yield is the unrounded historical value (sum of distributions ÷ NAV), or the
 *   issuer-published figure for funds that only have that (SPY, SPYM).
 *
 * Shared by the page and (later) the email renderer. Rounding belongs to format.ts only.
 */
import type { Fund } from './etfData'

/** US withholding with a valid W-8BEN (US–CZ treaty, research C1). */
export const WITHHOLDING_TREATY = 0.15
/** US default withholding without W-8BEN (research C1). */
export const WITHHOLDING_DEFAULT = 0.3

/** Model conversion rate range and default, in percent (README §3a). */
export const CONVERSION_RATE = { minPct: 0, maxPct: 1, stepPct: 0.05, defaultPct: 0.5 } as const
/** Accepted amount range in CZK and presets (README §3a). */
export const AMOUNT = { min: 1_000, max: 10_000_000, default: 100_000, presets: [10_000, 50_000, 100_000] } as const

/** Historical trailing dividend yield in percent, unrounded. */
export function trailingYieldPct(fund: Fund): number {
  const y = fund.yieldSource
  if (y.kind === 'issuer') return y.valuePct
  const sum = y.distributionsUsd.reduce((a, b) => a + b, 0)
  return (sum / y.navUsd) * 100
}

export interface CostLines {
  /** Recurring: fund fee per year, CZK. */
  feePerYear: number
  /** One-off: currency conversion at purchase, CZK. */
  conversionOneOff: number
  /** Tax: US withholding on one year of dividends at the treaty rate, CZK (historical example). */
  dividendTaxTreaty: number
  /** Same at the default rate without W-8BEN, CZK. */
  dividendTaxDefault: number
  /** The unrounded yield used for the tax lines, percent. */
  yieldPct: number
}

export function isValidAmount(amountCzk: number): boolean {
  return Number.isFinite(amountCzk) && amountCzk >= AMOUNT.min && amountCzk <= AMOUNT.max
}

export function isValidRate(ratePct: number): boolean {
  return Number.isFinite(ratePct) && ratePct >= CONVERSION_RATE.minPct && ratePct <= CONVERSION_RATE.maxPct
}

/** The three independent cost lines for one fund. All values unrounded. */
export function costLines(fund: Fund, amountCzk: number, conversionRatePct: number): CostLines {
  if (!isValidAmount(amountCzk)) throw new RangeError(`amount out of range: ${amountCzk}`)
  if (!isValidRate(conversionRatePct)) throw new RangeError(`conversion rate out of range: ${conversionRatePct}`)
  const yieldPct = trailingYieldPct(fund)
  const dividends = (amountCzk * yieldPct) / 100
  return {
    feePerYear: (amountCzk * fund.terPct) / 100,
    conversionOneOff: (amountCzk * conversionRatePct) / 100,
    dividendTaxTreaty: dividends * WITHHOLDING_TREATY,
    dividendTaxDefault: dividends * WITHHOLDING_DEFAULT,
    yieldPct,
  }
}

/** Largest TER difference (percentage points) among funds tracking the same index. Unrounded. */
export function feeGapPctPoints(funds: Fund[]): number {
  const ters = funds.map((f) => f.terPct)
  return Math.max(...ters) - Math.min(...ters)
}
