import { describe, expect, it } from 'vitest'
import { checklist, email as copy } from '../content/cs'
import { buildComparison } from '../domain/comparison'
import { etfData, getFund } from '../domain/etfData'
import { buildResult } from '../domain/result'
import { renderLeadEmail } from './leadEmail'

const n = (s: string) => s.replace(/ /g, ' ').replace(/⁠/g, '')
const input = { ticker: 'VOO', amountCzk: 100_000, conversionRatePct: 0.5 }
const out = renderLeadEmail(input)
const html = n(out.html)
const text = n(out.text)

describe('lead email content', () => {
  it('uses the approved subject', () => {
    expect(out.subject).toBe(copy.subject)
  })

  it('contains exactly the card figures for the requested fund (same modules, same rounding)', () => {
    const r = buildResult(getFund('VOO'), 100_000, 0.5)
    for (const v of [r.fee.value, r.conversion.value, r.tax.value].map(n)) {
      expect(html).toContain(v)
      expect(text).toContain(v)
    }
    expect(text).toContain('≈ 30 Kč') // research F3: VOO fee
    expect(text).toContain('≈ 156 Kč') // research F3: VOO tax 15 %
    expect(text).toContain('VOO · 100 000 Kč · směna 0,5 %')
  })

  it('contains the full 7-fund comparison with the page figures', () => {
    const m = buildComparison(etfData.funds, 100_000, 0.5)
    for (const row of m.groups.flatMap((g) => g.rows)) {
      expect(text).toContain(`${row.ticker} (${row.indexName})`)
      expect(text).toContain(n(row.feeText))
      expect(text).toContain(n(row.taxText))
      expect(html).toContain(n(row.yieldText))
    }
    expect(text).toContain('Fondy IVV, SPY, SPYM a VOO sledují stejný index S&P 500')
    expect(text).toContain('Směna korun na dolary je pro všechny fondy stejná')
  })

  it('matches the page figures for every fund, amount and rate combination', () => {
    for (const fund of etfData.funds) {
      for (const amountCzk of [1_000, 12_345, 100_000, 777_777, 10_000_000]) {
        for (const conversionRatePct of [0, 0.35, 1]) {
          const r = buildResult(fund, amountCzk, conversionRatePct)
          const out = renderLeadEmail({ ticker: fund.ticker, amountCzk, conversionRatePct })
          const [h, t] = [n(out.html), n(out.text)]
          for (const v of [r.fee.value, r.conversion.value, r.tax.value].map(n)) {
            expect(h).toContain(v.replace('<', '&lt;')) // "< 1 Kč" is HTML-escaped
            expect(t).toContain(v)
          }
          for (const row of buildComparison(etfData.funds, amountCzk, conversionRatePct).groups.flatMap((g) => g.rows)) {
            expect(t).toContain(n(row.feeText))
            expect(t).toContain(n(row.taxText))
          }
        }
      }
    }
  })

  it('follows the requested amount and rate', () => {
    const t = n(renderLeadEmail({ ticker: 'SCHD', amountCzk: 10_000, conversionRatePct: 1 }).text)
    expect(t).toContain('SCHD · 10 000 Kč · směna 1 %')
    expect(t).toContain('≈ 100 Kč jednorázově') // 1 % of 10 000 Kč
    expect(t).toContain('≈ 48 Kč') // SCHD tax at 10 000 Kč
  })

  it('contains the checklist, the methodology with source dates, and the caveats', () => {
    for (const item of checklist.items) expect(text).toContain(n(item.title))
    expect(text).toContain('Všech 7 fondů z prověrky dividendy vyplácí')
    expect(text).toContain('ne předpověď')
    expect(text).toContain('nejde o výpočet vaší daně')
    expect(text).toContain('Položky záměrně nesčítáme')
    expect(text).toContain('data k 8. 10. 2026')
    expect(text).toContain('od 8. 10. 2025 do 7. 10. 2026') // dividend window
    expect(text).toContain('1 USD = 21,811 Kč (ČNB, 8. 10. 2026)')
    expect(text).toContain('https://www.xtb.com/cz/soubory/tabulka-poplatku-a-provizi.pdf')
    expect(text).toContain(copy.footer.notAdvice)
    expect(text).toContain('Další zprávy vám neposíláme')
  })

  it('shows the operator placeholder until an operator line is configured', () => {
    expect(text).toContain(copy.footer.operatorPlaceholder)
    const withOperator = renderLeadEmail({ ...input, operatorLine: 'Provozovatel: Test s.r.o., IČO 1' })
    expect(withOperator.text).toContain('Provozovatel: Test s.r.o., IČO 1')
    expect(withOperator.text).not.toContain(copy.footer.operatorPlaceholder)
  })

  it('escapes HTML in configured text', () => {
    const r = renderLeadEmail({ ...input, operatorLine: '<script>alert(1)</script>' })
    expect(r.html).not.toContain('<script>alert(1)</script>')
    expect(r.html).toContain('&lt;script&gt;')
  })

  it('is deterministic (required for idempotent retries)', () => {
    expect(renderLeadEmail(input)).toEqual(renderLeadEmail(input))
  })

  it('contains no marketing opt-in and no word-joiner characters in plain text', () => {
    expect(text).not.toMatch(/newsletter|odběr|souhlas s marketingem/i)
    expect(out.text).not.toContain('⁠')
  })
})
