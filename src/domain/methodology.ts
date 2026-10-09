/**
 * Methodology rows – shared by the page (Methodology section) and the email, so both state
 * exactly the same assumptions, dates and sources. Framework-free.
 */
import { methodology as m } from '../content/cs'
import { etfData } from './etfData'
import { formatDateCz } from './format'
import { parseWindow } from './result'

export interface MethodologyRow {
  label: string
  text: string
}

export interface SourceLink {
  label: string
  href: string
}

export function methodologyRows(): MethodologyRow[] {
  const firstComputed = etfData.funds.find((f) => f.yieldSource.kind === 'distributions')
  const window = parseWindow(firstComputed?.yieldSource.window)
  const navDate = firstComputed?.yieldSource.navDate
  const fx = etfData.exchangeRate
  const usdCzk = new Intl.NumberFormat('cs-CZ', { minimumFractionDigits: 3 }).format(fx.usdCzk)
  return [
    { label: m.labels.fee, text: m.items.fee },
    { label: m.labels.conversion, text: m.items.conversion },
    {
      label: m.labels.tax,
      text: m.items.tax(
        window ? formatDateCz(window[0]) : '—',
        window ? formatDateCz(window[1]) : '—',
        navDate ? formatDateCz(navDate) : '—',
      ),
    },
    { label: m.labels.notIncluded, text: m.items.notIncluded },
    { label: m.labels.rounding, text: m.items.rounding },
    { label: m.labels.comparison, text: m.items.comparison },
    { label: m.labels.fx, text: m.items.fx(usdCzk, formatDateCz(fx.date)) },
  ]
}

/** Every source: one per fund (issuer page, from the data), then the shared ones, then ČNB. */
export function sourceLinks(): SourceLink[] {
  return [
    ...etfData.funds.map((f) => ({ label: `${f.ticker} · ${f.issuer}`, href: f.sourceUrl })),
    ...m.otherSources,
    { label: m.fxSourceLabel, href: etfData.exchangeRate.sourceUrl },
  ]
}
