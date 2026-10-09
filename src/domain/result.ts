/**
 * Result model: combines data (etfData), calculation (calc) and display formatting (format)
 * into the strings the result card shows. Framework-free, so the future email renderer can
 * use exactly the same output as the page.
 */
import { card, fundDescriptions, issuerShort } from '../content/cs'
import { costLines, type CostLines } from './calc'
import type { Fund } from './etfData'
import { formatCzkAmount, formatCzkEstimate, formatDateCz, formatRate, formatTer, formatYield } from './format'

export interface ResultModel {
  ticker: string
  name: string
  description: string
  amountText: string
  fee: { sub: string; value: string }
  conversion: { sub: string; value: string; rateText: string }
  tax: { value: string; summary: string; detail: string }
  facts: string[]
  stamp: string
  /** Unrounded figures, for consumers that need them (tests, email). */
  raw: CostLines
}

/** "ex-dates 2025-10-08..2026-10-07" → ["2025-10-08", "2026-10-07"] */
export function parseWindow(window: string | null | undefined): [string, string] | null {
  const m = window?.match(/(\d{4}-\d{2}-\d{2})\s*\.\.\s*(\d{4}-\d{2}-\d{2})/)
  return m ? [m[1], m[2]] : null
}

export function terSourceText(fund: Fund): string {
  const issuer = issuerShort[fund.issuer] ?? fund.issuer
  return fund.terAsOf ? `${issuer}, k ${formatDateCz(fund.terAsOf)}` : `${issuer}, ${card.terNoDate}`
}

export function buildResult(fund: Fund, amountCzk: number, conversionRatePct: number): ResultModel {
  const lines = costLines(fund, amountCzk, conversionRatePct)
  const rateText = formatRate(conversionRatePct)
  const tax15 = formatCzkEstimate(lines.dividendTaxTreaty)
  const windowEnd =
    parseWindow(fund.yieldSource.window)?.[1] ?? fund.yieldSource.navDate ?? null

  const facts = [
    fund.exchange,
    card.facts.currency,
    card.facts.domicile,
    card.facts.since(Number(fund.inceptionDate.slice(0, 4))),
  ]
  if (/quarterly/i.test(fund.distribution)) facts.push(card.facts.quarterly)

  return {
    ticker: fund.ticker,
    name: fund.name,
    description: fundDescriptions[fund.ticker] ?? fund.indexName,
    amountText: formatCzkAmount(amountCzk),
    fee: { sub: card.fee.sub(formatTer(fund.terPct)), value: formatCzkEstimate(lines.feePerYear) },
    conversion: {
      sub: card.conversion.sub(rateText),
      value: formatCzkEstimate(lines.conversionOneOff),
      rateText,
    },
    tax: {
      value: tax15,
      summary: card.tax.summary(formatYield(lines.yieldPct), formatCzkEstimate(lines.dividendTaxDefault)),
      detail: card.tax.detail(tax15),
    },
    facts,
    stamp: card.stamp(terSourceText(fund), windowEnd ? formatDateCz(windowEnd) : '—'),
    raw: lines,
  }
}
