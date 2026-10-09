# ETF reality check — product brief

**Status:** Wireframe phase **closed** 2026-10-09. **M1 built locally** (section 10): hero and interactive result card for all 7 funds, shared calculation and formatting, tests. Visual system: section 11. How to run: section 12. Wireframe with the final Czech copy: [wireframe/wireframe.html](wireframe/wireframe.html). No production code written yet.
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
- **Analytics:** provider-agnostic event queue that sends nothing until a tool and consent approach are chosen.
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
The full table is in section 8. In short:
- ⛔ legal review
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
- **Dividend-tax wording** (agreed 2026-10-09). The line is subtitled *„historický příklad“* (historical example). Its note says, in this order:
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

**Funnel to make measurable**

landing → first interaction → result seen → form seen → form started → submitted → email delivered / opened

Every metric should be splittable by UTM source, medium, campaign and content, by landing variant ID, and by device / in-app browser.

| Event | Fires when | Key properties |
|---|---|---|
| `page_view` | Page loads | utm_*, variant_id, referrer, device type, in-app browser flag |
| `first_screen_engaged` | First interaction of any kind | ms since load |
| `etf_select` | User taps an ETF | ticker, previous ticker, selection count |
| `amount_change` | Amount changed | bucket (preset / custom range), not the raw value |
| `rate_change` | Model conversion rate changed (on release) | rate bucket (0 / ≤0.25 / ≤0.5 / ≤1 %) |
| `result_view` | Result card ≥ 50% in viewport for ≥ 1 s | ticker, amount bucket |
| `detail_expand` | User opens an explainer / assumptions | topic (fee, conversion, withholding, KID, Czech tax) |
| `source_click` | User clicks a source link | source domain |
| `compare_view` | Same-index comparison or the 7-ETF overview seen | — |
| `cta_click` | Any email CTA tapped | position (inline / repeat / sticky) |
| `form_view` | Form ≥ 50% in viewport | position |
| `form_start` | Focus on the email field | position |
| `form_error` | Validation or server error | error type (format, network, server) |
| `form_submit` | Submit attempted | position, ticker, amount bucket |
| `lead_success` | Server confirms | position; **no email in the payload** |
| `confirmation_view` | Confirmation state shown | — |
| `scroll_depth` | 25 / 50 / 75 / 100% | — |
| `engaged_time` | Heartbeat or on leave | seconds visible |
| `email_delivered` / `email_open` / `email_click` | Email-service-side, if the chosen service supports it | lead id (pseudonymous) |

**Funnel metrics these enable:**
- share of visitors who interact
- result-view rate
- form-view rate
- form-start rate
- submit and success rate (per visitor and per form view)
- error rate
- time to submit
- which ETFs and topics people open
- which CTA position converts

**Constraints**
- **Prototype:** events go into a provider-agnostic local queue and aren't sent anywhere until the analytics tool and consent approach are chosen (9b, 9c).
- Storing or reading anything on the device that isn't technically necessary needs prior provable consent (§ 89(3) Act 127/2005; research H).
- Either a consent banner where refusing is as easy as accepting, or an analytics setup that stores nothing on the device. Whether a particular "cookieless" tool falls outside § 89(3) is a compliance question.
- No personal data in events.

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

### Blockers

| Area | Minimum requirement | Basis |
|---|---|---|
| **Legal review** ⛔ | A documented answer from a qualified lawyer on: (1) whether the page is *„nabízení investic“* (offering investments) under ZISIF § 294 (G3.2); (2) the MAR investment-recommendation and ZPKT investment-advice boundary for the final copy (G3.3–4). **Our research isn't legal advice and doesn't replace this** | ZISIF §§ 294–297; ESMA 2024 warning; ZPKT § 2(1)(f) |
| Operator identity | Name, registered office, IČO and registry entry (if any), and a contact email, visible on the page and in every email | Civil Code § 435(1); § 7(4)(b) Act 480/2004 |
| Privacy notice | Controller identity and contact, purpose (only delivering the requested comparison), legal basis (to be set by compliance), recipients (hosting, email provider, analytics), retention period, transfers outside the EU (if a provider is outside the EU), rights including complaint to ÚOOÚ. Linked next to the form button | GDPR Art. 13 via ÚOOÚ (full article text to re-check) |
| Email flow | Sends reliably within minutes. Contains exactly what the page promised and nothing promotional. Sender identity clear. Sent from a domain with SPF or DKIM. Failures visible to the user and retryable. One email only; no follow-ups | Act 480/2004 § 7; Gmail sender requirements |
| Email storage | Decided where addresses are stored, who can access them and for how long. Processor terms with the hosting/email provider checked | GDPR (needs compliance check) |
| Analytics consent | No non-essential device storage or reading before consent. Refusing as easy as accepting. Funnel events contain no personal data | § 89(3) Act 127/2005; ÚOOÚ |
| Funnel tracking | The section 6 events work end-to-end, including `lead_success` server-side, and are split by UTM and variant | Assignment requirement |
| Source attribution | Every figure on the page and in the email shows its source and "as of" date. A methods/assumptions section exists. All figures are derived from `etf-data.json` through one shared calculation; no hard-coded or duplicated figures (Implementation 5) | Research rules; assignment ("cite the source") |
| Data refresh | TER, distributions, NAV, the XTB fee and the ČNB rate re-pulled within days of launch; ČNB rate date displayed | Research F |
| Copy guardrails | Promise and card follow section 2 and 3a rules: no total, no ranking between lines, no "N years" line, *daň* not *poplatek*, *může* not *platíte*, neutral default, no buy or broker links, no forecasts | Research B0, B4, G4 |
| Disclaimers | Not investment advice or a recommendation; not tax advice; historical data isn't a forecast; currency note | G4; D3 |
| Mobile QA | Works in Facebook/Instagram in-app browsers; form usable on small screens; first screen shows a result without interaction | Brief section 1 |

### Later (not launch-blocking)

- Email open/click tracking.
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
| Analytics | **Minimal, provider-agnostic** event layer (section 6 events, plus `rate_change`). Events go into a local queue and are **sent nowhere** until a provider and consent approach are chosen. We don't assume consent is unnecessary | The prototype can be clicked through and instrumented without committing to a tool. The wireframe reserves a slot for a consent banner in case one is needed |
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
- **Appears** only after `result_view`, and only once the visitor has scrolled past the three cost lines, so it never overlaps the card while it's being read.
- **Tap** scrolls to the inline form (S3) and focuses the email field (`cta_click` {position: sticky}).
- **Hidden** while S3 or S6 is in the viewport, while an input has focus (keyboard open), and while a consent banner is showing.
- **Doesn't cover content:** one line, at most about 56 px plus the safe-area inset. The page adds equal bottom padding. No overlay, no focus trap.
- **Disappears permanently** after `lead_success`.

**Why this order**
- **1–2 come first** because ad visitors stay only a few seconds. The first screen has to continue the ad's promise and *deliver* it at once. A pre-filled result means value arrives before any typing or scrolling.
- **3 comes right after the result** because that's when the value is most visible. Asking earlier would gate value (against the brief); asking later loses mobile visitors who never scroll.
- **4 and 5 are for visitors who aren't convinced yet.** They can explore other funds and check the reasoning; most of the trust-building sits here. These sections come after the first ask, so they don't push the CTA off the first screens.
- **6 catches people who read the explainers and now see the checklist's value.**
- **7 comes last** because few people read it, but it must exist for every claim on the page.

---

## 10. Production-build handoff

These are implementation-level choices made so the build can start. None of them reopens a product decision.

### Intended architecture
- **Stack** (set 2026-10-09): React 19 + TypeScript + Vite 8, Tailwind CSS 4 (design tokens as CSS variables in the Tailwind `@theme`), Vitest. No UI component library. Self-hosted fonts via Fontsource; nothing loads from a CDN.
  - Local only for now; later deployment target Vercel (free tier).
  - One serverless function later: `POST /api/lead` (not built in M1).
- **Code layout (as built in M1):**
  - `src/domain/etfData.ts`: loads and validates `research/etf-data.json`; core funds only, alphabetical; `defaultTicker` = first.
  - `src/domain/calc.ts`: full-precision calculations, no rounding.
  - `src/domain/format.ts`: display rounding and Czech formatting (the only place rounding happens).
  - `src/domain/result.ts`: a framework-free result model that combines data, calculation, formatting and copy. The page uses it now; the email renderer should use it later.
  - `src/content/cs.ts`: all Czech copy from the wireframe; figures are interpolated, never typed.
  - `src/components/*`: `EtfPicker`, `AmountControl`, `ResultCard`, `Methodology`.
  - `src/App.tsx`: page shell and state.
- **Data, the single source:** `research/etf-data.json` is imported at build time.
  - A build-time check fails the build if required fields are missing (TER, TER date, distributions + NAV or issuer yield, index, inception) or if the data date is missing.
  - No fund figure is typed anywhere else.
- **Shared calculation module** (`src/lib/calc.ts`), pure functions with no rounding:
  - `yieldPct(fund)` = Σ distributions ÷ NAV × 100, or the issuer yield for SPY and SPYM;
  - `lines(fund, amount, rate)` → `{ fee, conversion, tax15, tax30 }` from the full amount;
  - `sameIndexFeeGap(funds)`.
- **Display formatting** (`src/lib/format.ts`):
  - `roundCzk`: 3 significant digits, at least whole CZK, half-up, float noise removed first;
  - `kc()`: "0 Kč", "< 1 Kč" or "≈ … Kč";
  - Czech number formatting;
  - yield to 2 decimals; the model rate trimmed to the decimals the slider uses.
  - **Rounding happens only here.**
- **Copy:** all Czech strings in one module (`src/copy/cs.ts`), taken from the final wireframe. Sources, dates and assumptions are interpolated from the data.
- **Lead endpoint** `/api/lead`:
  - validates the email format and the honeypot;
  - applies a basic rate limit;
  - renders the email from the **same** data, calc and format modules (your check, the 7-fund table, the checklist, the methodology);
  - sends it through an `EmailSender` interface.
  - Until a provider and domain are chosen, only a development adapter exists (logs or uses a local test inbox).
  - Addresses aren't stored beyond the send until a retention period is decided.
  - Returns success or a typed error; the page shows the confirmation only on confirmed success.
- **Analytics:**
  - `track(event, props)` puts section 6 events into an in-memory queue;
  - a provider adapter is a no-op by default and sits behind a consent gate;
  - no personal data in events; no cookies or device storage until the consent approach is decided.
- **Tests:**
  - unit tests (Vitest) for calc and format;
  - end-to-end tests (Playwright) at 360/375/390 px widths, with the lead API mocked for success and failure.

### Implementation priorities
1. **M1, data and calculation core with the first screen** — ✅ built locally 2026-10-09 (no deploy yet):
   - load and validate `etf-data.json`;
   - `calc.ts` + `format.ts` with golden tests;
   - render the hero (S1) and the card (S2) for all 7 funds, with the ETF chips, amount selector and rate slider;
   - deploy a preview.
2. **M2, the rest of the page:** S3–S7, final copy, explainers, overview, methodology, the sticky CTA as specified, accessibility basics, the analytics queue.
3. **M3, lead flow:** `/api/lead`, the email template from shared modules, the development sending adapter, real confirmation / error / "already sent" states, the honeypot and rate limit.
4. **M4, hardening:** performance budget, the real-device QA list, data-refresh procedure (a re-pull checklist that updates `etf-data.json` and its dates).
5. **M5, public launch:** only after every section 8 blocker is closed. These are external: legal review, operator, privacy notice, email provider and domain, analytics and consent.

### Acceptance criteria (prototype build)
- **Figures**
  - Unit tests reproduce the research F3 table exactly for all 7 funds: fee, conversion, 15 %, 30 % at 100 000 Kč and a 0.5 % rate.
  - Rounding cases pass: 94,5 → 95; 155,93 → 156; 999,5 → 1 000; 1 005 → 1 010; 15 593 → 15 600; 0 → "0 Kč"; 0,4 → "< 1 Kč".
- **Independence:** the rate changes only the conversion line; the fund changes only the fee and tax; the amount changes all three (end-to-end test).
- **Single source:** a test or lint check fails if any TER, yield, distribution or NAV value appears in `src/` outside the data import.
- **Inputs**
  - Custom amounts outside 1 000–10 000 000 Kč show an error and keep the last valid figures.
  - Default state: IVV, 100 000 Kč, 0,5 %, with the one-line default rule visible until the first selection.
- **First screen**
  - The bottom of the first cost figure is at ≤ 548 CSS px at 375 px width and ≤ 560 CSS px at 360 px width, in the default state.
  - Wireframe reference: 517 / 535 px.
  - Then confirmed on real devices, including the Instagram/Facebook in-app browsers.
- **Forms**
  - An invalid email shows the error, which clears when the user edits.
  - A filled honeypot never produces a success.
  - The confirmation appears only after the API confirms sending, and an API failure shows the retryable send error.
  - After a success, the other form is replaced by the "already sent" line.
  - "pošlete znovu" (send again) reopens the form with the address kept.
  - The email address never appears in analytics payloads or URLs.
- **Copy guardrails:** no total, no ranking, no "N years" line, *daň* (tax) not *poplatek* (fee) for the withholding line, disclaimers and methodology present, sources and dates rendered from the data.
- **Analytics:** every section 6 event fires with the specified properties into the queue; nothing leaves the browser without a configured provider and consent decision.
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
- Data re-pull right before launch.

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
| Colour: accent / accent-strong / accent-tint | `#2a3bd6` / `#1c299f` / `#e7e9fb` | Selected ticker, slider thumb, links, desktop backdrop block. White on accent ≈ 7:1 |
| Colour: error | `#b3261e` | Invalid input only |
| Type: sans | Schibsted Grotesk (variable) | Headline, UI, figures. Tabular figures **only for whole-number values**: in this face, tabular spacing also widens the decimal comma |
| Type: serif accent | Instrument Serif italic | The second line of the H1 and the methodology heading; nowhere else |
| Type: mono | IBM Plex Mono | Tickers, eyebrows, units (*ročně*, *jednorázově*), fact tags |
| Type scale | display 36 px (clamped down below 390 px; 68 px desktop) · figure 26 px · body 16 · notes 13.5 · labels 11 px mono uppercase | Display tracking −0.035em |
| Spacing | Tailwind 4 px scale; 16 px mobile gutters, 24 tablet, 40 desktop | — |
| Borders | 1 px hairlines; 1 px ink for the ticker strip; 2 px ink left rule for the "no total" note | — |
| Radii | 2 px (tags) · 6 px (controls, info boxes) · 10 px (result panel only) | No pills, no rounded-everything |

**Layout**
- **Mobile:** single column. The first screen holds the eyebrow, the two-line headline, the lead, a 7-cell ticker strip in one row, and the top of the card with the first cost figure.
- **Desktop (≥ 1024 px):** 12 columns. Headline and picker on the left (5 columns); the card on a flat cobalt block on the right (7 columns). Methodology in an editorial 4 + 8 split.
- **Motion:** colour transitions on the ticker cells only.

## 12. Running locally

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # Vitest: data validation, F3 reference figures, rounding, single-source guard
npm run typecheck  # tsc -b (app, tests, config)
npm run build      # type-check + production build to dist/
npm run lint       # oxlint
```
