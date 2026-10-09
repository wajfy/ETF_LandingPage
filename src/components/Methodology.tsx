import { methodology as m, sections } from '../content/cs'
import { etfData } from '../domain/etfData'
import { methodologyRows } from '../domain/methodology'
import { Section } from './Section'

/** Methodology, sources and disclaimer – every assumption on the card is explained here. */
export function Methodology() {
  const fx = etfData.exchangeRate

  return (
    <Section id="metodika" number={sections.methodology.number} label={sections.methodology.label} title={m.title}>
      <div>
        <p className="text-[15px] leading-relaxed text-ink">{m.items.independent}</p>
        <dl className="mt-6 divide-y divide-line border-y border-line">
          {methodologyRows().map((row) => (
            <div key={row.label} className="grid gap-1 py-4 sm:grid-cols-[11rem_1fr] sm:gap-6">
              <dt className="font-mono text-label uppercase text-ink-3 sm:pt-1">{row.label}</dt>
              <dd className="text-[14.5px] leading-relaxed text-ink-2">{row.text}</dd>
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
    </Section>
  )
}
