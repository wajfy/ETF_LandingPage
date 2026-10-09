import { useMemo, useState } from 'react'
import { EtfPicker } from './components/EtfPicker'
import { Methodology } from './components/Methodology'
import { ResultCard } from './components/ResultCard'
import { card, footer, hero } from './content/cs'
import { AMOUNT, CONVERSION_RATE } from './domain/calc'
import { defaultTicker, etfData, getFund } from './domain/etfData'
import { formatDateCz } from './domain/format'
import { buildResult } from './domain/result'

export default function App() {
  const [ticker, setTicker] = useState(defaultTicker)
  const [hasSelected, setHasSelected] = useState(false)
  const [amount, setAmount] = useState<number>(AMOUNT.default)
  const [rate, setRate] = useState<number>(CONVERSION_RATE.defaultPct)

  const result = useMemo(() => buildResult(getFund(ticker), amount, rate), [ticker, amount, rate])

  // Polite summary for screen readers on fund/amount changes (the slider has its own aria-valuetext).
  const announcement = `${result.ticker}, ${result.amountText}: ${card.fee.name} ${result.fee.value} ${card.fee.unit}, ${card.tax.name} ${result.tax.value} ${card.tax.unit}.`

  return (
    <>
      <main className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-10">
        <section aria-labelledby="hero-title" className="pb-4 pt-6 lg:grid lg:grid-cols-12 lg:items-start lg:gap-10 lg:pb-20 lg:pt-16">
          <div className="lg:col-span-5 lg:pt-6">
            <p className="font-mono text-label uppercase text-ink-3">
              <span aria-hidden="true" className="mr-2 inline-block size-1.5 translate-y-[-1px] bg-accent" />
              {hero.eyebrow}
            </p>
            <h1 id="hero-title" className="mt-3 text-display font-semibold text-balance max-[389px]:text-[clamp(1.875rem,9.2vw,2.25rem)] lg:mt-5 lg:text-[4.25rem]">
              {hero.titleLead}{' '}
              <em className="block font-serif text-[1.12em] font-normal italic leading-[0.95] tracking-[-0.01em]">{hero.titleAccent}</em>
            </h1>
            <p className="mt-3 max-w-[34ch] text-base leading-snug text-ink-2 lg:mt-6 lg:text-lg">{hero.lead}</p>

            <div className="mt-5 lg:mt-10">
              <EtfPicker
                funds={etfData.funds}
                value={ticker}
                label={hero.pickerLabel}
                onChange={(t) => {
                  setTicker(t)
                  setHasSelected(true)
                }}
              />
            </div>
          </div>

          {/* Desktop: the card sits on a flat accent block; on mobile it follows the picker directly. */}
          <div className="mt-4 lg:col-span-7 lg:mt-0 lg:rounded-md lg:bg-accent lg:p-8">
            <ResultCard
              result={result}
              amount={amount}
              onAmountChange={setAmount}
              rate={rate}
              onRateChange={setRate}
              showDefaultRule={!hasSelected && ticker === defaultTicker}
            />
          </div>
          <p className="sr-only" aria-live="polite">
            {announcement}
          </p>
        </section>

        <div className="pb-16 pt-12 lg:pb-24 lg:pt-4">
          <Methodology />
        </div>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-1 px-4 py-6 text-xs text-ink-3 sm:flex-row sm:justify-between sm:px-6 lg:px-10">
          <span>{footer.dataAsOf(formatDateCz(etfData.accessed))}</span>
          <span>{footer.operatorPlaceholder}</span>
        </div>
      </footer>
    </>
  )
}
