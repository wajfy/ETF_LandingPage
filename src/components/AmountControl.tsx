import { useId, useState, type ReactNode } from 'react'
import { card } from '../content/cs'
import { AMOUNT, isValidAmount } from '../domain/calc'
import { formatCzkAmount } from '../domain/format'

interface Props {
  value: number
  onChange: (amountCzk: number) => void
  /** Rendered on the same baseline, right-aligned (e.g. the "(orientačně, 1 rok)" label). */
  suffix?: ReactNode
}

const CUSTOM = 'custom'

/**
 * Amount selector for the card heading: presets plus "jiná částka…", set as a typographic value
 * (underlined figure) rather than a boxed form control.
 * Invalid custom input shows an error and keeps the last valid amount (README §3a).
 */
export function AmountControl({ value, onChange, suffix }: Props) {
  const id = useId()
  const [custom, setCustom] = useState(false)
  const [draft, setDraft] = useState(String(value))
  const [invalid, setInvalid] = useState(false)
  const isPreset = (AMOUNT.presets as readonly number[]).includes(value)
  const showCustom = custom || !isPreset

  return (
    <>
      <span className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <select
          aria-label="Částka investice"
          className="select-inline -ml-px cursor-pointer border-b-[1.5px] border-ink bg-transparent pb-0.5 text-[1.25rem] font-semibold leading-tight tracking-[-0.025em] text-ink figures hover:border-accent"
          value={showCustom ? CUSTOM : String(value)}
          onChange={(e) => {
            if (e.target.value === CUSTOM) {
              setCustom(true)
              setDraft(String(value))
              setInvalid(false)
              requestAnimationFrame(() => document.getElementById(`${id}-custom`)?.focus())
              return
            }
            setCustom(false)
            setInvalid(false)
            onChange(Number(e.target.value))
          }}
        >
          {AMOUNT.presets.map((p) => (
            <option key={p} value={p}>
              {formatCzkAmount(p)}
            </option>
          ))}
          <option value={CUSTOM}>{showCustom ? formatCzkAmount(value) : card.amountCustomOption}</option>
        </select>
        {suffix}
      </span>
      {showCustom && (
        <span className="mt-3 flex flex-col gap-1">
          <label htmlFor={`${id}-custom`} className="font-mono text-label uppercase text-ink-3">
            {card.amountCustomLabel}
          </label>
          <span className="flex items-baseline gap-2">
            <input
              id={`${id}-custom`}
              type="number"
              inputMode="numeric"
              min={AMOUNT.min}
              max={AMOUNT.max}
              step={1000}
              placeholder={card.amountCustomPlaceholder}
              aria-invalid={invalid}
              aria-describedby={invalid ? `${id}-err` : undefined}
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value)
                const v = Number(e.target.value)
                const ok = e.target.value.trim() !== '' && isValidAmount(v)
                setInvalid(!ok)
                if (ok) onChange(Math.round(v))
              }}
              className="h-11 w-40 border-b-[1.5px] border-ink bg-transparent text-lg font-semibold text-ink figures outline-offset-4 placeholder:font-normal placeholder:text-ink-3 aria-[invalid=true]:border-error"
            />
            <span className="text-lg font-semibold text-ink">Kč</span>
          </span>
          {invalid && (
            <span id={`${id}-err`} role="alert" className="text-[13px] font-normal text-error">
              {card.amountError(formatCzkAmount(AMOUNT.min), formatCzkAmount(AMOUNT.max))}
            </span>
          )}
        </span>
      )}
    </>
  )
}
