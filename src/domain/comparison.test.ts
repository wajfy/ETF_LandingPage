import { describe, expect, it } from 'vitest'
import { costLines } from './calc'
import { buildComparison } from './comparison'
import { etfData, getFund } from './etfData'
import { buildResult } from './result'

const n = (s: string) => s.replace(/ /g, ' ')
const model = buildComparison(etfData.funds, 100_000, 0.5)
const rows = model.groups.flatMap((g) => g.rows)

/** research F3 (100 000 Kč): fee per year and dividend tax 15 %. */
const F3: Record<string, [string, string]> = {
  IVV: ['≈ 30 Kč', '≈ 161 Kč'],
  SCHD: ['≈ 60 Kč', '≈ 484 Kč'],
  SPY: ['≈ 95 Kč', '≈ 147 Kč'],
  SPYM: ['≈ 20 Kč', '≈ 150 Kč'],
  VOO: ['≈ 30 Kč', '≈ 156 Kč'],
  VT: ['≈ 60 Kč', '≈ 227 Kč'],
  VTI: ['≈ 30 Kč', '≈ 155 Kč'],
}

describe('comparison model', () => {
  it('contains all seven funds, alphabetical within each group', () => {
    expect(model.groups[0].rows.map((r) => r.ticker)).toEqual(['IVV', 'SPY', 'SPYM', 'VOO'])
    expect(model.groups[1].rows.map((r) => r.ticker)).toEqual(['SCHD', 'VT', 'VTI'])
    expect(model.fundCount).toBe(7)
  })

  it.each(Object.entries(F3))('%s matches research F3 at 100 000 Kč', (ticker, [fee, tax]) => {
    const r = rows.find((x) => x.ticker === ticker)!
    expect([n(r.feeText), n(r.taxText)]).toEqual([fee, tax])
  })

  it('shows exactly the same figures as the result card for every fund and amount', () => {
    for (const amount of [1_000, 10_000, 100_000, 2_500_000, 10_000_000]) {
      const m = buildComparison(etfData.funds, amount, 0.5)
      for (const r of m.groups.flatMap((g) => g.rows)) {
        const card = buildResult(getFund(r.ticker), amount, 0.5)
        expect(r.feeText).toBe(card.fee.value)
        expect(r.taxText).toBe(card.tax.value)
        expect(r.terText).toBe(card.fee.sub.replace(/^TER /, '').replace(/ ročně$/, ''))
      }
    }
  })

  it('states the conversion once (it does not depend on the fund)', () => {
    expect(n(model.conversionText)).toBe('≈ 500 Kč')
    for (const f of etfData.funds) expect(costLines(f, 100_000, 0.5).conversionOneOff).toBe(500)
  })

  it('derives the summary facts from the data', () => {
    expect(model.sameIndexGapText).toBe('0,0745')
    expect(model.sameIndexTickers).toEqual(['IVV', 'SPY', 'SPYM', 'VOO'])
    expect(model.terRangeText.map(n)).toEqual(['0,02 %', '0,0945 %'])
    expect(model.allDistributing).toBe(true)
  })

  it('shows yields to two decimals, as on the card', () => {
    expect(n(rows.find((r) => r.ticker === 'IVV')!.yieldText)).toBe('1,08 %')
    expect(n(rows.find((r) => r.ticker === 'SPY')!.yieldText)).toBe('0,98 %')
  })
})
