import { checklist as c } from '../content/cs'
import type { ComparisonModel } from '../domain/comparison'

/**
 * Pre-purchase checklist (wireframe S6), fully readable on the page – no fact lives only behind
 * the form. The "all funds distribute" item is shown only when the data confirms it.
 * The second email form (M3) will follow this list.
 */
export function Checklist({ model }: { model: ComparisonModel }) {
  const items = model.allDistributing ? [...c.items, c.distributing(model.fundCount)] : c.items
  return (
    <div>
      <ol className="grid border-t border-line sm:grid-cols-2 sm:gap-x-10">
        {items.map((item, i) => (
          <li key={item.title} className="grid grid-cols-[2.25rem_1fr] border-b border-line py-4">
            <span aria-hidden="true" className="pt-0.5 font-mono text-label text-ink-3">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div>
              <h3 className="text-[15px] font-semibold leading-snug">{item.title}</h3>
              <p className="mt-1 text-[14px] leading-relaxed text-ink-2">{item.body}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-5 border-l-2 border-ink pl-3 text-[13.5px] leading-snug text-ink">{c.adviser}</p>
    </div>
  )
}
