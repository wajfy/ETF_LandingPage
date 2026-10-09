# ETF reality check — product brief

**Status:** Wireframe phase **closed** 2026-10-09. **M1–M3 built locally** (section 10): hero and interactive result card; comparison of all 7 funds; explanatory chapters; checklist; methodology; both email forms with server-side delivery through Resend (mock by default, section 13); funnel analytics events through a provider-independent layer (**disabled**, nothing sent, section 6). Shared calculation and formatting; tests. **M5 hardening in progress** (section 10). Nothing is deployed and no real email has been sent.

> ⚠ **Fund data is a snapshot from 7–8 Oct 2026 and must be reviewed and refreshed before launch.** TERs, 12-month distributions, NAVs, the ČNB rate and the XTB fee-table date all age. The page shows whatever `research/etf-data.json` contains, and nothing warns when it is stale. Follow the refresh procedure in section 14 right before any public traffic. Visual system: section 11. How to run: section 12. Wireframe with the final Czech copy: [wireframe/wireframe.html](wireframe/wireframe.html).
**Scope:** a landing page for Czech retail investors arriving from mobile ads. It explains the differences, the costs and the practical restrictions of seven US-listed ETFs, and collects an email in exchange for the full comparison and a checklist.

The brief uses only claims supported by [research/](research/README.md). References like *(A1)* or *(F2)* point to sections of [research/claims-verification.md](research/claims-verification.md). Fund data comes from [research/etf-data.json](research/etf-data.json).

## 0. Status at the end of the wireframe phase

### Confirmed decisions
Details in section 9.
- **Lead magnet:** the ETF reality check, covering 7 US-listed funds (IVV, SCHD, SPY, SPYM, VOO, VT, VTI).
- **Default fund:** IVV, by the stated alphabetical rule.
- **Card:** 1-year view. Three independent lines (fund fee per year / conversion one-off / dividend tax per year, approximate). No total, no ranking.
- **Calculations:** from the full amount and the **unrounded** historical yield. One rounding rule for display only: 3 significant digits, at least whole CZK, half-up.
- **Conversion:** adjustable model rate, 0–1 %, default 0.5 %. XTB is named only in the methodology.
- **Email:** only delivers the requested material, immediately. No marketing, no double opt-in. After a success, the other form is hidden.
- **Partnerships:** none with brokers or issuers; no affiliate or buy links.
- **Analytics:** provider-agnostic event layer (built in M4, section 6) that sends nothing until a tool and consent approach are chosen.
- **Single source of truth:** `research/etf-data.json`, read through one shared calculation module (section 10).

### Assumptions that still need verification (never present as fact)
- **Tax:**
  - that the 15 % treaty rate applies to each fund as a RIC (not checked per fund; SPY is a UIT) (C1);
  - personal Czech outcomes such as the size of the credit or the duty to file (D3);
  - whether US ETF payouts count as § 8(1)(a) "podíly na zisku" (profit shares) (D3);
  - which Czech ID goes on W-8BEN line 6a (C1).
- **Regulatory:**
  - whether a neutral comparison is *„nabízení investic“* (offering investments) under ZISIF § 294 (G3);
  - the AIFMD "marketing" definition and GDPR Art. 13, both still to re-check in the primary EUR-Lex text (G2, H);
  - whether any of the funds is on a ČNB list (G2);
  - whether the delivery email counts as a "commercial communication" (H);
  - whether a given cookieless analytics setup falls outside § 89(3) (H).
- **Data:**
  - XTB's own FX spread on top of the 0.5 % markup (B2);
  - the Trading 212 fee (B2);
  - all figures are as of 7–8 Oct 2026 and must be re-pulled;
  - ISINs are derived and holding counts incomplete (not shown).
- **Product:**
  - the audience profile and how familiar visitors are with the tickers (section 1);
  - the first screen on real devices and in-app browsers (section 10, acceptance criteria).

### Blockers before public launch
Section 8 separates three stages: a **demo deployment** (mock, no email sent), **real email delivery**, and **public advertising**; each adds requirements to the one before. The full blocker table is in section 8. In short:
- ⛔ legal review
- ⛔ shared store for rate limits (the in-memory limits don't hold on serverless; section 13)
- operator identity
- privacy notice
- real email sending (provider, domain with SPF/DKIM, storage and retention)
- analytics tool and consent approach
- data re-pull
- copy guardrails and disclaimers checked against the build
- real-device QA

### Working assumptions for the prototype (set 2026-10-09, still in force)

1. **No partnerships:** no broker or fund-issuer partnerships, and no payments from them.
2. **No affiliate links.** No links to brokers or buy pages at all.
3. **No marketing emails.** The email address is used **only** to send the material the visitor explicitly requests, once.
4. **The legal question stays open.** We don't treat any interpretation in the research as legal advice. **A legal review is a public-launch blocker** (section 8).
5. **Prototype ≠ public launch.** The prototype can be built and tested, but it receives **no ad traffic** until every section 8 blocker is resolved.

**Still not decided** (not assumed anywhere in this brief): brand and operator, ad variants, A/B test hypotheses, expected conversion rate. The remaining external decisions are in section 9c.

### How claims are labelled

| Label | Meaning | Example | How the page shows it |
|---|---|---|---|
| **Fact** | Verified from a primary source, valid now | TER 0.03%; W-8BEN goes to the broker | Plain statement + source + "as of" date |
| **Historical** | Verified past data at a date | Distributions in the past 365 days; ČNB rate of 8 Oct 2026 | Always with its date and the word *historicky* / *za posledních 12 měsíců* (historically / over the last 12 months) |
| **Estimate / illustration** | Our calculation from facts and historical data, under stated assumptions | "≈ 155 Kč a year withheld from dividends" | Always with *orientačně* (approximately) / *příklad* (example) and the assumptions one tap away |
| **General tax rule** | What the law or treaty says in general | "Foreign dividends are also taxed in CZ; US tax can be credited" | General wording + *ověřte se svým daňovým poradcem* (check with your tax adviser). **Never a conclusion for the individual user** |

---

## 1. Target audience and the problem

**Audience (assumption, to validate with the funnel data in section 6)**
- Czech tax residents on mobile who have decided to start investing in ETFs but haven't bought yet, or have just started.
- They know US tickers such as VOO, SPY or VT from finance content.
- Age, income and channel are assumptions, not data.

**The problem (supported by research)**
They compare ETFs by the fee in the table. Across our seven funds that fee is 0.02–0.0945% a year (B3). For an S&P 500 fund the choice of issuer changes very little. The things that do matter for a Czech investor aren't in that table:
1. **Availability:** most EU brokers don't let retail clients buy US-registered ETFs, because their issuers usually don't publish the KID that PRIIPs requires (A1).
2. **Currency conversion:** buying a USD fund from an account in another currency involves a conversion. It's a one-off cost each time money is converted, and the rate depends on the broker (e.g. XTB adds a 0.5% markup) (B2).
3. **US dividend withholding:** 15% with a W-8BEN, up to 30% without (C1). It's a tax, not a fee. As a general rule it can be credited against Czech tax on the same dividends (D3).
4. **Czech tax rules on selling:** a 3-year time test and a 100,000 CZK yearly limit on sale proceeds (D1).

These are **different kinds of items**: a yearly fee, a one-off transaction cost and a tax. The page shows them **side by side, never ranked against each other**. How much each matters depends on the broker, the account currency, how long the investment is held and the investor's tax situation. The page must not suggest that any one of them is generally bigger or more important than another (B0, B4).

**What we solve:** in under a minute on a phone, the visitor sees what a chosen ETF actually is, what each type of cost means in CZK, and what restricts buying it from Czechia.

**What we explicitly don't do:**
- recommend an ETF, broker or allocation
- ask suitability questions
- rank funds as "best"
- show past returns
- forecast anything

## 2. Main promise and primary CTA

**Main promise** (the first screen must say this in one line):
> The fund fee is one line among several. Pick an ETF and see, in CZK, what else can apply: currency conversion, US tax on dividends, and whether you can buy it from Czechia at all.

Draft Czech headline (revised 2026-10-09):
> „Poplatek fondu je jen jedna položka. Vyberte ETF a uvidíte v korunách, co dalšího může hrát roli.“

**Wording rules for the promise and ads**
- **Don't promise "the real/total cost"** (*skutečná/celková cena*). There is no single total: costs depend on the broker, the account currency and the user's tax situation.
- **Use "can apply" (*může*), not "you pay" (*platíte*).** A conversion only happens when currencies differ. The dividend tax is a tax that may be credited, not a payment for the product.
- **Don't put a specific fee such as "0,03 %" in the headline.** It's true only for some funds (SPY is 0.0945%) and invites a comparison across different units.

**CTAs**
- **On-page action (engagement):** choosing an ETF. The selector is part of the first screen, with no button to press first. A result for the default fund (IVV, alphabetical rule) is already visible.
- **Primary conversion CTA:** the email form directly after the result.
  - Final wireframe copy: heading *„Chcete to mít po ruce, až budete u brokera?“* ("Want it at hand when you're at your broker?") and button *„Poslat srovnání“* ("Send the comparison"). The second form's button reads *„Poslat checklist a srovnání“* ("Send the checklist and comparison").
  - The same CTA repeats once lower on the page and as a sticky mobile bar after the result has been seen.

## 3. Free on-page result vs email follow-up

**Principle:** no fact exists only behind the form. The page shows everything for any fund the user taps. The email adds the packaged, keep-for-later version: all seven side by side, the user's own figures and the checklist.

### 3a. Free on-page result ("reality check card")

**Inputs**
- **ETF:** one of 7 chips, in **alphabetical order** (IVV, SCHD, SPY, SPYM, VOO, VT, VTI).
- **Default: IVV, the first fund alphabetically** (decided 2026-10-09, option B).
  - The rule is stated in one small grey line in the card: *„Předvybráno podle abecedy – nic nedoporučujeme.“* ("Preselected alphabetically – we don't recommend anything."; one line, so the first figure stays on the first screen) It hides after the first selection.
  - Not visually dominant, and no claim of popularity.
  - Trade-off accepted: possibly weaker ad continuity than a more familiar ticker, in exchange for a transparent, checkable rule.
- **Amount:** an inline selector in the card heading (10 000 / 50 000 / 100 000 Kč / *jiná částka* (other amount) → numeric input 1 000–10 000 000 Kč). Invalid input shows an error and keeps the last valid figures. Default 100 000 Kč, so the result works without typing.
- **Model conversion rate** (decided 2026-10-09):
  - A slider from 0% to 1% in 0.05 steps; default 0.5%.
  - The card calls it *„modelová sazba“* (model rate) and never names a broker.
  - The methodology section explains the default: XTB's 0.5% markup (fee table 29 April 2026), which comes on top of the broker's own exchange rate.
  - **The 0–1% range is a modelling choice, not market data.** The methodology says so.
- **Time frame:** 1 year only (decided 2026-10-09). No growth, constant exchange rate. All assumptions labelled on the card and in the methodology.
- **Independent lines** (wireframe review 2026-10-09): each line uses only its own inputs.
  - fee = amount × TER
  - conversion = amount × rate
  - tax = amount × past yield × 15%
  - Fee and tax ignore the conversion deduction; this simplification is stated in the methodology (research F3).

**Card contents**

| Block | Content | Type |
|---|---|---|
| What it is | Name, issuer, index, plain-Czech description of the index, NYSE Arca, USD, US-domiciled, inception year, distributes quarterly | Fact |
| 1. Fund fee (*recurring*) | TER % → Kč a year on the amount, with the note *„platí se každý rok, dokud ETF držíte“* (paid every year for as long as you hold the ETF) | Fact (TER) → estimate (Kč) |
| 2. Currency conversion (*one-off per conversion*) | Model rate (adjustable) → Kč at purchase. Notes: paid when converting CZK to USD, at purchase or earlier when funding a USD account; paid again when converting back after a sale; the real rate depends on the broker. The XTB source and the "on top of the broker's rate" caveat sit in the methodology, not on the card | Model assumption → estimate (Kč) |
| 3. US tax on dividends (*tax, per payout*) | Unrounded past 365-day yield × 15% → Kč a year, marked approximate. The 30% "without W-8BEN" figure is in the note. Note wording: see "Dividend-tax wording" below (D3) | Historical → estimate (Kč) |
| Same index, different fee | In the overview (S4): IVV, SPY, SPYM and VOO, alphabetical; the fee gap (0,0745 procentního bodu) is calculated from the data, not typed in | Fact |
| Can you buy it from CZ? | Narrow KID wording (A1), the same for all seven. **No per-fund claim** that a fund has no KID; that isn't verified per fund | General fact |
| Currency note | *„ETF se obchoduje v USD; částky v Kč se mohou měnit s kurzem.“* (The ETF trades in USD; CZK amounts can change with the exchange rate.) Per ESMA34-45-1272 para 42 as best practice (G4) | General fact |
| Data stamp | Currency note + "1 year, no growth, constant rate" + the fund's TER source and date + the dividend window (12 months to 7 Oct 2026) + a link to the methodology (S7), which lists all sources | — |

**Display rules**
- The three lines keep their own labels and units, exactly as in the wireframe: *„ročně“* (per year) for the fund fee, *„jednorázově“* (one-off) for the conversion, *„ročně, přibližně“* (per year, approximately) for the dividend tax.
- **No combined total**, no "biggest cost" highlight, no ratio between lines (B0).
- **No "conversion = N years of fees" line.** It mixes units and implies conversion matters more (B4, removed 2026-10-09).
- Lines are shown **in the same order and with the same visual weight for every fund**. Neither the layout nor the copy may suggest which line "matters most".
- The withholding line is labelled *daň* (tax), never *poplatek* (fee).
- **Dividend-tax wording** (agreed 2026-10-09; split for scannability on 2026-10-09, M1 refinement). The line is subtitled *„historický příklad“* (historical example).
  - The **visible summary** keeps caveats 1–5 below in short form.
  - A native disclosure *„Jak příklad počítáme“* ("How we calculate the example") holds the secondary detail: the 15 % CZK figure restated in a sentence, how Czech taxation and the credit depend on the visitor's situation, and a link to the methodology.
  - The caveats, in order:
  1. *„Zjednodušený příklad podle minulosti, ne předpověď“* (a simplified example based on the past, not a forecast);
  2. the historical yield, displayed to 2 decimal places (*„přibližně 1,04 % své hodnoty“*, about 1.04% of its value), and the assumption: same payouts again, 15% with W-8BEN, with the approximate CZK figure stated in the same sentence;
  3. the 30% case without W-8BEN;
  4. *„Je to daň, ne poplatek fondu“* (it's a tax, not a fund fee);
  5. *„Nejde o výpočet vaší daně“* (this isn't a calculation of your tax): Czech taxation and the credit depend on the visitor's situation.
- **Precision** (don't look more precise than the inputs):
  - Calculations use the **unrounded** historical yield (research F2 inputs). SPY and SPYM use the issuer-published 2-decimal figure.
  - The yield is **displayed to 2 decimal places** (*„přibližně 1,04 %“*).
  - **One rounding rule for every CZK output** (all three card lines, the 30% figure, the email table, research F3): 3 significant digits, never finer than whole Kč, ties half-up. Examples: 155,93 → ≈ 156; **SPY fee 94,50 → ≈ 95**; 15 593 → ≈ 15 600; 0 shown as "0 Kč".
  - **No fixed agreement is claimed** between the shown tax and a recalculation from the displayed 2-decimal yield. Checked across all 7 funds at 1 000–10 000 000 Kč, the gap is not bounded by 1 Kč or by one rounding step (e.g. IVV at 6 350 000 Kč: 10 200 vs 10 300). The copy promises only „přibližně“ (approximately).
  - The tax line is marked as approximate (*„ročně, přibližně“*).
  - The same rule applies on the card, in the email table (tax per 100 000 Kč) and in the methodology.
  - The model rate shows only the decimals the slider uses (0,5 %, 0,45 %).
  - TERs are shown exactly as the issuer publishes them (a fact, not an estimate).
  - The rounding rule is stated in the methodology.
- The default amount and the 1-year view are examples. A multi-year view is out of scope for the prototype (section 8, Later).

### 3b. Email follow-up (sent immediately after submit)

1. **Full comparison of all 7 ETFs** in one table, with the fields from section 5, the data date and the source links.
2. **The user's own figures:** the selected ETF and amount, the three cost lines, and the assumptions.
3. **Practical checklist before buying an ETF from Czechia.** Facts and general rules only, no recommendations:
   - Check whether your broker offers the fund to retail clients, and why it may not (KID) *(A1)*.
   - Find out your account currency and the broker's conversion fee; it applies on each conversion *(B2)*.
   - W-8BEN: what it is, that it goes to the broker and not the IRS, 15% vs 30%, and when it expires *(C1)*.
   - Dividends: also taxed in CZ; US tax can be credited under the treaty; keep the confirmation of withheld tax; check your situation with a tax adviser *(D3)*.
   - Selling: the 3-year time test counts per purchase; the 100,000 CZK limit counts sale proceeds, not profit *(D1)*.
   - All seven funds pay out dividends (none reinvests them).
4. **The same disclaimers and sources** as the page.

**Not in the email:** which ETF to buy, broker recommendations, return projections, or any statement about the user's personal tax outcome (e.g. "you won't pay any Czech tax", "you don't have to file").

## 4. Form fields and what happens after submission

**Visible fields**
1. **Email** (required, the only required field).
- **No marketing consent checkbox in the prototype**, because no marketing emails are sent (working assumption 3).
  - If marketing is ever added, it needs a separate, unticked, optional checkbox (§ 7(2) Act 480/2004; pre-ticked boxes aren't valid consent per ÚOOÚ; research H).
- **Microcopy under the field** (final wireframe copy): *„E-mail použijeme jen k odeslání tohoto srovnání. Žádný newsletter ani další zprávy.“* ("We'll use your email only to send this comparison. No newsletter or other messages.")
- **Privacy notice link** next to the button. Its legal text and the operator's identity must come from the operator/compliance; not invented here.

**Hidden fields** (no extra typing for the user)
- selected ETF
- amount bucket
- UTM parameters
- landing variant ID
- timestamp

Never put the email address in a URL or send it to analytics.

**After submission**
1. **Instant confirmation state on the page:**
   - Confirms the email was sent (the user can see where).
   - Shows the checklist right away, so the user gets value without opening their mailbox.
   - Offers the option to look at other ETFs.
2. **Email delivered right away** with the content from section 3b.
3. **Validation and errors:**
   - Inline email format check.
   - A clear, retryable error message if sending fails.
   - Duplicate submissions handled quietly (send again, no error).
   - **After a successful submit in either form, the other form is hidden** and replaced by one line: *„✓ Srovnání a checklist už jste si nechali poslat na …“* ("✓ You've already had the comparison and checklist sent to …"). The on-page checklist stays visible. If the first form hasn't been used, the second form remains as another chance to request the material.
   - *„pošlete znovu“* (send again) in the confirmation reopens that form with the address kept.
4. **No further emails** are sent (working assumption 3). No double opt-in in the prototype (9b). The retention period is still open (9c).

## 5. The seven ETFs and the fields shown

**Funds (alphabetical):** IVV, SCHD, SPY, SPYM, VOO, VT, VTI. AGG dropped; QQQ out of scope (Nasdaq). Source of truth: `research/etf-data.json`.

| Field | Shown on card | Shown in email table | Type / note |
|---|---|---|---|
| Ticker, full name, issuer | ✅ | ✅ | Fact |
| Index tracked + plain-Czech description | ✅ | ✅ | Fact (index name from the issuer, e.g. VTI → Morningstar US Total Market Index) |
| Exchange (NYSE Arca), currency (USD), domicile (USA) | ✅ | ✅ | Fact |
| Expense ratio (TER) + as-of date | ✅ | ✅ | Fact; issuers date it differently |
| Distribution policy + frequency | ✅ | ✅ | Fact: all distribute quarterly |
| Dividend yield, past 365 days | ✅ | ✅ | Historical, dated, "not a forecast" |
| US withholding at 15% / 30% as % a year | ✅ (in Kč) | ✅ | Estimate from historical yield |
| "Conversion ≈ N years of fee" | ❌ | ❌ | Removed: mixes one-off and recurring costs (research B4) |
| Inception year | ✅ | ✅ | Fact |
| Source link + data date | ✅ | ✅ | — |
| ISIN | ❌ | Optional | Six of seven are derived; only after checking against fact sheets |
| Number of holdings | ❌ for now | ❌ for now | Only collected for VTI and SCHD; collect for all or leave out |
| Past returns / performance | ❌ | ❌ | Deliberately out: no forecasts, avoids implied recommendations |
| AUM, ranking, "best for…" | ❌ | ❌ | Out of scope |

## 6. Analytics events (full funnel)

**Status (M4, built locally 2026-10-09):** a provider-independent event layer is in place and instrumented. **Analytics is disabled:** no provider is connected, nothing leaves the browser, and production builds register no receiver at all. Code: `src/analytics/`.

**Funnel**

`landing_view` → (`etf_selected`, optional) → `result_viewed` → `lead_form_viewed` → `lead_form_started` → `lead_submitted` → `lead_email_accepted` → (`guide_opened`: **not measured**, see below)

### Event definitions (exactly when each fires)

"Seen" below means: at least 50 % of the element in the viewport (or, for an element taller than two screens, at least half the screen covered by it), continuously for at least 1 s, while the tab is visible.

| Event | Fires when | Does NOT fire / duplicates | Properties |
|---|---|---|---|
| `landing_view` | The page has loaded and rendered | Once per page load (also under React StrictMode) | `referrer_host` (external referrer host only, optional) |
| `etf_selected` | The visitor picks a **different** fund in the chip picker or with „Prověřit …“ in the comparison | Not for the default preselection (IVV), not for re-picking the current fund | `ticker`, `previous_ticker`, `source` (`picker` / `comparison`), `selection_count` (n-th change on this page) |
| `result_viewed` | The result card has been seen | Once per page load, with the state at that moment | `ticker`, `amount_bucket`, `rate_bucket` |
| `conversion_rate_changed` | **Calculator input, not a funnel metric:** the card's *currency-conversion* fee slider („modelová sazba“, 0–1 %) is **released** on a value different from the last reported one (one event per drag; each keyboard step is a release) | Not while dragging; not when released on the same value | `rate_bucket` |
| `lead_form_viewed` | A form (inline or repeat) has been seen, **or** its email field is focused, whichever comes first | Once per position per page load. Never for the confirmation or the „už jste si nechali poslat“ line, which are not forms | `position` (`inline` / `repeat`) |
| `lead_form_started` | First focus on that form's email field | Once per position per page load | `position` |
| `lead_submitted` | The browser **actually sends** a request to `/api/lead`: the address passed client validation and no request is already in flight | Not for an invalid address (→ `lead_form_error`), not for ignored double clicks. Every real attempt counts; `attempt: retry` marks a re-send of the same send intent after an error | `position`, `ticker`, `amount_bucket`, `rate_bucket`, `attempt` (`first` / `retry`) |
| `lead_email_accepted` | The server answered **200 `{status: "sent"}`**. The server returns that **only after the email provider (Resend) accepted the email for sending** (section 13). In mock mode it means the mock outbox accepted it; `delivery` says which. **Not proof that the email reached the inbox** | **Never** on a timeout, network error, 504/„unconfirmed“, 502, 503 or 429. At most once per send intent (a retry that returns the original send is not a second acceptance). „pošlete znovu“ is a new intent and counts again | `position`, `ticker`, `amount_bucket`, `delivery` (`resend` / `mock`), `accepted_on_page` (1 = first accepted send on this page load, both forms together; 2, 3 … for further sends) |
| `lead_form_error` | Client validation failed, or an attempt ended without confirmation | One per failed attempt | `position`, `error_type`: `invalid_email`, `unconfirmed` (timeout / network / 504: the email **may** have been sent; counted as an error, never as a success), `send_failed`, `rate_limited`, `unavailable` |
| `guide_opened` | **Reserved, not emitted.** See "Opening the email" below | The tracker refuses it | — |

**Accepted ≠ delivered.** The event was renamed from `lead_email_delivered` to `lead_email_accepted` in the M4 review. It means Resend accepted the message for sending. Whether it reached the inbox (or bounced, or landed in spam) is only knowable from the provider's delivery webhooks, which are not connected. No event or metric in this project claims inbox delivery.

**Two different "conversion rates" — don't mix them up:**
- `conversion_rate_changed` is about the **currency conversion** (CZK → USD) fee the visitor models on the card. It is a calculator interaction and says nothing about leads.
- The **landing-page conversion rate** is a funnel metric: the share of page loads that ended with an accepted email. How to calculate it is below. The two share a word, nothing else.

**Buckets instead of raw values** (an unusual exact amount could single a visitor out):
- `amount_bucket`: `10000`, `50000`, `100000` (the presets) or `custom_lt_10k`, `custom_10k_100k`, `custom_100k_1m`, `custom_gt_1m`.
- `rate_bucket`: `0`, `0.05-0.25`, `0.3-0.5` (includes the 0.5 % default), `0.55-1`.

### Context attached to every event
So every metric can be split without any visitor identifier:
- `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`: read from the URL. A value is dropped if it could carry personal data (contains `@`, `/`, `=` or similar characters, a run of 6+ digits, or a UUID-like id) and cut to 64 characters. `utm_term` and click ids (`gclid`, `fbclid`, …) are ignored.
- `device`: `mobile` / `tablet` / `desktop` from the viewport width at the layout breakpoints (768 / 1024 px).
- `in_app`: true in the Facebook, Instagram, TikTok, LinkedIn, Snapchat or Pinterest in-app browsers (from the user-agent string, kept as a boolean only).
- **Landing variant ID:** not populated. No variants exist yet and none are invented here; adding one is a single context field.

### Landing-page conversion rate (indicative) and what the funnel can answer

There are no visitor or session ids, so **every rate is per page load, not per person**. We can't count unique visitors or unique leads, and nothing here claims to.

**Indicative landing-page conversion rate**

> page-load conversion rate = number of `lead_email_accepted` with `accepted_on_page = 1` and `delivery = resend` ÷ number of `landing_view`

It reads as "the share of page loads that ended with at least one email accepted by Resend". Numerator and denominator are both counted per page load, so the ratio is internally consistent. Both must use the same filters (date range, UTM, device).

**How repeat visits affect it** (no correction is possible):
- Each page load counts in the denominator: a reload, a second visit from the ad, a later visit, a second tab.
- One person with three page loads and one request counts as 1 ÷ 3. Repeat visits therefore push the rate **below** a per-person rate, by an unknown amount.
- Returning with the browser's back/forward cache normally restores the page without a new `landing_view`.

**How repeated submissions affect it:**
- **Retries of the same attempt** (after "unconfirmed" or an error) produce one acceptance at most. No effect.
- **„pošlete znovu“ or the second form on the same page load** produce `accepted_on_page` 2, 3, … The `= 1` filter excludes them, so a page load counts once.
- **The same person requesting again on a different page load** (e.g. the next day) counts again. We can't detect it.
- **All acceptances, without the filter,** measure emails accepted, not people. That's useful for volume and cost, but it isn't a lead count.

**Other known biases:**
- `landing_view` needs the page's script to run. Ad clicks that bounce before that, or with blocked scripts, are missing, so the ad platform's click-based conversion rate will differ.
- Bots that fill the honeypot can appear as acceptances.
- Under a consent gate, events before the grant are dropped. That includes `landing_view`, which fires at load, usually before any choice. The page-load conversion rate is then undefined until the integration defines a consistent basis (see "Before advertising").

**Per-step rates**, with the same per-page-load caveat:
- form-level: acceptances ÷ `lead_form_viewed`, **per `position`** (one page load can view both forms);
- submit-to-accept: `lead_email_accepted` ÷ `lead_submitted` with `attempt = first`;
- the share of unconfirmed sends: `lead_form_error` with `error_type = unconfirmed` ÷ `lead_submitted`.

**Cannot be answered:**
- unique visitors or unique leads;
- per-visitor paths;
- time to submit.

If per-visitor metrics are needed, an in-memory per-page-load random id (never stored) is the smallest step. It's an identifier, so it belongs to the consent decision.

**Authoritative count of accepted sends:** the server's structured `lead_sent` log lines (section 13; no personal data). The client-side total of `lead_email_accepted` can be lower (the visitor closed the page before the answer, or blocked scripts). It can also include honeypot bots, which the server answers like a success by design; the server log counts them separately as `lead_honeypot`.

### Opening the email (`guide_opened`): not measured — decision needed
The email currently contains no link back to the page, so an open can't be observed without email tracking technology. Options:
1. **Open-tracking pixel** (the provider's open tracking): adds a tracking technology to the email, unreliable (Apple Mail Privacy Protection preloads images; many clients block them), and a consent / privacy-notice question for the legal review.
2. **A plain link back to the page with campaign parameters only** (e.g. `utm_source=lead_email&utm_medium=email`, no per-recipient id): measured as a `landing_view` with that UTM. It measures returns from the email, not opens. It changes the email content, so it is out of scope for M4.
3. **Don't measure.**

Recommendation: option 2 if the metric is needed; no option is implemented.

### Mapping from the earlier plan
| Earlier name | Now |
|---|---|
| `page_view` | `landing_view` |
| `etf_select` | `etf_selected` |
| `rate_change` | `conversion_rate_changed` (same rule: on release, bucketed) |
| `result_view` | `result_viewed` |
| `form_view` / `form_start` | `lead_form_viewed` / `lead_form_started` |
| `form_submit` | `lead_submitted` |
| `lead_success` / `confirmation_view` | `lead_email_accepted` (named `lead_email_delivered` until the M4 review; the confirmation is shown exactly when it fires) |
| `form_error` | `lead_form_error` |
| `email_open` | `guide_opened` (reserved, not measured) |

**Deferred** (planned earlier, not built in M4; each is a one-line `track` call through the same interface): `first_screen_engaged`, `amount_change`, `detail_expand`, `source_click`, `compare_view`, `cta_click` (needs the sticky CTA, which isn't built), `scroll_depth`, `engaged_time`, and provider-side `email_delivered` (actual inbox delivery from webhooks) / `email_click`.

### Privacy and consent

**What the current implementation does on the device**

| Technology | Used? |
|---|---|
| Cookies | No |
| localStorage, sessionStorage, IndexedDB | No |
| Visitor, session or device identifiers; fingerprinting | No (no ids; click ids ignored) |
| Tracking pixels, beacons, network requests for analytics | No (the analytics code has no network transport) |
| Reading page data | Only when a receiver is registered, i.e. **only in local development**: the URL query (UTM), the viewport width, the user-agent string (in-app flag) and the referrer host. Production builds register no receiver, so the analytics code reads nothing |

A test (`src/analytics/privacy.test.ts`) fails if browser code starts using cookies, device storage, beacons, pixels, click ids or a network call outside the lead client.

**Why there is no consent banner now:** this build stores nothing on the device and transmits nothing for analytics. In production, the analytics code does no work at all. A banner would ask visitors to consent to nothing. This describes the current build; **it is not a legal conclusion** about any future setup.

**The consent gate already in code** (`src/analytics/tracker.ts`). Any adapter registered with the tracker receives events **only while consent is „granted“**:
- **No opt-out for adapters.** There is no flag an adapter can set to skip the gate. The only ungated receiver is the dev debug buffer created inside `tracker.ts`, recognised by object identity.
- **Consent always starts as „unknown“.** A tracker can't be created as „granted“; only `setConsent()` changes it, called from a visitor's choice.
- **No replay.** Events from before a grant are dropped, never queued. "Once per page load" events used up before the grant are not sent after it either.
- **No page reading before consent.** Page data (URL, viewport, user agent, referrer) isn't read until an event will actually be sent.
- **Withdrawal is immediate.** `setConsent('denied')` stops sending at once.

If the legal review concludes that a particular setup needs no consent, sending without a grant requires a deliberate code change in `tracker.ts` and its tests. It can't happen by configuration.

**What the code cannot enforce, so the tests guard it** (`src/analytics/privacy.test.ts`). A provider loaded *around* the tracker would bypass the gate. These tests fail if:
- `index.html` loads an external script or image;
- a runtime dependency is added beyond the reviewed set;
- browser code uses cookies, device storage, `sendBeacon`, pixels or `fetch` outside the lead client;
- any code calls `setConsent('granted')` with a literal.

Changing any of these must go together with the consent decision.

**Before connecting any provider (requirements; ⚖ = needs the legal review):**
1. ⚖ **Whether consent is required.** Even without cookies, a script that reads information from the browser and sends it to a provider can count as gaining access to information on the user's device (§ 89(3) Act 127/2005, implementing ePrivacy Art. 5(3)). The EDPB Guidelines 2/2023 on the technical scope of Art. 5(3) read that scope broadly, including URL- and pixel-based tracking (not yet verified from the primary text in `research/`). We don't assume any "cookieless" setup is exempt.
2. **If consent is required, a minimal consent interface:**
   - **Přijmout** and **Odmítnout** equally prominent, on the first layer; no pre-ticked choices; no tracking before a choice;
   - keyboard-accessible, labelled, and not hiding the first cost figure (the sticky CTA rule "hidden while a consent banner is showing" still applies);
   - a permanent footer link (e.g. „Nastavení analytiky“) to change or withdraw consent at any time, wired to `tracker.setConsent`.
3. ⚖ **Remembering the choice** (so the banner doesn't reappear) means storing something on the device. Whether that counts as technically necessary must be confirmed. The alternative is to ask on every visit.
4. **Privacy notice:** the analytics provider as a recipient, the purpose, the legal basis (⚖), the retention period and any transfer outside the EU.
5. **Provider criteria:** EU hosting or a valid transfer basis; no cross-site identifiers; IP addresses not stored; aggregate reporting; a data processing agreement.
6. **A server-side alternative** (counting funnel steps on our own server) avoids browser-side tracking code. It still processes request data such as IPs in the hosting logs (⚖).

### Implemented now vs. required before advertising

**Implemented and verified locally (M4):**
- **Event layer.** The events above, an allow-list of properties, buckets instead of raw values, and UTM/device/in-app context. Unit tests cover semantics, duplicates, retries and the failure paths. A browser check in the dev server (mock delivery) confirmed that a simulated gateway timeout records `unconfirmed` and no acceptance.
- **Consent gate.** Every adapter is gated, a tracker can't start as granted, and there is no replay; tests cover each, plus tripwires for provider code loaded around the tracker.
- **Disabled in production builds.** No receiver is registered, the debug buffer is absent from the bundle (checked), and there are no cookies, storage or identifiers.

**Not done — must be configured and verified before any ad traffic** (⚖ = legal review):

*Configure*
1. Choose the analytics provider (criteria in point 5 above), implement and register the adapter.
2. ⚖ Decide whether that setup needs consent. If it does (and by default the code requires it), build the consent interface (point 2 above).
3. ⚖ Decide whether to remember the consent choice (point 3 above).
4. ⚖ Update the privacy notice for analytics (point 4 above).
5. Define the conversion-rate basis under consent: `landing_view` normally fires before the choice and is dropped. One option is a new observation at the moment of consent ("consented page load"). It must be a new event, not a replay, and needs the same legal check.
6. Set ad URL templates to plain campaign labels. Values with 6+ digit runs (e.g. numeric campaign-id macros), `@`, `/` or `=` are dropped by the sanitizer, so use names or relax the rule deliberately.
7. Add a landing variant ID if A/B tests are run.
8. Decide on `guide_opened` (options above).

*Verify on a deployed preview with the real provider, on phones and in the Facebook/Instagram in-app browsers*

9. Before a choice and after „Odmítnout“: no request to the provider, and no cookie or storage written.
10. After „Přijmout“: each funnel event arrives once with the documented properties. The provider's raw events contain no email, IP, request id or identifier, and the provider is configured not to store IPs or set ids.
11. Withdrawal stops sending immediately.
12. For a test period, reconcile `lead_email_accepted` (`delivery = resend`) against the server's `lead_sent` log, and ad clicks against `landing_view`.

### Connecting a provider later (developer notes)
1. Implement an `AnalyticsSink` (`send(event)`) in `src/analytics/`. It receives already-sanitized events (`{name, props, context}`) and only after consent.
2. Register it in `src/main.tsx`.
3. Build the consent interface and wire it to `tracker.setConsent`. Without it, the adapter receives nothing.
4. If the transport or SDK needs `sendBeacon`, a new dependency or a script tag, change `privacy.test.ts` deliberately in the same change.

The UI code does not change: components call `tracker.track(...)` / `trackOnce(...)` only.

**Local development:** `npm run dev` registers a local debug receiver that keeps the last 200 events in page memory. Inspect them in the browser console with `window.__analyticsEvents`. Nothing is sent anywhere.

## 7. Main risks

### Compliance
1. **Investment recommendation risk.**
   - The page must stay factual and neutral: every fund gets the same fields and no ranking.
   - The default fund follows a stated, checkable rule (alphabetical) and the card says „nic nedoporučujeme“ (we don't recommend anything).
   - No suitability questions, no "best for you".
   - The checklist must state rules, not tell people what to do.
2. **Offering / marketing of non-EU funds** (research G). **Neither confirmed as allowed nor as prohibited.**
   - **Czech law:** ZISIF § 294 defines "offering investments" in a foreign fund by *what* is offered, not *who* offers. § 295a(1) allows public offering only for funds on a ČNB list, and §§ 296–297 restrict retail offers.
   - **EU rules:** the ESMA marketing guidelines address fund managers. The AIFMD "marketing" definition (by or on behalf of the manager) was confirmed only from secondary sources.
   - **Open question for counsel:** does a neutral comparison with no buy path count as *nabízení* (offering)? This is the main legal blocker.
   - The G4 guardrails (no buy or broker links, no ranking, KID restriction shown, historical data only) reduce the risk under any reading, but don't settle it.
   - The working assumptions (no partnerships, no affiliate links) remove the "on behalf of the manager" angle as far as we can tell. They **don't** answer the Czech § 294 question. **That stays a public-launch blocker** (section 8).
3. **Tax statements.**
   - Only general rules with sources (C1, D1, D3) appear.
   - Personal conclusions stay out: "no extra Czech tax", "no need to file", which ID number goes on W-8BEN.
   - Add a clear *nejde o daňové poradenství* ("this isn't tax advice") line.
4. **Historical vs forward-looking.**
   - Yields are past payouts.
   - CZK figures are illustrations under stated assumptions.
   - No return projections.
5. **Naming a broker (XTB).** It's a factual, dated example, but naming any broker is a business decision, and the fee may change.
6. **Email and privacy.**
   - No marketing emails are sent, so the prior-consent rule for marketing (§ 7(2) Act 480/2004) isn't triggered.
   - Whether the delivery email itself counts as a "commercial communication" is an interpretation (research H). Keep it free of promotion.
   - The GDPR legal basis and privacy text need compliance input.
   - **The operator's identity must appear on the page; it isn't decided yet, so this blocks launch.**
7. **Cookie consent for analytics.** Needs a decision (see section 6).

### Data quality
1. **Data goes stale:**
   - TERs change.
   - Yields shift with every quarterly payout.
   - The ČNB rate is daily.
   - XTB's fee table has changed before.
   - **Re-pull everything right before launch** and show the dates.
2. **Methods differ by issuer:**
   - The expense ratio "as of" dates aren't comparable across issuers.
   - SPY and SPYM yields are issuer-published; the other five are our calculation using the same definition.
3. **The conversion cost may be understated.** XTB adds 0.5% on top of its own exchange rate, whose spread isn't published. The card calls the rate a *modelová sazba* (model rate). The methodology explains the XTB source and that the real cost may be higher.
4. **The withholding figure rests on assumptions:** a valid W-8BEN, and each fund being treated as a RIC under the treaty. That isn't checked per fund; SPY is a unit investment trust.
5. **Names changed recently:**
   - VTI's index changed (Morningstar, not CRSP).
   - SPYM was SPLG until 31 Oct 2025.
   - Third-party data will often be out of date.
6. **ISINs and holdings counts are incomplete or derived;** don't show them until checked.
7. **Rounding:** use Czech number formatting (decimal comma, space as thousands separator) and round consistently between the page and the email.

### Implementation
1. **Email sending needs a backend and an email service** (a serverless function on free hosting is possible). Neither is chosen yet, and the sending domain depends on the undecided brand.
2. **Storing emails** brings data-protection duties, including any processor agreements with the hosting or email provider.
3. **Ad traffic is mobile and often lands in in-app browsers** (Facebook/Instagram):
   - The page must be light and fast.
   - It must work with no layout shift and without third-party scripts blocking rendering.
4. **Bot and spam protection** without adding friction (honeypot field, rate limiting; no CAPTCHA).
5. **One source of truth.** Before production, `etf-data.json` is the only place fund data lives.
   - The card, the overview, the methodology and the email (table and "your check") all load it.
   - Derived values (yield, fee, conversion, tax, the S&P 500 fee gap) are computed from the raw inputs in **one shared function**: distributions ÷ NAV, or the issuer yield for SPY and SPYM.
   - No independent copies of the same figures.
   - The wireframe still holds a clearly labelled copy of the raw inputs, because a local file can't load JSON. That copy must not survive into production.
6. **The analytics setup** must keep working when consent is refused (section 6).

---

## 8. Requirements before public launch

**Blocker** = the page receives no ad traffic until it's resolved. The prototype can be built and tested before then. **Later** = improves the page but can follow launch. Legal references point to [research H/G](research/claims-verification.md).

### Requirements by stage

Each stage adds to the previous one. None of the stages has been carried out yet; nothing is deployed.

**Stage 1: demo deployment (mock mode, no email is sent).** For showing the working page to reviewers on a Vercel preview.

*Required:*
- A Vercel project (account and owner are the operator's decision), deployed as a **Preview**, not Production. Production refuses mock mode, so the form would answer 503 there.
- Preview environment variable `EMAIL_DELIVERY_MODE=mock`, and nothing else for email. **No** `RESEND_API_KEY`, no other Resend variables, and no analytics provider (none exists in the code).
- `npm test`, `npm run typecheck`, `npm run lint` and `npm run build` pass, and so does the local Vercel build check (section 10).
- On the preview, check the items that a local check can't prove (section 10, "What a local check does NOT prove").

*What visitors see:*
- The form works end to end, but the confirmation says the send was only simulated („Ukázka – e-mail se neodeslal … jsme jen nasimulovali. Žádný e-mail neodešel.“), with the MOCK notice.
- The other form's line says the same.
- Nothing is sent, and nothing is stored beyond in-memory hashes.
- The local dev outbox (`/api/dev/outbox`) does not exist on a deployment.

*Limits:*
- Share the link with reviewers only, and keep it protected (check the project's Deployment Protection setting). Never use it for ads.
- The page still shows the operator and privacy-notice placeholders and the 7–8 Oct 2026 data snapshot.
- Reviewers should type test addresses. An address typed into a demo form still reaches the server, even though nothing is sent.

**Stage 2: real email delivery** (adds to stage 1). Before any real visitor gets a real email:
- **Production** deployment with `EMAIL_DELIVERY_MODE=resend` and every variable in section 13:
  - `EMAIL_DELIVERY_CONFIRM`;
  - a sending-only `RESEND_API_KEY` in Vercel's environment settings, never in the repo;
  - `EMAIL_FROM` on a domain verified in Resend (SPF + DKIM);
  - `EMAIL_OPERATOR_LINE`;
  - `ALLOWED_ORIGINS`.
- ⛔ The **shared rate-limit store**, with a shared hashing secret and failing closed. The form sends email to any address, so the in-memory limits are not enough once the form is reachable by anyone outside the team.
- Confirm Resend's idempotency behaviour after *failed* requests, and adjust the retry key if needed (section 13).
- Operator identity, the privacy notice linked from both forms, and the retention policy (⚖, part of the legal review).
- A real-inbox test, including spam placement, and monitoring of bounces and complaints in Resend.
- Only in this mode does the page show the real confirmation („Hotovo ✓ … jsme poslali na …“), and only after Resend has accepted the email.

**Stage 3: public advertising** (adds to stages 1 and 2):
- ⛔ The **legal review** is complete (ZISIF offering question; the MAR / ZPKT recommendation and advice boundary).
- **Data refreshed** within days of launch (section 14).
- **Analytics:**
  - a provider is chosen and connected;
  - the consent decision is made (⚖), and the consent interface is built if it's needed;
  - the privacy notice covers analytics;
  - the checks under section 6, "Implemented now vs. required before advertising", are done.
- Copy guardrails and disclaimers are checked against the build.
- **Real-device QA:**
  - phones, plus the Facebook, Instagram and TikTok in-app browsers;
  - the first-screen criteria (section 10);
  - autofill behaviour.
- The performance budget.
- Ad URL templates that pass the UTM sanitizer (section 6); a landing variant ID if A/B tests are run.
- Every row of the blocker table below is closed.

### Blockers

| Area | Minimum requirement | Basis |
|---|---|---|
| **Legal review** ⛔ | A documented answer from a qualified lawyer on: (1) whether the page is *„nabízení investic“* (offering investments) under ZISIF § 294 (G3.2); (2) the MAR investment-recommendation and ZPKT investment-advice boundary for the final copy (G3.3–4). **Our research isn't legal advice and doesn't replace this** | ZISIF §§ 294–297; ESMA 2024 warning; ZPKT § 2(1)(f) |
| Operator identity | Name, registered office, IČO and registry entry (if any), and a contact email, visible on the page and in every email | Civil Code § 435(1); § 7(4)(b) Act 480/2004 |
| Privacy notice | Controller identity and contact, purpose (only delivering the requested comparison), legal basis (to be set by compliance), recipients (hosting, email provider, analytics), retention period, transfers outside the EU (if a provider is outside the EU), rights including complaint to ÚOOÚ. Linked next to the form button | GDPR Art. 13 via ÚOOÚ (full article text to re-check) |
| Email flow | **Built in M3** (section 13): one email with exactly the promised content, failures visible and retryable, success only after Resend accepts. **Still open before launch:** a verified sender domain in Resend (SPF + DKIM), production credentials, `EMAIL_OPERATOR_LINE`, `ALLOWED_ORIGINS`, and a real-inbox delivery test (including spam placement) | Act 480/2004 § 7; Gmail sender requirements |
| **Abuse protection store** ⛔ | Rate limits and duplicate detection are in-memory per server instance. On serverless hosting every instance has its own copy, so they don't stop someone using the form to send our email to third parties. **Before any ad traffic** they must move to a shared store (e.g. a hosted Redis), with the address hash keyed by a shared server-side secret instead of today's per-instance random salt. Duplicate emails are already prevented by Resend idempotency keys | Section 13 (M5 audit) |
| Email storage | Decided where addresses are stored, who can access them and for how long. Processor terms with the hosting/email provider checked | GDPR (needs compliance check) |
| Analytics consent | No non-essential device storage or reading before consent. Refusing as easy as accepting. Funnel events contain no personal data. **Built:** events without personal data, a consent gate that every adapter passes through (default: nothing sent, no replay). **Open:** whether the chosen provider needs consent, and if so the consent interface with withdrawal (section 6, Privacy and consent) | § 89(3) Act 127/2005; ÚOOÚ |
| Funnel tracking | **Built in M4** (section 6): the funnel events fire with UTM, device and in-app context; `lead_email_accepted` only after Resend accepted the email (not inbox delivery). **Open:** everything under section 6 "Implemented now vs. required before advertising": provider, consent decision and interface, conversion-rate basis under consent, verification on real devices, variant ID, `guide_opened` | Assignment requirement |
| Source attribution | Every figure on the page and in the email shows its source and "as of" date. A methods/assumptions section exists. All figures are derived from `etf-data.json` through one shared calculation; no hard-coded or duplicated figures (Implementation 5) | Research rules; assignment ("cite the source") |
| Data refresh | TER, distributions, NAV, the XTB fee and the ČNB rate re-pulled within days of launch; ČNB rate date displayed. Procedure: section 14 | Research F |
| Copy guardrails | Promise and card follow section 2 and 3a rules: no total, no ranking between lines, no "N years" line, *daň* not *poplatek*, *může* not *platíte*, neutral default, no buy or broker links, no forecasts | Research B0, B4, G4 |
| Disclaimers | Not investment advice or a recommendation; not tax advice; historical data isn't a forecast; currency note | G4; D3 |
| Mobile QA | Works in Facebook/Instagram in-app browsers; form usable on small screens; first screen shows a result without interaction | Brief section 1 |

### Later (not launch-blocking)

- Email open/click tracking (see `guide_opened`, section 6).
- DMARC. Gmail requires it only at 5,000+ messages a day. One-click unsubscribe applies to marketing emails, which the prototype doesn't send.
- PDF version of the comparison.
- Number of holdings and ISINs (after checking against fact sheets).
- Trading 212 or other broker conversion examples.
- European (UCITS) context section.
- Multi-year view (out of scope for the prototype).
- Automated data refresh.
- Full accessibility audit (basic contrast, labels and keyboard use belong in the launch QA).

## 9. Decisions

### 9a. Decided for the prototype

| Decision | What it means in practice |
|---|---|
| No broker or issuer partnerships, no affiliate links | No buy or broker links anywhere. No conflict-of-interest disclosure needed. Reduces (doesn't settle) the fund-marketing risk |
| No marketing emails; the email only delivers the requested material | One email, no follow-ups, no consent checkbox. Privacy notice has one purpose |
| Legal review is a public-launch blocker | Prototype builds and testing can proceed; no ad traffic until the review is done |
| Lead magnet: ETF reality check, 7 funds (IVV, SCHD, SPY, SPYM, VOO, VT, VTI) | Sections 3 and 5 |
| Default fund: IVV, first alphabetically, rule stated on the card | Section 3a |
| Rounding: 3 significant digits, at least whole CZK, half-up; calculations use the unrounded yield | Section 3a; research F3 |
| Three cost lines kept separate; no total, no ranking, no "N years" line | Section 3a rules |

### 9b. Pre-wireframe decisions, made 2026-10-09

| Decision | Chosen for the prototype | Practical consequence |
|---|---|---|
| Card time frame | **1-year view only** | Simple card. Recurring lines carry the note "every year you hold it" so they don't look minor next to the one-off conversion. Multi-year view stays under "Later" |
| Conversion example | **Adjustable model rate** (0–1%, default 0.5%); XTB named only in the methodology | No broker name on the card. One extra control. Users can enter their own broker's rate |
| Analytics | **Minimal, provider-agnostic** event layer (section 6 events, plus `rate_change`, now `conversion_rate_changed`; built in M4). Events go into a local queue and are **sent nowhere** until a provider and consent approach are chosen. We don't assume consent is unnecessary | The prototype can be clicked through and instrumented without committing to a tool. The wireframe reserves a slot for a consent banner in case one is needed |
| Email delivery | **Sent immediately after submit; no double opt-in; no marketing** | Fastest path to value. A mistyped address gets one email. Privacy notice and launch requirements stay as in section 8 |

### 9c. Decisions that can wait until after the wireframe (but must be resolved before public launch)

**1. Operator** (legal entity, IČO, contact)
- Needed for the footer, the privacy notice and the email sender.
- The wireframe can use a placeholder.
- An individual vs a company changes what § 435 requires on the page.

**2. Email provider and sending domain**
- An EU-based provider keeps the privacy notice simpler.
- A non-EU provider adds a "transfer outside the EU" section.
- The domain depends on the operator and brand.

**3. Retention period for addresses**
- **Delete right after sending:** the smallest privacy footprint, but duplicate requests can't be detected and delivery problems can't be investigated later.
- **Keep for a defined period:** allows support and deduplication, but has to be justified in the privacy notice.

**4. Analytics tool and consent approach**
- A consent banner with standard analytics, or a setup that stores nothing on the device.
- Whether a given tool needs consent under § 89(3) is a compliance question (section 8).
- The requirements for either path and the remaining decisions are listed in section 6, "Privacy and consent".

**5. Who does the legal review and when**
- Required before public launch (section 8).
- Starting early lowers the risk of redesigning after the wireframe if counsel requires changes (e.g. to the checklist or the overview).

---

## Proposed page structure (mobile-first)

1. **Hero + ETF selector.** One-line promise matching the ad and the 7 ETF chips. The amount selector sits in the card heading, so the first cost figure fits on the first screen.
2. **Reality-check card for the selected ETF.** Visible straight away for the default (IVV), and updates on each tap.
3. **Inline email form.** "Send me the comparison of all 7 + the checklist", with an email field and a preview of what's inside.
4. **Same index, different fee + the 7-fund overview.** A compact list showing that fund-fee differences are small; tapping a fund updates the card.
5. **Short explainers (expandable):** the three cost types, W-8BEN, why EU brokers usually don't sell US ETFs (KID), Czech tax basics (time test, 100k CZK, dividends).
6. **Second email form** + checklist preview.
7. **Sources, method and disclaimers:** data dates, assumptions, "not investment or tax advice", operator details (pending).

**Sticky bottom CTA (mobile)**: a proposed interaction, specified here and shown as a static frame (ST1) in the wireframe.
- **Appears** only after `result_viewed`, and only once the visitor has scrolled past the three cost lines, so it never overlaps the card while it's being read.
- **Tap** scrolls to the inline form (S3) and focuses the email field (`cta_click` {position: sticky}).
- **Hidden** while S3 or S6 is in the viewport, while an input has focus (keyboard open), and while a consent banner is showing.
- **Doesn't cover content:** one line, at most about 56 px plus the safe-area inset. The page adds equal bottom padding. No overlay, no focus trap.
- **Disappears permanently** after `lead_email_accepted`.

**Why this order**
- **1–2 come first** because ad visitors stay only a few seconds. The first screen has to continue the ad's promise and *deliver* it at once. A pre-filled result means value arrives before any typing or scrolling.
- **3 comes right after the result** because that's when the value is most visible. Asking earlier would gate value (against the brief); asking later loses mobile visitors who never scroll.
- **4 and 5 are for visitors who aren't convinced yet.** They can explore other funds and check the reasoning; most of the trust-building sits here. These sections come after the first ask, so they don't push the CTA off the first screens.
- **6 catches people who read the explainers and now see the checklist's value.**
- **7 comes last** because few people read it, but it must exist for every claim on the page.

---

## 10. Production-build handoff

These are implementation-level choices made so the build can start. None of them reopens a product decision.

### Architecture (as built, M1–M5)
- **Stack** (set 2026-10-09): React 19 + TypeScript + Vite 8, Tailwind CSS 4 (design tokens as CSS variables in the Tailwind `@theme`), Vitest, oxlint. No UI component library. Self-hosted fonts via Fontsource; nothing loads from a CDN.
- **Deployment target:** Vercel (free tier).
  - The static page is built to `dist/`, and one function, `api/lead.ts`, serves `POST /api/lead`.
  - `vercel.json` sets the function time limit and the security headers (see "Security configuration" below).
  - **Nothing is deployed.** The Vercel build was checked **locally only**: `vercel build` plus loading the emitted function under Node 22 (procedure and results under "Vercel build: local check vs. real preview" below). A real Vercel preview has not been made.
  - **ESM rule for the function's code.** `@vercel/node` compiles each file to ES modules without bundling. Node's loader then needs an explicit `.js` extension on every relative import (`'./calc.js'`, which TypeScript, Vite and Vitest resolve to `calc.ts`) and `with { type: 'json' }` on JSON imports. Without them `vercel build` still reports success, but the function fails on load with `ERR_MODULE_NOT_FOUND` (found and fixed in M5). `server/functionImports.test.ts` walks the import graph from `api/lead.ts` and fails on any violation.
- **Code layout:**

  | Path | What it holds |
  |---|---|
  | `research/etf-data.json` | The single source of fund data, imported at build time |
  | `src/domain/etfData.ts` | Validates and types the data (`parseEtfData`); core funds only, alphabetical; `defaultTicker` = first |
  | `src/domain/calc.ts` | Full-precision calculations, no rounding: `trailingYieldPct`, `costLines` (fee, conversion, tax 15 % / 30 %), `feeGapPctPoints`, and the `AMOUNT` / `CONVERSION_RATE` limits |
  | `src/domain/format.ts` | Display rounding and Czech formatting, the **only** place rounding happens: `roundCzk` (3 significant digits, at least whole CZK, half-up), `formatCzkEstimate` ("0 Kč", "< 1 Kč", "≈ … Kč"), the yield to 2 decimals, the rate, dates |
  | `src/domain/result.ts`, `comparison.ts`, `methodology.ts` | Framework-free models for the card, the 7-fund comparison and the methodology/sources, shared by the page **and** the email |
  | `src/content/cs.ts` | All Czech copy; figures are interpolated, never typed |
  | `src/components/*` | `EtfPicker`, `AmountControl`, `ResultCard`, `Section`, `Comparison`, `Explainers`, `Checklist`, `Methodology`, `LeadForm` |
  | `src/App.tsx`, `src/main.tsx` | Page shell and state; tracker set-up |
  | `src/lead/` | Shared validation (browser + server), the browser client, the focus rule after a failed send |
  | `src/email/leadEmail.ts` | The email (HTML + text), rendered from the same domain modules |
  | `src/analytics/` | The event layer (section 6) |
  | `server/config.ts` | Environment validation (fails closed) |
  | `server/email/` | `EmailProvider` interface; Resend and mock adapters |
  | `server/lead/` | Request handler, endpoint factory, in-memory limiter and intent store |
  | `server/devApi.ts` | Vite dev middleware: `/api/lead` and the loopback-only mock outbox |
  | `api/lead.ts` | Vercel function entry |
  | `vercel.json` | Function time limit and security headers |
  | `.vercel/` | Created by the Vercel CLI (project link, `vercel build` output). Git- and lint-ignored, never committed |

- **Data validation:** `parseEtfData` checks required fields when the module loads: TER, distributions + NAV or the issuer yield, index, inception, the data date and the ČNB rate. If a field is missing it throws, which blanks the page and stops the email. `npm test` runs the same check (and the reference figures) against the real file. **The build itself does not run it, so run `npm test` before every deploy.** No fund figure is typed anywhere else; a test enforces it.
- **Lead endpoint** (details in section 13):
  - validation shared with the browser (plain addresses only);
  - honeypot, origin check, per-IP and per-address limits;
  - idempotent sends through the `EmailProvider` interface: mock by default, Resend only when fully configured;
  - success only after the provider accepts the email.
- **Analytics** (section 6, `src/analytics/`):
  - `events.ts`: the event catalogue, buckets and a runtime allow-list;
  - `tracker.ts`: `track` / `trackOnce`, sinks and the consent gate;
  - `context.ts`, `leadFunnel.ts`, `dwell.ts`, `hooks.ts`, `react.tsx`.
  - No receiver in production builds.
- **Tests:** Vitest only (`npm test`, node environment):
  - **domain:** the data, the F3 reference figures, rounding, comparison, result;
  - **lead flow:** validation, the client, the focus rule, the handler, the endpoint, the config, the providers, the email content;
  - **analytics:** semantics, consent and the privacy guards;
  - **deploy config:** `vercel.json` shape, timeouts, headers.
  - **No browser end-to-end tests exist.** The first screen, the funnel, form states and responsive layouts were checked manually in a browser at 320 / 375 / 1280 px (M3–M5). Automating this (e.g. Playwright) is optional and not set up.
- **Security configuration** (`vercel.json`, schema https://openapi.vercel.sh/vercel.json; not deployed):
  - `functions["api/lead.ts"].maxDuration = 25` s. For non-Next.js functions Vercel reads this from `vercel.json` (or an exported `config` object), not from a bare `export const maxDuration`, which was removed. A test keeps the chain provider timeout (≤ 15 s) < browser timeout (20 s) < function limit (25 s).
  - Headers on every path:
    - `X-Content-Type-Options: nosniff`;
    - `Referrer-Policy: strict-origin-when-cross-origin`;
    - `X-Frame-Options: DENY`;
    - `Permissions-Policy` (camera, microphone, geolocation, payment, usb, browsing-topics disabled);
    - `Cross-Origin-Opener-Policy: same-origin`;
    - a **minimal CSP**: `frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'`.
  - The CSP deliberately does not restrict scripts, styles, fonts, images or requests yet, because a wrong policy would break the page. A fuller policy (`default-src 'self'` …) should first run as `Content-Security-Policy-Report-Only` on a preview deploy. Note that Vercel's preview toolbar loads its own scripts.
  - HSTS is not set here. On the preview deploy, check whether Vercel already sends `Strict-Transport-Security`, then decide a value for the final domain. `includeSubDomains` / `preload` affect every subdomain of the operator's domain, which isn't known yet.

### Vercel build: local check vs. real preview

**Local check (no account, no login, no deploy).** Run it in a scratch copy, so that no `.vercel/` output lands in the repository (`.vercel/` is also git-ignored).

1. Copy the working tree outside the repo, without `node_modules`, `dist`, `.git` and `.vercel`. Run `npm ci` there.
2. Instead of `vercel link` / `vercel pull`, which need an account, write `.vercel/project.json` by hand:

   ```json
   {
     "projectId": "prj_local_verification_only",
     "orgId": "team_local_verification_only",
     "settings": { "framework": "vite", "buildCommand": null, "outputDirectory": null, "installCommand": null, "devCommand": null, "rootDirectory": null, "nodeVersion": "22.x" }
   }
   ```
3. Build the preview target with the official CLI, without adding it to the project (63.1.2 used in M5):

   ```bash
   VERCEL_TELEMETRY_DISABLED=1 npx --yes vercel@63.1.2 build --standalone
   ```
4. Inspect `.vercel/output/`:
   - `functions/api/lead.func/.vc-config.json`: runtime `nodejs22.x`, `maxDuration: 25`;
   - `config.json`: the header route on `/(.*)`;
   - `static/`: the page.
5. In `functions/api/lead.func`, load the function under **Node 22** in mock mode:

   ```bash
   EMAIL_DELIVERY_MODE=mock VERCEL_ENV=preview NODE_ENV=production node -e "import('./api/lead.js').then(m => console.log(Object.keys(m)))"
   ```

   It must print `[ 'POST' ]`. Then call `POST` with a Web `Request`: a valid body → 200 mock "sent"; a display-name address → 400; misconfigurations → 503.

**Results of the local check (M5, 2026-10-09):**
- The build completes and the function loads.
- Mock requests behave as specified.
- Dev-only paths return 404.
- The build output contains no debug buffer and no secrets.

The builder still prints **non-fatal type diagnostics** (`TS2591 process`, `TS2339` on narrowed unions). It type-checks with its own default options, because the root `tsconfig.json` only holds project references. They don't affect the emitted code, and our own `npm run typecheck` is clean.

**What a local check does NOT prove** (needs a real Vercel preview):
- that Vercel's own function launcher loads the code on its runtime image (locally: plain Node 22);
- Vercel's routing, and that headers are applied at its edge;
- whether Vercel adds HSTS itself;
- that `maxDuration` is enforced, and the cold-start time;
- the runtime values of `NODE_ENV` / `VERCEL_ENV`;
- that `x-forwarded-for` is set by Vercel and can't be spoofed;
- the response to methods other than POST;
- behaviour on real phones and in the in-app browsers.

The M5 browser checks ran against a local stand-in that served the build output (`static/` + the header route + the built function). It is not Vercel's router.

**Configuration for a future demo preview (not done):**

| Vercel environment | `EMAIL_DELIVERY_MODE` | Other email variables |
|---|---|---|
| Preview (demo) | **`mock`, set explicitly.** Vercel functions run with `NODE_ENV=production`, so an unset mode makes the endpoint refuse to run (503) by design | None. **Don't set `RESEND_API_KEY`** for Preview |
| Production | Never `mock` (refused with 503 when `VERCEL_ENV=production`) | Only after the section 8 blockers, as listed in section 13 |

In mock mode the confirmation says the send was only simulated and that no email was sent (section 8, stage 1). Neither the page nor the function's logs mention `/api/dev/outbox`. Only the local Vite dev server logs where its outbox is, because it exists nowhere else. A test (`server/devApi.test.ts`) keeps it that way.

### Implementation priorities
1. **M1, data and calculation core with the first screen** — ✅ built locally 2026-10-09 (no deploy yet):
   - load and validate `etf-data.json`;
   - `calc.ts` + `format.ts` with golden tests;
   - render the hero (S1) and the card (S2) for all 7 funds, with the ETF chips, amount selector and rate slider;
   - deploy a preview.
2. **M2, the rest of the page** — ✅ built locally 2026-10-09:
   - the comparison of all 7 funds (S4);
   - explanatory chapters (S5) on the fund fee, conversion, US dividend tax, KID and Czech sale tax;
   - the checklist (S6);
   - the methodology (S7) on the shared section frame.

   Moved to M3 (as agreed): the inline and second email forms, the sticky CTA and the analytics queue.
3. **M3, lead flow** — ✅ built locally 2026-10-09 (section 13):
   - both forms (inline after the result, repeat after the checklist);
   - `POST /api/lead` with validation, honeypot, origin check, per-IP and per-address limits and idempotent sends;
   - a Resend adapter (official SDK, HTTPS API) and a mock adapter (default);
   - the email rendered from the shared modules;
   - loading / success / error / "already sent" / "pošlete znovu" states.
4. **M4, funnel analytics** — ✅ built locally 2026-10-09 (section 6): provider-independent event layer, the funnel events wired into the page and both forms, consent gate, privacy guard tests. Disabled: no provider, nothing sent.
5. **M5, hardening** — in progress:
   - read-only audit done;
   - fixed: plain-address email validation; the honeypot renamed to a field browsers don't autofill; focus back on the email field after a failed send; `vercel.json` (function limit, security headers); provider timeout capped at 15 s; README synced; data-refresh procedure (section 14).
   - local Vercel build check: found that the built function failed to load (extensionless ESM imports, JSON without an import attribute). Fixed with explicit `.js` extensions and the JSON attribute, guarded by a test; `.vercel/` ignored.
   - demo confirmation: the mock-mode wording now says the send was simulated and no email was sent (title, sentence, „pošlete znovu“ line, the other form's line, notice). The pointer to `/api/dev/outbox` was removed from the page and the function's log.
   - **Open:** a real Vercel preview in mock mode, the shared rate-limit store ⛔, Resend retry semantics after failed requests, the performance budget and the real-device QA list.
6. **M6, public launch:** only after every section 8 blocker is closed. These are external: legal review, operator, privacy notice, email provider and domain, analytics and consent.

### Acceptance criteria (prototype build)
- **Figures**
  - Unit tests reproduce the research F3 table exactly for all 7 funds: fee, conversion, 15 %, 30 % at 100 000 Kč and a 0.5 % rate.
  - Rounding cases pass: 94,5 → 95; 155,93 → 156; 999,5 → 1 000; 1 005 → 1 010; 15 593 → 15 600; 0 → "0 Kč"; 0,4 → "< 1 Kč".
- **Independence:** the rate changes only the conversion line; the fund changes only the fee and tax; the amount changes all three (unit tests in `calc.test.ts`; no browser end-to-end test).
- **Single source:** a test or lint check fails if any TER, yield, distribution or NAV value appears in `src/` outside the data import.
- **Inputs**
  - Custom amounts outside 1 000–10 000 000 Kč show an error and keep the last valid figures.
  - Default state: IVV, 100 000 Kč, 0,5 %, with the one-line default rule visible until the first selection.
- **First screen**
  - The bottom of the first cost figure is at ≤ 548 CSS px at 375 px width and ≤ 560 CSS px at 360 px width, in the default state.
  - Wireframe reference: 517 / 535 px. Measured in the build (M5 audit, browser emulation): 517 px at 375 px.
  - Then confirmed on real devices, including the Instagram/Facebook in-app browsers.
- **Forms**
  - An invalid email shows the error, which clears when the user edits.
  - A filled honeypot never produces a success.
  - The confirmation appears only after the API confirms sending, and an API failure shows the retryable send error.
  - After a success, the other form is replaced by the "already sent" line.
  - "pošlete znovu" (send again) reopens the form with the address kept.
  - The email address never appears in analytics payloads or URLs.
- **Copy guardrails:** no total, no ranking, no "N years" line, *daň* (tax) not *poplatek* (fee) for the withholding line, disclaimers and methodology present, sources and dates rendered from the data.
- **Analytics:** every implemented section 6 event fires by its definition with only the allow-listed properties; `lead_email_accepted` never fires for an unconfirmed or failed send and is never reported as inbox delivery; nothing leaves the browser without a configured provider and consent decision.
- **Basics:**
  - no console errors;
  - no layout shift when a fund is switched;
  - controls have labels;
  - the card updates are announced through `aria-live`;
  - tap targets meet WCAG 2.2 target size (minimum).

### External dependencies, not blocking the build but blocking public launch
- Legal review: ZISIF "offering" question and the recommendation/advice boundary.
- Operator identity.
- Privacy notice and legal basis.
- Email provider and sending domain (SPF/DKIM).
- Retention period.
- Analytics tool and consent approach.
- Data re-pull right before launch (section 14).

Details and the legal basis for each are in sections 8 and 9c.

---

## 11. Visual system (M1)

Derived from the reference screenshots (Paynext, Finotive, Tripay) as principles, not layouts:
- **One saturated accent on a calm neutral canvas.** Tripay's solid blue block and Paynext's single violet → one flat cobalt. No gradients, no purple.
- **Big tight display type with an editorial italic serif counterpoint**, as in Finotive's italic line.
- **Numbers as the hero image:** large figures with tiny muted labels. Our real result card replaces the phone mock-ups, so no stock imagery.
- **Small eyebrow labels, generous whitespace, hairline borders.**

Deliberate differences from the references: no pills, no soft blob cards, squared statement-style rows.

| Token | Value | Use |
|---|---|---|
| Colour: paper / surface / tint | `#f5f4f0` / `#ffffff` / `#ecebe5` | Warm-neutral page; white result panel; quiet info boxes (KID, disclaimer) |
| Colour: ink / ink-2 / ink-3 | `#111218` / `#3f4150` / `#656877` | Text hierarchy. ink-3 ≈ 4.9:1 on paper (WCAG AA) |
| Colour: line | `#dcdad2` | Hairlines between statement rows |
| Colour: accent / accent-strong / accent-tint | `#2a3bd6` / `#1c299f` / `#e7e9fb` | Selected ticker, slider thumb, links, and on desktop a flat cobalt slab offset 16 px behind the card (visible as a right and bottom edge, about 75 % less cobalt than the earlier full frame). White on accent ≈ 7:1 |
| Colour: error | `#b3261e` | Invalid input only |
| Type: sans | Schibsted Grotesk (variable) | Headline, UI, figures. Tabular figures **only for whole-number values**: in this face, tabular spacing also widens the decimal comma |
| Type: serif accent | Instrument Serif italic | The second line of the H1 and the section headings (02–05); nowhere else |
| Type: mono | IBM Plex Mono | Tickers, eyebrows, units (*ročně*, *jednorázově*), fact tags |
| Type scale | display 36 px (clamped down below 390 px; 68 px desktop) · figure 26 px · body 16 · notes 13.5 · labels 11 px mono uppercase | Display tracking −0.035em |
| Spacing | Tailwind 4 px scale; 16 px mobile gutters, 24 tablet, 40 desktop | — |
| Borders | 1 px hairlines; 1 px ink for the ticker strip; 2 px ink left rule for the "no total" note | — |
| Radii | 2 px (tags) · 6 px (controls, info boxes) · 10 px (result panel only) | No pills, no rounded-everything |

**Layout**
- **Mobile:** single column. The first screen holds the eyebrow, the two-line headline, the lead, a 7-cell ticker strip in one row, and the top of the card with the first cost figure.
- **Desktop (≥ 1024 px):** 12 columns.
  - Headline and picker on the left (5 columns). The column is sticky, so the picker stays in view while the longer card scrolls; the eyebrow aligns with the card's top edge.
  - The card on the right (7 columns), with the offset cobalt slab behind it.
  - Methodology in an editorial 4 + 8 split.
- **Controls set as typography, not boxes:**
  - The amount is an underlined 20 px figure, with the mono „(orientačně, 1 rok)“ label on the same baseline.
  - The conversion slider sits directly under the figure it changes, with only its 0 % / 1 % end labels.
  - Custom amounts use the same underlined style.
- **Page rhythm (M2):** every section after the hero uses one frame (`Section`):
  - an ink rule, a mono running head („02 · Srovnání“), a serif italic heading;
  - on desktop, the heading sits in a sticky 4-column margin beside 8 columns of content.
  - Inside sections: hairline-separated rows and numbered chapters instead of cards.
- **Comparison layout** (revised 2026-10-09):
  - **Below 1024 px:** one row per fund, never a squeezed table. Reading order: ticker + full name (with „v kartě“ or „Prověřit ↑“ on the right), then four labelled figures.
    - Below 768 px the figures sit in two columns that mirror the table groups: fund fee (TER, fee per year) | dividends (12-month yield, dividend tax 15 %). The right column is wider (2 : 3) so every label stays on one line down to 320 px.
    - From 768 px all four sit on one line.
    - Secondary detail: the provider is not repeated (it's in every fund name). The index is shown only for the „Jiný index“ group; the S&P 500 group names its index in the group text.
  - **From 1024 px:** a full-width table (the section uses the wide frame: heading above, table across 12 columns).
    - Grouped headers: „Poplatek fondu“ over TER and fee per year, „Dividendy a daň v USA“ over yield and tax, separated by a hairline.
    - Each column has a short label plus a note (*ročně* · *v Kč, pro {částka}* · *za 12 měsíců, historicky* · *15 %, ročně, přibližně*). Numbers are right-aligned; CZK figures semibold.
  - **Selected fund:** the same treatment on rows and table (light cobalt tint + 2 px cobalt left rule + „v kartě“).
  - **The fee-gap sentence names its funds:** „Fondy IVV, SPY, SPYM a VOO sledují stejný index S&P 500…“, with the tickers taken from the data.
  - **The footnote keeps both caveats:** conversion is identical for all funds and shown separately, and the dividend figures are historical and approximate.
- **Selection:** the fund shown in the card is marked „v kartě“ and with a 2 px cobalt rule. „Prověřit ↑“ selects a fund, scrolls back to the card (instantly if reduced motion is preferred) and moves focus to the card heading.
- **Motion:** colour transitions on the ticker cells, and smooth scrolling for „Prověřit“ unless reduced motion is preferred.

## 12. Running locally

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # Vitest (302 tests): data + F3 figures, rounding, comparison, lead validation/flow, email content, analytics, deploy config, function imports
npm run typecheck  # tsc -b (app, tests, config)
npm run build      # type-check + production build to dist/
npm run lint       # oxlint
```

**Email delivery locally:** `npm run dev` uses **mock delivery** by default. Submit a form, then open http://localhost:5173/api/dev/outbox to read the generated email; addresses are masked and nothing is stored on disk. See section 13 before configuring real delivery.

---

## 13. Email delivery (M3)

### Code
- `src/components/LeadForm.tsx`: the form and its states.
- `src/lead/`: browser client and shared validation.
- `src/email/leadEmail.ts`: the email, rendered from the same result, comparison, checklist and methodology modules as the page.
- `server/`: configuration, providers, handler, stores, dev middleware.
- `api/lead.ts`: the serverless entry for later deployment (not deployed).

### How a send works
1. The form validates the address in the browser (the same rules as the server) and sends `{email, ticker, amountCzk, conversionRatePct, requestId, topic}`.
   - **Plain addresses only** (`src/lead/validation.ts`): dot-atom local part (no quotes, no leading, trailing or double dots), at least two domain labels, and an alphabetic or punycode TLD. Display names (`"Bank" <a@b.cz>`), angle brackets, commas, semicolons, spaces, comments, IP literals and non-ASCII characters are rejected, so the recipient is never ambiguous and the per-address limit can't be dodged with variants.
   - `requestId` is one UUID per send intent: a retry of the same attempt reuses it; „pošlete znovu“ creates a new one.
   - `topic` is the hidden honeypot field, renamed from `company` in M5. Browsers and password managers autofill "company", and an autofilled honeypot would give a real visitor a fake success. The new name, a neutral label and opt-out attributes for common password managers avoid that.
   - After a failed or unconfirmed attempt, focus returns to the email field, which the error message describes, so a keyboard user can correct it or press Enter to retry. Focus isn't taken if the visitor has moved elsewhere in the meantime.
2. The server checks the method, the origin (if configured), the content type, the per-IP limit (10 requests / 10 min), the body size (4 KB) and the input.
3. **Honeypot filled** → answers like a success and sends nothing.
4. **Duplicates:**
   - the same `requestId` already sent → the cached success, no second email;
   - the same `requestId` in flight (double click) → shares the one send;
   - the same `requestId` with a different payload → 409.
5. **Per-address limit:** 3 new sends per address per 24 h. Only a salted SHA-256 hash of the address is kept (random salt per server instance), in memory.
6. The email is rendered (deterministically) and passed to the provider with `Idempotency-Key: lead-<requestId>` and a 10 s timeout.
7. The answer is **200 "sent" only after the provider accepted the email**:

   | Provider result | Answer |
   |---|---|
   | Timeout or unknown failure | 504 "unconfirmed". A retry with the same `requestId` is safe: Resend returns the original send instead of sending again |
   | Rejected | 502 |
   | Quota or configuration problem | 503 |

8. **Logs** contain the event type, mode, provider id and ticker. Never the email address or the IP.

### Limits of the current abuse protection (not production-ready for multiple instances — ⛔ launch blocker)
- **The rate limits and the intent store live in the memory of one server process.** That is enough for the local dev server and a single long-running instance. It is **not sufficient for a multi-instance or serverless production deployment**: every instance (and every cold start) has its own empty copy, so the per-IP and per-address limits can be exceeded by a factor of the instance count, and they reset on redeploy. **Before any ad traffic** they must move to a shared store (e.g. a hosted Redis with atomic counters and expiry), listed as a ⛔ blocker in section 8. The address hash must then use a shared server-side secret instead of the per-instance random salt. If the store is unreachable, sending must fail closed.
- **Duplicate emails do not depend on this memory.** Every send carries the Resend idempotency key `lead-<requestId>`, which Resend honours across instances (for 24 h). A retry of the same attempt landing on another instance therefore cannot send a second email.
- **Not yet verified (M5 audit):** what Resend returns when a key whose first request *failed* (429 / 5xx / validation) is reused. If it replays the cached error, „Zkusit znovu“ after such a failure keeps failing for that attempt. The retry logic stays unchanged until this is confirmed against Resend.
- **Concurrent sends to one address with different `requestId`s** (two tabs submitted at the same moment) can both pass the per-address check before either is counted. Acceptable at a limit of 3 / 24 h; a shared store with an atomic increment closes it.
- **Client IP:** `api/lead.ts` takes the first `x-forwarded-for` entry, which Vercel sets itself. On a host that passes the header through from the client, it can be spoofed and the per-IP limit becomes advisory.
- **Timeouts:** the provider timeout is 10 s (`EMAIL_PROVIDER_TIMEOUT_MS`, allowed 1–15 s; anything else falls back to 10 s). The browser gives up after 20 s, and the function limit is 25 s (`vercel.json`). This order means the function answers „unconfirmed“ itself. If the platform still cuts the request off, the browser maps the gateway error or its own 20 s timeout to „unconfirmed“ too — never to success.

### Mock mode (default)
- **When:** `EMAIL_DELIVERY_MODE` unset (outside production) or `mock`. The server log says „delivery mode: MOCK“.
- **What it does:** the mock provider never touches the network. It keeps the last 10 rendered emails in memory with masked recipients (`j***@e***.cz`); a restart clears them.
- **Preview:** `GET /api/dev/outbox` lists them, and `/api/dev/outbox/<n>` shows the HTML (`?format=text` for plain text). The preview exists only in the Vite dev server (not in `vite preview`, the production build or the serverless entry), and it answers only requests from this machine (loopback), even if the dev server is started with `--host`.
- **Not on the live site:** with `VERCEL_ENV=production` the mock mode is refused (503), so production visitors can never get a confirmation for an email that was not sent. Preview deployments may use mock, but must set `EMAIL_DELIVERY_MODE=mock` explicitly (section 10, "Configuration for a future demo preview").
- **Visible on the page:** the same confirmation layout, but in demo wording (`src/lead/confirmationCopy.ts`).
  - The title is „Ukázka – e-mail se neodeslal“, and the sentence says the send to the address was only simulated and no email went out.
  - A „MOCK“ notice says email sending is switched off.
  - The other form's line says the same.
  - Nothing in mock mode claims a send or tells the visitor to check their inbox or spam.
- **Outbox:** the dev server logs the outbox location on first use. The function's log only says „delivery mode: MOCK (simulated sends – no email is sent)“.

### Real delivery through Resend: what must be configured (not done; launch blockers)
Server-side environment variables only; none is `VITE_`-prefixed, so they never reach the browser. Template: `.env.example`. `.env*` files are git-ignored.

| Variable | Requirement |
|---|---|
| `EMAIL_DELIVERY_MODE=resend` | Explicit opt-in |
| `EMAIL_DELIVERY_CONFIRM=send-real-emails` | Second, deliberate acknowledgement |
| `RESEND_API_KEY` | A sending-only key from Resend (`re_…`). Production key stored only in the hosting provider's secret store |
| `EMAIL_FROM` | An address on **your own domain verified in Resend** (SPF + DKIM). The `resend.dev` test sender is refused |
| `EMAIL_REPLY_TO` | Optional |
| `EMAIL_OPERATOR_LINE` | The operator identity printed in every email (blocked on the operator decision) |
| `ALLOWED_ORIGINS` | The production origin(s), e.g. `https://vase-domena.cz` |

If any of these is missing while `EMAIL_DELIVERY_MODE=resend`, the endpoint refuses to run (503). It never falls back to mock or pretends to send. In production the mode must be set explicitly.

**Still open before the first real send:**
- the legal review;
- the privacy notice (the forms link to its placeholder in the footer);
- the retention policy: today nothing is stored beyond in-memory hashes, and Resend keeps its own sending logs, which the privacy notice must mention;
- the operator identity;
- sender-domain verification;
- production credentials;
- a shared store for rate limits and the intent store on serverless or multi-instance hosting (see "Limits of the current abuse protection" above);
- a real-inbox test.

---

## 14. ETF data refresh procedure

> ⚠ **Before launch, review and refresh every dated figure.**
> - The current snapshot is from **7–8 Oct 2026** (`_meta.accessed`).
> - The page and the email display exactly what `research/etf-data.json` and the dated copy contain.
> - Nothing checks freshness automatically. A stale TER or dividend window would be shown as if current.

**When:**
- right before public launch (within days);
- then at least after each quarter's distributions (the funds pay in Mar / Jun / Sep / Dec, which shifts the 12-month window);
- whenever an issuer changes a TER;
- whenever the broker fee table used for the default rate changes.

The exact cadence after launch is a product decision.

**1. Fund figures** in `research/etf-data.json`, per core fund, from the issuer page in its `source` field:
- `expense_ratio_pct.value` and `as_of`. Use `null` if the issuer gives no date, as for IVV today.
- `trailing_dividend_yield_pct`:
  - `distributions_per_share_usd`, every distribution with an ex-date in the past 365 days;
  - `nav_usd` and `nav_date`;
  - `window` (`ex-dates YYYY-MM-DD..YYYY-MM-DD`);
  - `status`.
- For **SPY and SPYM** the issuer-published „Fund Distribution Yield“ is used instead (`value`, with `distributions_per_share_usd: null`).
- Re-check that `index`, `exchange`, `distribution` and `inception` are unchanged.
- Keep a `status` / `note` on every value. Never add a value without a source.

**2. Shared figures** in `_meta`:
- `exchange_rate`: `date`, `sequence` and `USD_CZK` from the ČNB `denni_kurz.txt` (URL in the file);
- `accessed`: the date of the re-pull.

**3. Dated facts outside the data file** (manual, easy to miss):
- `src/content/cs.ts`: the XTB fee-table date („sazebníku XTB ze dne 29. 4. 2026“, in the conversion methodology text and in the source label) and the law-version date („znění k 1. 8. 2026“). Re-read the sources.
- `src/domain/calc.ts`: `CONVERSION_RATE.defaultPct` (0.5), which equals the XTB markup. Change it only if the fee table changes, and update the copy with it.
- `research/claims-verification.md` (F2 / F3 tables) and `research/README.md`: record the new figures, dates and any changes.

**4. Tests pinned to the snapshot** (expected to fail after a re-pull; update them deliberately, from the recomputed research F3 table, never by copying the app's output):
- `src/domain/calc.test.ts` and `comparison.test.ts` (F3 reference figures);
- `src/domain/etfData.test.ts` (`accessed`);
- `src/domain/result.test.ts` (TER dates, dividend window);
- `src/email/leadEmail.test.ts` (example figures, dates, ČNB rate).

**5. Verify:**
- `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`.
- In `npm run dev`, check every fund in the card and the comparison, with the dates in the stamp and the methodology.
- Check that the copy derived from the data still holds: the same-index fee-gap sentence, "all funds distribute", and the TER range.
- Send one mock email and read it at `/api/dev/outbox`.
- If a fund's character changed (e.g. it stopped distributing, or changed its index or listing), stop and review the copy and the research before publishing.

**6. Record:** commit with the re-pull date in the message, and update the data warning in section 0.
