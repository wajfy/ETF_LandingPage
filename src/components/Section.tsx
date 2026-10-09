import type { ReactNode } from 'react'

interface Props {
  id: string
  number: string
  label: string
  title: string
  /** Optional text under the heading (left column on desktop). */
  aside?: ReactNode
  /** 'wide': heading above and content across all 12 columns on desktop (used for the data table). */
  layout?: 'margin' | 'wide'
  children: ReactNode
}

/**
 * The page's one editorial frame: ink rule, mono running head, serif italic heading.
 * Mobile: stacked. Desktop: heading in a sticky 4-column margin, content in the remaining 8.
 */
export function Section({ id, number, label, title, aside, layout = 'margin', children }: Props) {
  const wide = layout === 'wide'
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-6 border-t border-ink pb-14 pt-6 lg:grid lg:grid-cols-12 lg:gap-10 lg:pb-24 lg:pt-10">
      <header className={wide ? 'lg:col-span-12' : 'lg:sticky lg:top-10 lg:col-span-4 lg:self-start'}>
        <p className="font-mono text-label uppercase text-ink-3">
          {number} · {label}
        </p>
        <h2 id={`${id}-title`} className="mt-2 text-balance font-serif text-[2rem] italic leading-[1.05] tracking-[-0.01em] lg:text-[2.75rem]">
          {title}
        </h2>
        {aside && <div className="mt-4 text-[15px] leading-relaxed text-ink-2">{aside}</div>}
      </header>
      <div className={wide ? 'mt-6 lg:col-span-12 lg:mt-0' : 'mt-6 lg:col-span-8 lg:mt-0'}>{children}</div>
    </section>
  )
}
