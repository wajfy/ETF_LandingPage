import { methodology as m } from '../content/cs'
import { etfData } from '../domain/etfData'
import { formatDateCz } from '../domain/format'
import { parseWindow } from '../domain/result'

/** Methodology, sources and disclaimer – every assumption on the card is explained here. */
export function Methodology() {
  const firstComputed = etfData.funds.find((f) => f.yieldSource.kind === 'distributions')
  const window = parseWindow(firstComputed?.yieldSource.window)
  const navDate = firstComputed?.yieldSource.navDate
  const fx = etfData.exchangeRate
  const usdCzk = new Intl.NumberFormat('cs-CZ', { minimumFractionDigits: 3 }).format(fx.usdCzk)

  const rows: Array<[string, string]> = [
    [m.labels.fee, m.items.fee],
    [m.labels.conversion, m.items.conversion],
    [
      m.labels.tax,
      m.items.tax(
        window ? formatDateCz(window[0]) : '—',
        window ? formatDateCz(window[1]) : '—',
        navDate ? formatDateCz(navDate) : '—',
      ),
    ],
    [m.labels.notIncluded, m.items.notIncluded],
    [m.labels.rounding, m.items.rounding],
    [m.labels.fx, m.items.fx(usdCzk, formatDateCz(fx.date))],
  ]

  return (
    <section id="metodika" aria-labelledby="metodika-title" className="scroll-mt-6 border-t border-ink pt-8 lg:grid lg:grid-cols-12 lg:gap-10 lg:pt-12">
      <h2 id="metodika-title" className="font-serif text-[2rem] italic leading-[1.05] tracking-[-0.01em] lg:col-span-4 lg:text-[2.75rem]">
        {m.title}
      </h2>

      <div className="mt-6 lg:col-span-8 lg:mt-0">
        <p className="text-[15px] leading-relaxed text-ink">{m.items.independent}</p>
        <dl className="mt-6 divide-y divide-line border-y border-line">
          {rows.map(([label, text]) => (
            <div key={label} className="grid gap-1 py-4 sm:grid-cols-[11rem_1fr] sm:gap-6">
              <dt className="font-mono text-label uppercase text-ink-3 sm:pt-1">{label}</dt>
              <dd className="text-[14.5px] leading-relaxed text-ink-2">{text}</dd>
            </div>
          ))}
        </dl>

        <h3 className="mt-8 font-mono text-label uppercase text-ink-3">{m.sourcesTitle}</h3>
        <ul className="mt-3 grid gap-x-6 gap-y-2 text-[14px] sm:grid-cols-2">
          {etfData.funds.map((f) => (
            <li key={f.ticker}>
              <a href={f.sourceUrl} className="text-ink underline decoration-line underline-offset-4 hover:decoration-accent" rel="noopener noreferrer" target="_blank">
                <span className="font-mono text-[12.5px] font-medium">{f.ticker}</span> · {f.issuer}
              </a>
            </li>
          ))}
          {m.otherSources.map((s) => (
            <li key={s.href}>
              <a href={s.href} className="text-ink underline decoration-line underline-offset-4 hover:decoration-accent" rel="noopener noreferrer" target="_blank">
                {s.label}
              </a>
            </li>
          ))}
          <li>
            <a href={fx.sourceUrl} className="text-ink underline decoration-line underline-offset-4 hover:decoration-accent" rel="noopener noreferrer" target="_blank">
              {m.fxSourceLabel}
            </a>
          </li>
        </ul>

        <p className="mt-8 rounded-sm bg-tint px-4 py-3.5 text-[14px] leading-relaxed text-ink">
          <strong className="font-semibold">{m.importantLabel}:</strong> {m.important}
        </p>
      </div>
    </section>
  )
}
