import { useId, useState } from 'react'
import { card } from '../content/cs'
import { AMOUNT, isValidAmount } from '../domain/calc'
import { formatCzkAmount } from '../domain/format'

interface Props {
  value: number
  onChange: (amountCzk: number) => void
}

const CUSTOM = 'custom'

/**
 * Inline amount selector for the card heading: presets plus "jiná částka…".
 * Invalid custom input shows an error and keeps the last valid amount (README §3a).
 */
export function AmountControl({ value, onChange }: Props) {
  const id = useId()
  const [custom, setCustom] = useState(false)
  const [draft, setDraft] = useState(String(value))
  const [invalid, setInvalid] = useState(false)
  const isPreset = (AMOUNT.presets as readonly number[]).includes(value)

  return (
    <>
      <select
        aria-label="Částka investice"
        className="select-inline cursor-pointer border-b-[1.5px] border-ink bg-transparent py-0.5 font-semibold text-ink figures"
        value={custom || !isPreset ? CUSTOM : String(value)}
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
        <option value={CUSTOM}>{custom || !isPreset ? formatCzkAmount(value) : card.amountCustomOption}</option>
      </select>
      {(custom || !isPreset) && (
        <span className="mt-2 flex basis-full flex-col gap-1">
          <span className="flex items-center gap-2">
            <input
              id={`${id}-custom`}
              type="number"
              inputMode="numeric"
              min={AMOUNT.min}
              max={AMOUNT.max}
              step={1000}
              placeholder={card.amountCustomPlaceholder}
              aria-label={card.amountCustomLabel}
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
              className="h-11 w-40 rounded-sm border border-line bg-surface px-3 text-base font-normal text-ink figures aria-[invalid=true]:border-error"
            />
            <span className="font-normal text-ink-2">Kč</span>
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
