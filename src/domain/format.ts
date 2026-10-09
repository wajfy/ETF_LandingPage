/**
 * Display formatting – the ONLY place where rounding happens (README §3a, research F3).
 * Czech conventions: decimal comma, non-breaking space as thousands separator and before units.
 * Shared by the page and (later) the email renderer.
 */

const NBSP = ' '

/**
 * Rounding rule for CZK figures: 3 significant digits, never finer than whole CZK, ties half-up.
 * Floating-point noise is removed first, so a computed 94.49999999999999 is treated as 94.5 → 95.
 * Examples: 155.93 → 156 · 94.5 → 95 · 999.5 → 1 000 · 1 005 → 1 010 · 15 593 → 15 600.
 */
export function roundCzk(value: number): number {
  if (!Number.isFinite(value)) throw new RangeError(`not a finite number: ${value}`)
  if (value === 0) return 0
  const v = Math.round(value * 1e6) / 1e6
  const exponent = Math.floor(Math.log10(Math.abs(v))) - 2
  if (exponent <= 0) return Math.round(v) // below 1 000 CZK: whole crowns
  const step = 10 ** exponent
  return Math.round(v / step) * step // 1 000 CZK and above: 3 significant digits
}

const czInt = new Intl.NumberFormat('cs-CZ', { maximumFractionDigits: 0 })
const czNumber = (v: number, min: number, max: number) =>
  new Intl.NumberFormat('cs-CZ', { minimumFractionDigits: min, maximumFractionDigits: max }).format(v)

/** An estimated CZK figure: "0 Kč", "< 1 Kč" or "≈ 1 234 Kč". */
export function formatCzkEstimate(value: number): string {
  if (value === 0) return `0${NBSP}Kč`
  if (value < 0.5) return `<${NBSP}1${NBSP}Kč`
  return `≈${NBSP}${czInt.format(roundCzk(value))}${NBSP}Kč`
}

/** An exact amount the user chose, e.g. "100 000 Kč". */
export function formatCzkAmount(value: number): string {
  return `${czInt.format(value)}${NBSP}Kč`
}

/** TER exactly as published (a fact): at least 2, at most 4 decimals – "0,03 %", "0,0945 %". */
export function formatTer(pct: number): string {
  return `${czNumber(pct, 2, 4)}${NBSP}%`
}

/** Historical yield, displayed to 2 decimals – "1,04 %". */
export function formatYield(pct: number): string {
  return `${czNumber(pct, 2, 2)}${NBSP}%`
}

/** Model conversion rate with only the decimals the slider uses – "0,5 %", "0,45 %", "1 %". */
export function formatRate(pct: number): string {
  return `${czNumber(pct, 0, 2)}${NBSP}%`
}

/** Percentage points, trimmed – "0,0745". */
export function formatPctPoints(value: number): string {
  return czNumber(Math.round(value * 1e6) / 1e6, 0, 4)
}

/** ISO date → Czech short date, e.g. "2026-04-28" → "28. 4. 2026". */
export function formatDateCz(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return `${d}.${NBSP}${m}.${NBSP}${y}`
}
