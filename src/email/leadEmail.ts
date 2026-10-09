/**
 * The requested email (wireframe ST5), rendered from the SAME modules as the page:
 * result (your check), comparison (7-fund table), checklist and methodology copy.
 *
 * Deterministic: the same input always produces the same subject/html/text. This matters because
 * a retried request reuses the provider idempotency key, which only deduplicates identical payloads.
 * The recipient address is never written into the body.
 */
import { card, checklist, comparison as cmp, email as e, fundShortLabels, methodology as m } from '../content/cs.js'
import { buildComparison } from '../domain/comparison.js'
import { etfData, getFund } from '../domain/etfData.js'
import { formatDateCz } from '../domain/format.js'
import { methodologyRows, sourceLinks } from '../domain/methodology.js'
import { buildResult } from '../domain/result.js'

export interface LeadEmailInput {
  ticker: string
  amountCzk: number
  conversionRatePct: number
  /** Operator identity line for the footer. Placeholder until the operator is decided (launch blocker). */
  operatorLine?: string
}

export interface RenderedEmail {
  subject: string
  html: string
  text: string
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
/** Plain text: drop the invisible word joiner used to keep "W-8BEN" together on the page. */
const plain = (s: string) => s.replace(/⁠/g, '')

// Email-safe inline styles, using the page's design tokens.
const C = { ink: '#111218', ink2: '#3f4150', ink3: '#656877', line: '#dcdad2', accent: '#2a3bd6', paper: '#f5f4f0', tint: '#ecebe5' }
const FONT = "'Helvetica Neue',Helvetica,Arial,sans-serif"
const SERIF = "Georgia,'Times New Roman',serif"

export function renderLeadEmail(input: LeadEmailInput): RenderedEmail {
  const fund = getFund(input.ticker)
  const result = buildResult(fund, input.amountCzk, input.conversionRatePct)
  const model = buildComparison(etfData.funds, input.amountCzk, input.conversionRatePct)
  const selection = `${result.ticker} · ${result.amountText} · směna ${result.conversion.rateText}`
  const dataDate = formatDateCz(etfData.accessed)
  const checklistItems = model.allDistributing ? [...checklist.items, checklist.distributing(model.fundCount)] : checklist.items
  const operator = input.operatorLine ?? e.footer.operatorPlaceholder

  const lines = [
    { name: card.fee.name, sub: result.fee.sub, value: result.fee.value, unit: card.fee.unit },
    { name: card.conversion.name, sub: result.conversion.sub, value: result.conversion.value, unit: card.conversion.unit },
    { name: card.tax.name, sub: card.tax.sub, value: result.tax.value, unit: card.tax.unit },
  ]

  /* ------------------------------------------------------------------ text */
  const text = plain(
    [
      e.heading,
      '',
      e.intro,
      '',
      `${e.yourCheck.title.toUpperCase()}: ${selection}`,
      `${result.ticker} – ${result.name}. ${result.description}`,
      ...lines.map((l) => `- ${l.name} (${l.sub}): ${l.value} ${l.unit}`),
      result.tax.summary,
      card.noTotal,
      e.yourCheck.assumptions(dataDate),
      card.kid.body,
      '',
      `${e.comparisonTitle.toUpperCase()} (${result.amountText})`,
      ...model.groups.flatMap((g) => [
        g.id === 'same-index'
          ? cmp.groups['same-index'].text(model.sameIndexGapText, model.sameIndexTickers)
          : cmp.groups['other-index'].text(),
        ...g.rows.map(
          (r) =>
            `- ${r.ticker} (${r.indexName}): ${cmp.columns.ter} ${r.terText}; ${cmp.columns.fee} ${r.feeText}; ${cmp.columns.yield} ${r.yieldText}; ${cmp.columns.tax} ${r.taxText}`,
        ),
      ]),
      cmp.footnote(result.conversion.rateText, model.conversionText),
      e.comparisonNote,
      '',
      e.checklistTitle.toUpperCase(),
      ...checklistItems.map((it, i) => `${i + 1}. ${it.title} – ${it.body}`),
      checklist.adviser,
      '',
      e.methodologyTitle.toUpperCase(),
      m.items.independent,
      ...methodologyRows().map((r) => `- ${r.label}: ${r.text}`),
      `${m.sourcesTitle}:`,
      ...sourceLinks().map((s) => `- ${s.label}: ${s.href}`),
      '',
      '—',
      e.footer.requested,
      operator,
      e.footer.notAdvice,
    ].join('\n'),
  )

  /* ------------------------------------------------------------------ html */
  const h2 = (t: string) =>
    `<h2 style="margin:32px 0 10px;font-family:${SERIF};font-style:italic;font-weight:normal;font-size:24px;line-height:1.15;color:${C.ink}">${esc(t)}</h2>`
  const p = (t: string, color = C.ink2, size = 14) =>
    `<p style="margin:8px 0;font-family:${FONT};font-size:${size}px;line-height:1.5;color:${color}">${esc(t)}</p>`

  const checkLines = lines
    .map(
      (l) => `<tr>
  <td style="padding:12px 0;border-top:1px solid ${C.line};font-family:${FONT}">
    <div style="font-size:15px;font-weight:600;color:${C.ink}">${esc(l.name)}</div>
    <div style="font-size:12px;color:${C.ink3}">${esc(l.sub)}</div>
  </td>
  <td style="padding:12px 0;border-top:1px solid ${C.line};font-family:${FONT};text-align:right;white-space:nowrap">
    <div style="font-size:20px;font-weight:700;color:${C.ink}">${esc(l.value)}</div>
    <div style="font-size:11px;color:${C.ink3};text-transform:uppercase;letter-spacing:.06em">${esc(l.unit)}</div>
  </td>
</tr>`,
    )
    .join('\n')

  // Comparison as stacked per-fund rows (like the page's mobile layout): no fixed-width table,
  // so it never forces horizontal scrolling in mobile email clients.
  const figure = (label: string, value: string, strong: boolean) =>
    `<span style="display:inline-block;margin:0 14px 4px 0;white-space:nowrap"><span style="color:${C.ink3}">${esc(label)}</span> <span style="color:${C.ink};${strong ? 'font-weight:600;' : ''}">${esc(value)}</span></span>`
  const tableRows = model.groups
    .map((g) => {
      const groupText =
        g.id === 'same-index'
          ? cmp.groups['same-index'].text(model.sameIndexGapText, model.sameIndexTickers)
          : cmp.groups['other-index'].text()
      return `<tr><td style="padding:14px 0 4px;font-family:${FONT};font-size:13px;line-height:1.45;color:${C.ink2}"><strong style="color:${C.ink};font-size:14px">${esc(cmp.groups[g.id].title)}</strong><br>${esc(groupText)}</td></tr>
${g.rows
  .map(
    (r) =>
      `<tr><td style="padding:10px 0;border-top:1px solid ${C.line};font-family:${FONT};font-size:13px;line-height:1.45">
  <div><strong style="font-size:15px;color:${C.ink}">${esc(r.ticker)}</strong> <span style="color:${C.ink2}">${esc(r.name)}</span></div>
  ${g.id === 'other-index' ? `<div style="color:${C.ink3};font-size:12px">${esc(fundShortLabels[r.ticker] ?? '')} · ${esc(r.indexName)}</div>` : ''}
  <div style="margin-top:4px">${figure(cmp.columns.ter, r.terText, false)}${figure(cmp.columns.fee, r.feeText, true)}${figure(cmp.columns.yield, r.yieldText, false)}${figure(cmp.columns.tax, r.taxText, true)}</div>
</td></tr>`,
  )
  .join('\n')}`
    })
    .join('\n')

  const html = `<!doctype html>
<html lang="cs">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(e.subject)}</title></head>
<body style="margin:0;padding:0;background:${C.paper}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(plain(e.preheader(selection)))}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.paper}">
<tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border:1px solid ${C.line}">
<tr><td style="padding:28px 24px">
  <p style="margin:0;font-family:${FONT};font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:${C.ink3}">Prověrka ETF · ${esc(dataDate)}</p>
  <h1 style="margin:8px 0 4px;font-family:${FONT};font-size:26px;line-height:1.15;color:${C.ink}">${esc(e.heading)}</h1>
  ${p(e.intro)}

  ${h2(e.yourCheck.title)}
  <p style="margin:0 0 4px;font-family:${FONT};font-size:15px;color:${C.ink}"><strong>${esc(result.ticker)}</strong> · ${esc(result.name)}</p>
  ${p(result.description, C.ink2, 13)}
  <p style="margin:4px 0 0;font-family:${FONT};font-size:13px;color:${C.ink3}">${esc(selection)}</p>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px">${checkLines}</table>
  ${p(plain(result.tax.summary), C.ink2, 13)}
  <p style="margin:12px 0;padding-left:10px;border-left:2px solid ${C.ink};font-family:${FONT};font-size:13px;line-height:1.5;color:${C.ink}">${esc(card.noTotal)}</p>
  ${p(e.yourCheck.assumptions(dataDate), C.ink3, 12)}
  <div style="margin-top:12px;padding:12px 14px;background:${C.tint};font-family:${FONT}">
    <div style="font-size:14px;font-weight:600;color:${C.ink}">${esc(card.kid.title)}</div>
    <div style="margin-top:4px;font-size:13px;line-height:1.5;color:${C.ink2}">${esc(card.kid.body)}</div>
  </div>

  ${h2(e.comparisonTitle)}
  ${p(cmp.intro(result.amountText), C.ink2, 13)}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
    ${tableRows}
  </table>
  ${p(cmp.footnote(result.conversion.rateText, model.conversionText), C.ink, 13)}
  ${p(e.comparisonNote, C.ink3, 12)}

  ${h2(e.checklistTitle)}
  <ol style="margin:0;padding-left:20px;font-family:${FONT};font-size:14px;line-height:1.5;color:${C.ink2}">
    ${checklistItems.map((it) => `<li style="margin:0 0 8px"><strong style="color:${C.ink}">${esc(plain(it.title))}</strong><br>${esc(plain(it.body))}</li>`).join('\n    ')}
  </ol>
  ${p(checklist.adviser, C.ink, 13)}

  ${h2(e.methodologyTitle)}
  ${p(m.items.independent, C.ink2, 13)}
  ${methodologyRows().map((r) => `<p style="margin:8px 0;font-family:${FONT};font-size:12px;line-height:1.5;color:${C.ink2}"><strong style="color:${C.ink}">${esc(r.label)}:</strong> ${esc(plain(r.text))}</p>`).join('\n  ')}
  <p style="margin:14px 0 4px;font-family:${FONT};font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:${C.ink3}">${esc(m.sourcesTitle)}</p>
  <p style="margin:0;font-family:${FONT};font-size:12px;line-height:1.7">${sourceLinks()
    .map((s) => `<a href="${esc(s.href)}" style="color:${C.accent}">${esc(plain(s.label))}</a>`)
    .join(' · ')}</p>

  <hr style="margin:28px 0 12px;border:0;border-top:1px solid ${C.line}">
  ${p(e.footer.requested, C.ink3, 12)}
  ${p(operator, C.ink3, 12)}
  ${p(e.footer.notAdvice, C.ink3, 12)}
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`

  return { subject: e.subject, html, text }
}
