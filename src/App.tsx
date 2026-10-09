import { useMemo, useRef, useState } from 'react'
import { Checklist } from './components/Checklist'
import { Comparison } from './components/Comparison'
import { EtfPicker } from './components/EtfPicker'
import { Explainers } from './components/Explainers'
import { LeadForm, type SentLead } from './components/LeadForm'
import { Methodology } from './components/Methodology'
import { ResultCard } from './components/ResultCard'
import { Section } from './components/Section'
import { card, checklist, comparison, explainers, footer, hero, lead as leadCopy, sections } from './content/cs'
import { AMOUNT, CONVERSION_RATE } from './domain/calc'
import { buildComparison } from './domain/comparison'
import { defaultTicker, etfData, getFund } from './domain/etfData'
import { formatDateCz } from './domain/format'
import { buildResult } from './domain/result'

export default function App() {
  const [ticker, setTicker] = useState(defaultTicker)
  const [hasSelected, setHasSelected] = useState(false)
  const [amount, setAmount] = useState<number>(AMOUNT.default)
  const [rate, setRate] = useState<number>(CONVERSION_RATE.defaultPct)
  const [sentLead, setSentLead] = useState<SentLead | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  const result = useMemo(() => buildResult(getFund(ticker), amount, rate), [ticker, amount, rate])
  const comparisonModel = useMemo(() => buildComparison(etfData.funds, amount, rate), [amount, rate])

  const selectFund = (t: string) => {
    setTicker(t)
    setHasSelected(true)
  }

  /** From the comparison: select the fund, bring the card into view and move focus to its heading. */
  const inspectFund = (t: string) => {
    selectFund(t)
    requestAnimationFrame(() => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      cardRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
      document.getElementById('result-title')?.focus({ preventScroll: true })
    })
  }

  const selectionText = leadCopy.selection(result.ticker, result.amountText, result.conversion.rateText)
  const checklistItems = comparisonModel.allDistributing
    ? [...checklist.items, checklist.distributing(comparisonModel.fundCount)]
    : checklist.items
  const leadProps = {
    ticker,
    amountCzk: amount,
    conversionRatePct: rate,
    selectionText,
    sent: sentLead,
    onSent: setSentLead,
  }
  const backToTop = () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    document.getElementById('hero-title')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  }

  // Polite summary for screen readers on fund/amount changes (the slider has its own aria-valuetext).
  const announcement = `${result.ticker}, ${result.amountText}: ${card.fee.name} ${result.fee.value} ${card.fee.unit}, ${card.tax.name} ${result.tax.value} ${card.tax.unit}.`

  return (
    <>
      <main className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-10">
        <section aria-labelledby="hero-title" className="pb-14 pt-6 lg:grid lg:grid-cols-12 lg:items-start lg:gap-10 lg:pb-24 lg:pt-14">
          {/* Desktop: the headline and picker stay in view while the longer card scrolls past. */}
          <div className="lg:sticky lg:top-10 lg:col-span-5">
            <p className="font-mono text-label uppercase text-ink-3">
              <span aria-hidden="true" className="mr-2 inline-block size-1.5 translate-y-[-1px] bg-accent" />
              {hero.eyebrow}
            </p>
            <h1 id="hero-title" className="mt-3 text-display font-semibold text-balance max-[389px]:text-[clamp(1.875rem,9.2vw,2.25rem)] lg:mt-5 lg:text-[4.25rem]">
              {hero.titleLead}{' '}
              <em className="block font-serif text-[1.12em] font-normal italic leading-[0.95] tracking-[-0.01em]">{hero.titleAccent}</em>
            </h1>
            <p className="mt-3 max-w-[34ch] text-base leading-snug text-ink-2 lg:mt-5 lg:text-lg">{hero.lead}</p>

            <div className="mt-5 lg:mt-8">
              <EtfPicker funds={etfData.funds} value={ticker} label={hero.pickerLabel} onChange={selectFund} />
            </div>
          </div>

          {/* Desktop: a flat cobalt slab offset behind the card (visible as a 16 px edge right and
              bottom) – the accent stays distinctive without framing the figures. Mobile: no slab. */}
          <div ref={cardRef} id="vysledek" className="relative mt-4 scroll-mt-4 lg:col-span-7 lg:mb-4 lg:mr-4 lg:mt-0 lg:scroll-mt-10">
            <div aria-hidden="true" className="absolute inset-0 hidden translate-x-4 translate-y-4 rounded-md bg-accent lg:block" />
            <div className="relative">
              <ResultCard
                result={result}
                amount={amount}
                onAmountChange={setAmount}
                rate={rate}
                onRateChange={setRate}
                showDefaultRule={!hasSelected && ticker === defaultTicker}
              />
            </div>
          </div>
          <p className="sr-only" aria-live="polite">
            {announcement}
          </p>
        </section>

        {/* S3: the inline email form, directly after the result (approved page order). */}
        <section aria-label={leadCopy.inline.title} className="border-t border-ink pb-14 pt-6 lg:pb-20 lg:pt-10">
          <LeadForm position="inline" {...leadProps} confirmationChecklist={checklistItems} onBackToTop={backToTop} />
        </section>

        <Section id="srovnani" number={sections.comparison.number} label={sections.comparison.label} title={comparison.title} layout="wide">
          <Comparison
            model={comparisonModel}
            selected={ticker}
            amountText={result.amountText}
            rateText={result.conversion.rateText}
            onInspect={inspectFund}
          />
        </Section>

        <Section id="vysvetleni" number={sections.explainers.number} label={sections.explainers.label} title={explainers.title}>
          <Explainers model={comparisonModel} />
        </Section>

        <Section id="checklist" number={sections.checklist.number} label={sections.checklist.label} title={checklist.title}>
          <Checklist model={comparisonModel} />
          {/* S6: the second email form follows the checklist. */}
          <div className="mt-8">
            <LeadForm position="repeat" {...leadProps} />
          </div>
        </Section>

        <Methodology />
      </main>

      <footer className="border-t border-line">
        <div id="provozovatel" className="mx-auto flex max-w-[1200px] flex-col gap-1 px-4 py-6 text-xs text-ink-3 sm:flex-row sm:flex-wrap sm:justify-between sm:gap-x-6 sm:px-6 lg:px-10">
          <span>{footer.dataAsOf(formatDateCz(etfData.accessed))}</span>
          <span>{footer.operatorPlaceholder}</span>
          <span>{footer.privacyPlaceholder}</span>
        </div>
      </footer>
    </>
  )
}
