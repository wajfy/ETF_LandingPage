import type { ReactNode } from 'react'
import { explainers as e } from '../content/cs'
import type { ComparisonModel } from '../domain/comparison'

function Chapter({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  return (
    <li className="grid gap-x-6 border-t border-line pb-7 pt-5 sm:grid-cols-[3rem_1fr]">
      <span aria-hidden="true" className="font-mono text-label text-ink-3 sm:pt-1.5">
        {n}
      </span>
      <div>
        <h3 className="mt-1 text-xl font-semibold leading-snug tracking-[-0.015em] sm:mt-0">{title}</h3>
        <div className="mt-2 space-y-3 text-[15px] leading-relaxed text-ink-2">{children}</div>
      </div>
    </li>
  )
}

const Source = ({ children }: { children: ReactNode }) => <p className="text-xs leading-relaxed text-ink-3">{children}</p>

/** The three cost types plus the two practical restrictions, as numbered chapters (wireframe S5). */
export function Explainers({ model }: { model: ComparisonModel }) {
  return (
    <div>
      <div className="max-w-[62ch]">
        <h3 className="text-lg font-semibold tracking-[-0.01em]">{e.leadTitle}</h3>
        <p className="mt-2 text-base leading-relaxed text-ink">{e.lead}</p>
      </div>

      <ol className="mt-8 border-b border-line">
        <Chapter n="01" title={e.fee.title}>
          <p>{e.fee.body(model.terRangeText[0], model.terRangeText[1], model.sameIndexGapText, model.sameIndexTickers)}</p>
          <Source>{e.fee.source}</Source>
        </Chapter>
        <Chapter n="02" title={e.conversion.title}>
          <p>{e.conversion.body}</p>
          <p>
            {e.conversion.model}{' '}
            <a href="#metodika" className="font-medium text-accent underline underline-offset-2">
              {e.conversion.modelLink}
            </a>
          </p>
        </Chapter>
        <Chapter n="03" title={e.dividendTax.title}>
          <h4 className="pt-1 text-[15px] font-semibold text-ink">{e.dividendTax.w8benTitle}</h4>
          <p>{e.dividendTax.w8ben}</p>
          <Source>{e.dividendTax.w8benSource}</Source>
          <h4 className="pt-2 text-[15px] font-semibold text-ink">{e.dividendTax.czTitle}</h4>
          <p>{e.dividendTax.cz}</p>
          <Source>{e.dividendTax.czSource}</Source>
        </Chapter>
        <Chapter n="04" title={e.kid.title}>
          <p>{e.kid.body}</p>
          <Source>{e.kid.source}</Source>
        </Chapter>
        <Chapter n="05" title={e.czSale.title}>
          <p>{e.czSale.body}</p>
          <Source>{e.czSale.source}</Source>
        </Chapter>
      </ol>
    </div>
  )
}
