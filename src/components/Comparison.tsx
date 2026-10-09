import { comparison as c, fundShortLabels } from '../content/cs'
import type { ComparisonGroup, ComparisonModel, ComparisonRow } from '../domain/comparison'

interface Props {
  model: ComparisonModel
  selected: string
  amountText: string
  rateText: string
  onInspect: (ticker: string) => void
}

/** Same selected-fund treatment on mobile and desktop: light accent tint + 2 px accent rule on the left. */
const SELECTED = 'bg-accent-tint/60 shadow-[inset_2px_0_0_var(--color-accent)]'

function Action({ row, selected, onInspect }: { row: ComparisonRow; selected: boolean; onInspect: (t: string) => void }) {
  if (selected) {
    return <span className="whitespace-nowrap font-mono text-label uppercase text-accent">{c.selected}</span>
  }
  return (
    <button
      type="button"
      onClick={() => onInspect(row.ticker)}
      aria-label={c.inspectAria(row.ticker)}
      className="-my-3 inline-flex min-h-11 items-center whitespace-nowrap text-[13.5px] font-medium text-accent underline decoration-1 underline-offset-2 hover:text-accent-strong"
    >
      {c.inspect}
      <span aria-hidden="true" className="ml-1 inline-block no-underline">
        ↑
      </span>
    </button>
  )
}

function groupText(model: ComparisonModel, g: ComparisonGroup) {
  return g.id === 'same-index'
    ? c.groups['same-index'].text(model.sameIndexGapText, model.sameIndexTickers)
    : c.groups['other-index'].text()
}

/* ------------------------------------------------------------------ rows (< lg) */

/**
 * One fund per row. Reading order: ticker + name (+ action) → four figures → secondary detail.
 * Figures in two columns that mirror the desktop groups: fund fee (TER, fee) | dividends (yield, tax).
 * The wider right column keeps every label on one line down to 320 px; from md the four figures share one line.
 */
function MobileRow({ row, showIndex, selected, onInspect }: { row: ComparisonRow; showIndex: boolean; selected: boolean; onInspect: (t: string) => void }) {
  const cell = (label: string, value: string, strong: boolean) => (
    <div>
      <dt className="text-[13px] leading-tight text-ink-3">{label}</dt>
      <dd className={['mt-0.5 text-base leading-tight', strong ? 'font-semibold text-ink figures' : 'text-ink'].join(' ')}>{value}</dd>
    </div>
  )
  return (
    <li className={['border-b border-line px-4 py-3 sm:px-6', selected ? SELECTED : ''].join(' ')}>
      <div className="grid grid-cols-[1fr_auto] items-baseline gap-x-3">
        <p className="min-w-0">
          <span className="font-mono text-base font-medium">{row.ticker}</span>
          <span className="block text-[13.5px] leading-snug text-ink-2">{row.name}</span>
        </p>
        <Action row={row} selected={selected} onInspect={onInspect} />
      </div>
      {showIndex && (
        <p className="mt-0.5 text-[13px] leading-snug text-ink-3">
          {fundShortLabels[row.ticker] ?? row.indexName} · {row.indexName}
        </p>
      )}
      <dl className="mt-2.5 grid grid-flow-col grid-cols-[2fr_3fr] grid-rows-2 gap-x-4 gap-y-2 md:grid-flow-row md:grid-cols-4 md:grid-rows-1">
        {cell(c.columns.ter, row.terText, false)}
        {cell(c.columns.fee, row.feeText, true)}
        {cell(c.columns.yield, row.yieldText, false)}
        {cell(c.columns.tax, row.taxText, true)}
      </dl>
    </li>
  )
}

/* ------------------------------------------------------------------ table (lg and up) */

const th = 'px-3 text-left align-bottom font-normal'
const thNum = 'px-3 text-right align-bottom font-normal'
const Head = ({ label, note }: { label: string; note: string }) => (
  <>
    <span className="block text-[13px] font-semibold text-ink">{label}</span>
    <span className="block text-[12px] leading-snug text-ink-3">{note}</span>
  </>
)

function Table({ model, selected, amountText, onInspect }: Omit<Props, 'rateText'>) {
  return (
    <table className="hidden w-full border-collapse lg:table">
      <caption className="sr-only">{c.title}</caption>
      <colgroup>
        <col className="w-[22%]" />
        <col />
        <col className="w-[9%]" />
        <col className="w-[13%]" />
        <col className="w-[15%]" />
        <col className="w-[15%]" />
        <col className="w-[9%]" />
      </colgroup>
      <thead>
        {/* Group row: which columns belong to the fund fee and which to dividends. */}
        <tr>
          <td colSpan={2} />
          <th scope="colgroup" colSpan={2} className="border-b border-ink px-3 pb-1.5 text-left font-mono text-label font-normal uppercase text-ink-3">
            {c.columns.feeGroup}
          </th>
          <th scope="colgroup" colSpan={2} className="border-b border-l border-ink border-l-line px-3 pb-1.5 text-left font-mono text-label font-normal uppercase text-ink-3">
            {c.columns.dividendGroup}
          </th>
          <td />
        </tr>
        <tr className="border-b border-ink">
          <th scope="col" className={`${th} pb-2 pl-3 pt-2`}><span className="block text-[13px] font-semibold text-ink">{c.columns.fund}</span></th>
          <th scope="col" className={`${th} pb-2 pt-2`}><span className="block text-[13px] font-semibold text-ink">{c.columns.index}</span></th>
          <th scope="col" className={`${thNum} pb-2 pt-2`}><Head label={c.columns.ter} note={c.columns.terNote} /></th>
          <th scope="col" className={`${thNum} pb-2 pt-2`}><Head label={c.columns.fee} note={c.columns.feeNote(amountText)} /></th>
          <th scope="col" className={`${thNum} border-l border-line pb-2 pt-2`}><Head label={c.columns.yieldTable} note={c.columns.yieldNote} /></th>
          <th scope="col" className={`${thNum} pb-2 pt-2`}><Head label={c.columns.taxTable} note={c.columns.taxNote} /></th>
          <th scope="col" className="pb-2"><span className="sr-only">{c.inspect}</span></th>
        </tr>
      </thead>
      {model.groups.map((g) => (
        <tbody key={g.id}>
          <tr>
            <th scope="rowgroup" colSpan={7} className="px-3 pb-2 pt-6 text-left font-normal">
              <span className="block text-base font-semibold tracking-[-0.01em] text-ink">{c.groups[g.id].title}</span>
              <span className="block max-w-[70ch] text-[13.5px] leading-snug text-ink-2">{groupText(model, g)}</span>
            </th>
          </tr>
          {g.rows.map((r) => {
            const isSel = r.ticker === selected
            return (
              <tr key={r.ticker} className={['border-t border-line', isSel ? SELECTED : ''].join(' ')}>
                <th scope="row" className="px-3 py-3 text-left align-top font-normal">
                  <span className="block font-mono text-[15px] font-medium text-ink">{r.ticker}</span>
                  <span className="block text-[12.5px] leading-snug text-ink-3">{r.name}</span>
                </th>
                <td className="px-3 py-3 align-top text-[13.5px] leading-snug text-ink-2">
                  {r.indexName}
                  <span className="block text-[12.5px] text-ink-3">{fundShortLabels[r.ticker]}</span>
                </td>
                <td className="px-3 py-3 text-right align-top text-[15px] text-ink">{r.terText}</td>
                <td className="whitespace-nowrap px-3 py-3 text-right align-top text-[15px] font-semibold text-ink figures">{r.feeText}</td>
                <td className="border-l border-line px-3 py-3 text-right align-top text-[15px] text-ink">{r.yieldText}</td>
                <td className="whitespace-nowrap px-3 py-3 text-right align-top text-[15px] font-semibold text-ink figures">{r.taxText}</td>
                <td className="px-3 py-3 text-right align-top">
                  <Action row={r} selected={isSel} onInspect={onInspect} />
                </td>
              </tr>
            )
          })}
        </tbody>
      ))}
    </table>
  )
}

/**
 * All seven funds, from the same model as the card. Alphabetical, grouped by index, never ranked.
 * Below lg: deliberate per-fund rows (no squeezed table). lg and up: a real table with grouped headers.
 */
export function Comparison({ model, selected, amountText, rateText, onInspect }: Props) {
  return (
    <div>
      <p className="max-w-[60ch] text-[15px] leading-relaxed text-ink-2">{c.intro(amountText)}</p>

      <div className="lg:hidden">
        {model.groups.map((g) => (
          <div key={g.id} className="mt-7">
            <h3 className="text-lg font-semibold tracking-[-0.01em]">{c.groups[g.id].title}</h3>
            <p className="mt-1 text-[14px] leading-snug text-ink-2">{groupText(model, g)}</p>
            {/* Rows run edge to edge on mobile, so the selected tint and dividers span the full width. */}
            <ul className="-mx-4 mt-3 border-t border-line sm:-mx-6">
              {g.rows.map((r) => (
                <MobileRow key={r.ticker} row={r} showIndex={g.id === 'other-index'} selected={r.ticker === selected} onInspect={onInspect} />
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <Table model={model} selected={selected} amountText={amountText} onInspect={onInspect} />
      </div>

      <p className="mt-5 border-l-2 border-ink pl-3 text-[13.5px] leading-snug text-ink">{c.footnote(rateText, model.conversionText)}</p>
    </div>
  )
}
