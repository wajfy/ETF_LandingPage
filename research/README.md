# Research

Source-backed data and claim checks for the landing page and the project README. Research date: **2026-10-08** (two passes).

**Wireframe phase closed 2026-10-09.** Research F3 is reconciled with the wireframe (same calculation basis and rounding). `etf-data.json` is the intended single source for production (project README §10).

**Decisions so far**
- Lead magnet: **Option 1, "Prověrka ETF" (ETF reality check)**
- ETF set: **VOO, SPY, IVV, SPYM, VTI, VT, SCHD** (AGG dropped)

| File | Contents |
|---|---|
| [etf-selection.md](etf-selection.md) | Approved ETF set, why each is included, exclusions, data confidence notes, issuer links |
| [etf-data.json](etf-data.json) | Fund data in machine-readable form: TER, index, exchange, distributions, trailing dividend yield, ČNB exchange rate; every field has a source and a `verified` / `derived` / `unverified` status |
| [claims-verification.md](claims-verification.md) | PRIIPs/KID, the three cost types (fund fee / conversion / withholding tax), W-8BEN, Czech statute (time test, 100k CZK, foreign dividends), exchange-rate source, worked CZK example; with safe wording and wording to avoid |

## Rules for using this data

1. Publish only values marked **verified**, or **derived** with the method and date shown. Never publish **unverified / unresolved** items.
2. Show an "as of" date next to fees and yields on the page and link to the source.
3. Never merge the fund fee, the conversion cost and the withholding tax into one unlabelled number (claims-verification.md B0).
4. Re-check expense ratios, yields, broker fees and the ČNB rate right before launch.
5. Business model, brand and what happens to collected emails are **not yet defined**. Nothing in this folder assumes them.

## Corrections to the earlier strategy analysis

- **Czech 40M CZK cap** on the time-test exemption: abolished from 2026 for securities; § 4(3) now covers crypto only. Don't mention it.
- **QQQ** was used as an example earlier. It's **Nasdaq-listed**, so outside scope.
- **"Most EU brokers block US ETFs"**: supported by PRIIPs and IBKR's official FAQ, but no official statement from a Czech broker. Use the narrow wording (A1).
- **VTI** now tracks the Morningstar US Total Market Index (older sources say CRSP).
- **"0.5% conversion ≈ 16 years of fees"** holds only for 0.03% funds at zero growth (B4).
- **"0.5% conversion ≈ N years of fees"** is now banned from the page and email: it mixes one-off and recurring costs (B4)
- **SCHD withholding drag** is ≈ 0.48%/yr on the consistent 365-day method, not 0.45% (F2).
- **Czech exemption letters** are § 4(1)(**t**) and (**u**), not w/x as some secondary sources say (D1).

## Open items

- [x] ETF selection approved: SPYM in, AGG dropped
- [x] Time test and 100k CZK checked in the statute (§ 4(1)(t), (u); e-Sbírka, version 1. 8. 2026)
- [x] W-8BEN checked on IRS pages (About Form W-8BEN; Instructions Rev. 10/2021)
- [x] Foreign dividend taxation: law and treaty text verified (§§ 8, 16a, 38f, 38g; treaty Arts. 10, 24)
- [x] Dividend and conversion numbers recomputed; ČNB rate source documented
- [ ] **Unresolved:** whether a US ETF distribution counts as a § 8(1)(a) "podíl na zisku" (profit share). Interpretation; needs tax adviser
- [ ] **Unresolved:** what follows for an individual (extra Czech tax ≈ 0 with W-8BEN; no-filing threshold). Derived; needs tax adviser before any page copy
- [ ] **Unresolved:** which Czech ID brokers expect on W-8BEN line 6a
- [ ] **Unresolved:** that each of the 7 funds is a RIC for treaty purposes (SPY is a UIT)
- [ ] **Unresolved:** the size of XTB's own FX spread on top of the 0.5% markup
- [ ] **Unresolved:** Trading 212 FX fee (official page behind a bot check)
- [ ] **Unresolved:** DIP; whether UCITS funds also suffer US withholding (don't imply otherwise)
- [ ] Cross-check derived ISINs against fact sheets (only if ISINs are shown)
- [ ] Official statements from Czech brokers on US ETF availability (only if we name brokers)
- [ ] Decide who does the compliance / tax review of the final copy
- [x] Fund marketing / offering question researched (claims-verification.md G): Czech ZISIF §§ 294–297, ESMA guidelines, ESMA MAR warning, ZPKT § 2(1)(f). **Not resolved:** whether a neutral comparison counts as *nabízení* (offering) under ZISIF § 294. Needs counsel; launch blocker
- [ ] Re-check AIFMD Art. 4(1)(x) and GDPR Art. 13 in the official EUR-Lex text (EUR-Lex redirected all requests on 2026-10-09)
- [ ] Check whether any of the 7 funds is on a ČNB list (ZISIF § 295a(1)); not checked
- [ ] Collect number of holdings for all 7 funds, or keep that field off the page (only VTI and SCHD so far)
- [x] Launch legal requirements researched (claims-verification.md H): Civil Code § 435, Act 480/2004 § 7, Act 127/2005 § 89(3), ÚOOÚ guidance, Gmail sender rules. Operator identity and email purpose are still **business decisions** (project README section 9)

The product brief built on this research is in the project [README](../README.md).
