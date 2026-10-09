import type { Fund } from '../domain/etfData'

interface Props {
  funds: Fund[]
  value: string
  onChange: (ticker: string) => void
  label: string
}

/**
 * Seven tickers as one segmented row (native radio group → arrow keys and screen readers work
 * without extra code). Order comes from the data (alphabetical); nothing is ranked or badged.
 */
export function EtfPicker({ funds, value, onChange, label }: Props) {
  return (
    <fieldset>
      <legend className="mb-2 font-mono text-label uppercase text-ink-3">{label}</legend>
      <div className="grid grid-cols-7 overflow-hidden rounded-sm border border-ink">
        {funds.map((f, i) => {
          const checked = f.ticker === value
          return (
            <label
              key={f.ticker}
              className={[
                'relative flex h-11 cursor-pointer items-center justify-center font-mono text-[13px] font-medium tracking-tight transition-colors',
                i > 0 ? 'border-l border-ink' : '',
                checked ? 'bg-accent text-white' : 'bg-surface text-ink hover:bg-accent-tint',
                'has-[:focus-visible]:z-10 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-[-4px] has-[:focus-visible]:outline-white',
              ].join(' ')}
            >
              <input
                type="radio"
                name="etf"
                value={f.ticker}
                checked={checked}
                onChange={() => onChange(f.ticker)}
                className="sr-only"
                aria-label={`${f.ticker} – ${f.name}`}
              />
              {f.ticker}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
