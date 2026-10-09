import type { ReactNode } from 'react'
import { card } from '../content/cs'
import { CONVERSION_RATE } from '../domain/calc'
import type { ResultModel } from '../domain/result'
import { AmountControl } from './AmountControl'

interface Props {
  result: ResultModel
  amount: number
  onAmountChange: (amountCzk: number) => void
  rate: number
  onRateChange: (ratePct: number) => void
  showDefaultRule: boolean
}

/** One cost line. All three lines share this exact structure and visual weight (README §3a). */
function CostLine(props: { name: string; sub: string; value: string; unit: string; children: ReactNode }) {
  return (
    <div className="border-t border-line px-4 py-4 sm:px-6">
      <div className="grid grid-cols-[1fr_auto] items-start gap-x-4">
        <div>
          <h3 className="text-[15px] font-semibold leading-snug">{props.name}</h3>
          <p className="mt-0.5 text-[13px] leading-snug text-ink-3">{props.sub}</p>
        </div>
        <p className="text-right">
          <span className="block text-figure font-semibold text-ink figures whitespace-nowrap">{props.value}</span>
          <span className="mt-1.5 block font-mono text-label uppercase text-ink-3">{props.unit}</span>
        </p>
      </div>
      {props.children}
    </div>
  )
}

export function ResultCard({ result, amount, onAmountChange, rate, onRateChange, showDefaultRule }: Props) {
  return (
    <article aria-labelledby="result-title" className="overflow-hidden rounded-md border border-line bg-surface">
      <header className="px-4 pt-4 sm:px-6 sm:pt-6">
        <h2 id="result-title" className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
          <span className="text-[1.75rem] font-semibold leading-none tracking-[-0.025em]">{result.ticker}</span>
          <span className="text-sm text-ink-2">{result.name}</span>
        </h2>
        <p className="mt-2 text-sm leading-snug text-ink-2">{result.description}</p>
        {showDefaultRule && <p className="mt-1 text-xs text-ink-3">{card.defaultRule}</p>}

        <p className="mt-4 flex flex-wrap items-baseline gap-x-1.5 pb-4 text-[15px] font-semibold leading-relaxed">
          <span>{card.amountLead}</span>
          <AmountControl value={amount} onChange={onAmountChange} />
          <span className="font-normal text-ink-3">{card.amountTail}</span>
        </p>
      </header>

      <CostLine name={card.fee.name} sub={result.fee.sub} value={result.fee.value} unit={card.fee.unit}>
        <p className="mt-2 text-[13.5px] leading-snug text-ink-2">{card.fee.note}</p>
      </CostLine>

      <CostLine name={card.conversion.name} sub={result.conversion.sub} value={result.conversion.value} unit={card.conversion.unit}>
        <p className="mt-2 text-[13.5px] leading-snug text-ink-2">{card.conversion.note}</p>
        <div className="mt-3">
          <label htmlFor="rate" className="flex items-baseline justify-between text-[13px] text-ink-2">
            <span>{card.conversion.sliderLabel}</span>
            <span className="font-semibold text-ink">{result.conversion.rateText}</span>
          </label>
          <input
            id="rate"
            type="range"
            className="range block w-full"
            min={CONVERSION_RATE.minPct}
            max={CONVERSION_RATE.maxPct}
            step={CONVERSION_RATE.stepPct}
            value={rate}
            aria-valuetext={`${result.conversion.rateText}, směna ${result.conversion.value}`}
            onChange={(e) => onRateChange(Number(e.target.value))}
          />
          <div className="-mt-1 flex justify-between font-mono text-label uppercase text-ink-3">
            <span>0 %</span>
            <span>{card.conversion.sliderCaption}</span>
            <span>1 %</span>
          </div>
        </div>
      </CostLine>

      <CostLine name={card.tax.name} sub={card.tax.sub} value={result.tax.value} unit={card.tax.unit}>
        <p className="mt-2 text-[13.5px] leading-snug text-ink-2">{result.tax.note}</p>
      </CostLine>

      <footer className="border-t border-line px-4 pb-5 pt-4 sm:px-6">
        <p className="border-l-2 border-ink pl-3 text-[13.5px] leading-snug text-ink">{card.noTotal}</p>

        <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Základní údaje o fondu">
          {result.facts.map((f) => (
            <li key={f} className="rounded-xs border border-line px-1.5 py-0.5 font-mono text-[11px] text-ink-2">
              {f}
            </li>
          ))}
        </ul>

        <div className="mt-4 rounded-sm bg-tint px-3.5 py-3">
          <h3 className="text-sm font-semibold">{card.kid.title}</h3>
          <p className="mt-1 text-[13.5px] leading-snug text-ink-2">{card.kid.body}</p>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-ink-3">
          {result.stamp}{' '}
          <a href="#metodika" className="whitespace-nowrap font-medium text-accent underline underline-offset-2">
            {card.methodLink}
          </a>
        </p>
      </footer>
    </article>
  )
}
