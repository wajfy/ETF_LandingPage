import { describe, expect, it } from 'vitest'
import {
  formatCzkAmount,
  formatCzkEstimate,
  formatDateCz,
  formatPctPoints,
  formatRate,
  formatTer,
  formatYield,
  roundCzk,
} from './format'

// Czech formatting uses a non-breaking space; normalise for readable assertions.
const n = (s: string) => s.replace(/ /g, ' ')

describe('roundCzk – rounding edge cases (README §10 acceptance criteria)', () => {
  it.each([
    [94.5, 95],
    [155.93, 156],
    [999.5, 1_000],
    [1_004, 1_000],
    [1_005, 1_010],
    [15_593, 15_600],
    [0, 0],
  ])('%d → %d', (input, expected) => {
    expect(roundCzk(input)).toBe(expected)
  })

  it('rounds the SPY fee of 94.50 Kč half-up to 95 (research F3)', () => {
    expect(roundCzk((100_000 * 0.0945) / 100)).toBe(95)
  })

  it('removes floating-point noise before rounding half-up', () => {
    expect(roundCzk(94.49999999999999)).toBe(95)
    expect(roundCzk(94.50000000000001)).toBe(95)
    expect(roundCzk(1_004.9999999999999)).toBe(1_010)
  })

  it('never shows more than whole crowns below 1 000 Kč', () => {
    expect(roundCzk(3.4)).toBe(3)
    expect(roundCzk(15.59)).toBe(16)
    expect(roundCzk(161.28)).toBe(161)
  })

  it('keeps 3 significant digits for large figures', () => {
    expect(roundCzk(48_442)).toBe(48_400)
    expect(roundCzk(9_450)).toBe(9_450)
    expect(roundCzk(1_234_567)).toBe(1_230_000)
  })

  it('rejects non-finite input', () => {
    expect(() => roundCzk(Number.NaN)).toThrow(RangeError)
  })
})

describe('formatCzkEstimate', () => {
  it.each([
    [0, '0 Kč'],
    [0.4, '< 1 Kč'],
    [0.5, '≈ 1 Kč'],
    [0.6, '≈ 1 Kč'],
    [155.93, '≈ 156 Kč'],
    [15_593, '≈ 15 600 Kč'],
  ])('%d → "%s"', (input, expected) => {
    expect(n(formatCzkEstimate(input))).toBe(expected)
  })

  it('keeps number and unit together with non-breaking spaces', () => {
    expect(formatCzkEstimate(15_593)).toBe('≈ 15 600 Kč')
  })
})

describe('other display formats', () => {
  it('formats the chosen amount exactly', () => {
    expect(n(formatCzkAmount(100_000))).toBe('100 000 Kč')
  })
  it('shows TER as published (2–4 decimals)', () => {
    expect(n(formatTer(0.03))).toBe('0,03 %')
    expect(n(formatTer(0.0945))).toBe('0,0945 %')
    expect(n(formatTer(0.02))).toBe('0,02 %')
  })
  it('shows the yield to 2 decimals', () => {
    expect(n(formatYield(1.0395488))).toBe('1,04 %')
    expect(n(formatYield(3.2294730))).toBe('3,23 %')
    expect(n(formatYield(1))).toBe('1,00 %')
  })
  it('shows the model rate with only the decimals the slider uses', () => {
    expect(n(formatRate(0.5))).toBe('0,5 %')
    expect(n(formatRate(0.45))).toBe('0,45 %')
    expect(n(formatRate(1))).toBe('1 %')
    expect(n(formatRate(0))).toBe('0 %')
  })
  it('formats the fee gap without float noise', () => {
    expect(formatPctPoints(0.0945 - 0.02)).toBe('0,0745')
  })
  it('formats ISO dates the Czech way', () => {
    expect(n(formatDateCz('2026-04-28'))).toBe('28. 4. 2026')
  })
})
