/**
 * ETF data: loading and validation.
 *
 * research/etf-data.json is the single source of truth (README §10). This module reads it,
 * validates the fields the app depends on, and exposes typed, alphabetically ordered funds.
 * It does not round or derive figures – see calc.ts (full precision) and format.ts (display).
 */
import rawData from '../../research/etf-data.json'

export type YieldSource =
  /** Unrounded: sum of the distributions in the past 365 days ÷ NAV. */
  | { kind: 'distributions'; distributionsUsd: number[]; navUsd: number; navDate: string; window: string }
  /** Issuer-published "Fund Distribution Yield" (SPY, SPYM), already rounded by the issuer. */
  | { kind: 'issuer'; valuePct: number; navDate: string | null; window: string | null }

export interface Fund {
  ticker: string
  name: string
  issuer: string
  exchange: string
  domicile: string
  indexName: string
  /** Expense ratio in percent, exactly as published by the issuer. */
  terPct: number
  /** ISO date of the issuer's TER figure, or null when the issuer gives none. */
  terAsOf: string | null
  distribution: string
  inceptionDate: string
  sourceUrl: string
  yieldSource: YieldSource
}

export interface EtfDataset {
  accessed: string
  exchangeRate: { usdCzk: number; date: string; sourceUrl: string }
  /** Core funds only, sorted alphabetically by ticker. */
  funds: Fund[]
}

export class EtfDataError extends Error {
  readonly issues: string[]
  constructor(issues: string[]) {
    super(`Invalid research/etf-data.json:\n- ${issues.join('\n- ')}`)
    this.issues = issues
  }
}

type Json = Record<string, unknown>
const isObj = (v: unknown): v is Json => typeof v === 'object' && v !== null && !Array.isArray(v)
const isStr = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0
const isPosNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v > 0
const isIsoDate = (v: unknown): v is string => isStr(v) && /^\d{4}-\d{2}-\d{2}$/.test(v)

function readFund(raw: Json, issues: string[]): Fund | null {
  const t = isStr(raw.ticker) ? raw.ticker : '(unknown ticker)'
  const at = (field: string) => `${t}: ${field}`
  const before = issues.length
  const field = (key: string): Json => (isObj(raw[key]) ? (raw[key] as Json) : {})

  if (!isStr(raw.ticker)) issues.push(at('ticker missing'))
  if (!isStr(raw.name)) issues.push(at('name missing'))
  if (!isStr(raw.issuer)) issues.push(at('issuer missing'))
  if (!isStr(field('exchange').value)) issues.push(at('exchange.value missing'))
  if (!isStr(field('domicile').value)) issues.push(at('domicile.value missing'))
  if (!isStr(field('index').value)) issues.push(at('index.value missing'))
  if (!isStr(field('distribution').value)) issues.push(at('distribution.value missing'))
  if (!isIsoDate(raw.inception)) issues.push(at('inception must be YYYY-MM-DD'))
  if (!isStr(raw.source) || !/^https:\/\//.test(raw.source as string)) issues.push(at('source must be an https URL'))

  const ter = field('expense_ratio_pct')
  if (!isPosNum(ter.value)) issues.push(at('expense_ratio_pct.value must be a positive number'))
  if (!(ter.as_of === null || isIsoDate(ter.as_of))) issues.push(at('expense_ratio_pct.as_of must be YYYY-MM-DD or null'))

  const y = field('trailing_dividend_yield_pct')
  let yieldSource: YieldSource | null = null
  const dist = y.distributions_per_share_usd
  if (Array.isArray(dist) && dist.length > 0) {
    if (!dist.every(isPosNum)) issues.push(at('distributions_per_share_usd must contain positive numbers'))
    if (!isPosNum(y.nav_usd)) issues.push(at('nav_usd must be a positive number when distributions are given'))
    if (!isIsoDate(y.nav_date)) issues.push(at('trailing_dividend_yield_pct.nav_date must be YYYY-MM-DD'))
    yieldSource = {
      kind: 'distributions',
      distributionsUsd: dist as number[],
      navUsd: y.nav_usd as number,
      navDate: y.nav_date as string,
      window: String(y.window ?? ''),
    }
  } else if (isPosNum(y.value) && y.status === 'verified') {
    // Issuer-published yield (verified from the issuer page).
    yieldSource = {
      kind: 'issuer',
      valuePct: y.value as number,
      navDate: isIsoDate(y.nav_date) ? (y.nav_date as string) : null,
      window: isStr(y.window) ? (y.window as string) : null,
    }
  } else {
    issues.push(at('trailing_dividend_yield_pct needs distributions + nav_usd, or a verified issuer value'))
  }

  if (issues.length > before || !yieldSource) return null
  return {
    ticker: raw.ticker as string,
    name: raw.name as string,
    issuer: raw.issuer as string,
    exchange: field('exchange').value as string,
    domicile: field('domicile').value as string,
    indexName: field('index').value as string,
    terPct: ter.value as number,
    terAsOf: (ter.as_of as string | null) ?? null,
    distribution: field('distribution').value as string,
    inceptionDate: raw.inception as string,
    sourceUrl: raw.source as string,
    yieldSource,
  }
}

/** Validates the raw JSON and returns the typed dataset. Throws EtfDataError listing every problem. */
export function parseEtfData(raw: unknown): EtfDataset {
  const issues: string[] = []
  if (!isObj(raw)) throw new EtfDataError(['root must be an object'])
  const meta = isObj(raw._meta) ? raw._meta : {}
  if (!isIsoDate(meta.accessed)) issues.push('_meta.accessed must be YYYY-MM-DD')

  const fx = isObj(meta.exchange_rate) ? meta.exchange_rate : {}
  if (!isPosNum(fx.USD_CZK)) issues.push('_meta.exchange_rate.USD_CZK must be a positive number')
  if (!isIsoDate(fx.date)) issues.push('_meta.exchange_rate.date must be YYYY-MM-DD')
  if (!isStr(fx.url)) issues.push('_meta.exchange_rate.url missing')

  if (!Array.isArray(raw.funds)) {
    issues.push('funds must be an array')
    throw new EtfDataError(issues)
  }
  const funds = raw.funds
    .filter((f): f is Json => isObj(f) && f.role === 'core')
    .map((f) => readFund(f, issues))
    .filter((f): f is Fund => f !== null)
    .sort((a, b) => a.ticker.localeCompare(b.ticker, 'en'))

  const tickers = new Set(funds.map((f) => f.ticker))
  if (tickers.size !== funds.length) issues.push('duplicate tickers among core funds')
  if (funds.length === 0) issues.push('no core funds')
  if (issues.length) throw new EtfDataError(issues)

  return {
    accessed: meta.accessed as string,
    exchangeRate: { usdCzk: fx.USD_CZK as number, date: fx.date as string, sourceUrl: fx.url as string },
    funds,
  }
}

/** The validated dataset. Importing this module fails fast (and fails the build/tests) on invalid data. */
export const etfData: EtfDataset = parseEtfData(rawData)

/** Default selection rule (README §3a): the first fund in alphabetical order. */
export const defaultTicker: string = etfData.funds[0].ticker

export function getFund(ticker: string): Fund {
  const f = etfData.funds.find((x) => x.ticker === ticker)
  if (!f) throw new Error(`Unknown ticker ${ticker}`)
  return f
}
