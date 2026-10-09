# Claims verification

Checks every factual claim that could appear on the landing page, in the ads or in the README. First pass **2026-10-08**; second pass (W-8BEN, Czech statute, foreign dividends, numbers) the same day.

**Status legend**
- ✅ **Verified**: confirmed from a primary source (law, treaty, regulator, tax authority or issuer)
- 🧮 **Derived**: calculated or reasoned from verified sources; the method is stated
- ⚠️ **Verified with nuance**: true only in the narrower wording given; the broad version overstates it
- 🔁 **Corrected**: my earlier analysis was wrong or out of date
- ❓ **Unresolved**: no primary source found, or applying it needs professional judgment; **do not publish as fact**

Not legal or tax advice. Tax and regulatory claims should get a compliance or tax review before launch (who does this is an open question).

---

## A. Buying US ETFs from the EU (PRIIPs / KID)

### A1. "Czech retail investors can't buy US ETFs" ⚠️ Verified with nuance

**What the sources actually say**
- PRIIPs Regulation (EU) No 1286/2014:
  - **Art. 5(1):** the product *manufacturer* must draw up a key information document (KID) before the product is made available to retail investors.
  - **Art. 13(1):** whoever *advises on or sells* the product must give retail investors the KID in good time before they are bound.
- Interactive Brokers, official FAQ "PRIIPs regulation":
  - PRIIPs applies **from 1 January 2018**, and ETFs are PRIIPs.
  - *"As a broker, we are required to block trading in a PRIIP if a KID is not available."* This also covers execution-only online trading.
  - *"…the issuers of U.S. listed ETFs **usually** do not create KIDs. This means that EEA and UK retail clients do not have access to such products."*
  - Alternatives IBKR lists: European-issued ETFs from the same issuers, CFDs, or reclassification as a professional client (KID not required, but less investor protection).

**The nuance (why the broad claim is risky)**
1. **The restriction falls on the broker, not the investor.** Nothing makes it illegal for a person to own a US ETF.
2. The IBKR text says issuers **"usually"** don't create KIDs, not "never".
3. **Professional clients** are outside the KID requirement.
4. **Positions already held:** justETF (2018) says they can be kept or sold. That's secondary and old, and IBKR's FAQ doesn't address it. ❓ Check per broker.
5. **Czech brokers specifically** (XTB, Fio, Trading 212, Portu, etc.): I found no official statement from any of them on US ETFs. The XTB claim comes only from third-party blogs. ❓ Unresolved.

**Safe wording (CZ)**
> „Většina evropských brokerů retailovým klientům nákup ETF registrovaných v USA neumožní. Jejich emitenti obvykle nevydávají dokument KID, který evropská regulace PRIIPs pro prodej drobným investorům vyžaduje.“

**Avoid**
- "je nelegální" (it's illegal)
- "nikdy" (never)
- "žádný broker" (no broker)
- "nesmíte vlastnit" (you may not own)
- naming any specific Czech broker as blocking US ETFs

**Sources**
- PRIIPs Regulation, EUR-Lex: https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32014R1286. I read the original 2014 text. EUR-Lex shows a consolidated version dated 2024-01-09, which I didn't read article by article.
- IBKR FAQ "PRIIPs regulation": https://www.interactivebrokers.com/lib/cstools/faq/#/content/1136192471 (old link ibkrguides.com/kb/article-2993.htm redirects here)
- justETF (secondary, 2018-03-28): https://www.justetf.com/en/news/etf/us-domiciled-etfs.html

### A2. "PRIIPs rules are about to change" ⚠️ In progress, not in force

**Where it stands**
- Council and Parliament reached a provisional political agreement on the **Retail Investment Strategy** on 18 December 2025. It includes amendments to PRIIPs: KID format, a "product at a glance" section, machine-readable KIDs.
- According to secondary coverage, the Parliament's ECON committee approved it in June 2026. The plenary vote and Official Journal publication were **not confirmed** as of the access date.
- Application dates are reported as 18 or 30 months after entry into force; secondary sources disagree.
- **I found nothing suggesting the KID requirement for US ETFs will be dropped.**

**Implication:** none for launch. Don't mention it on the page.

**Sources**
- Council press release, 2025-12-18 (seen via search result summary; full text not read): https://www.consilium.europa.eu/en/press/press-releases/2025/12/18/retail-investment-strategy-council-and-parliament-agree-on-package-to-empower-consumers-while-boosting-markets/
- Secondary: https://www.loyensloeff.com/insights/news--events/news/provisional-agreement-on-the-retail-investment-strategy---what-fund-managers-need-to-know/

### A3. "UCITS funds switched from KIID to PRIIPs KID on 1 January 2023" ❓ Unresolved

The only source found was secondary (an SEB Estonia notice). Don't use it on the page; it isn't needed anyway.

---

## B. Fund fee vs actual investing cost

### B0. The three cost types must never be mixed ✅ Framework (each part sourced below)

The reality-check card must keep these apart. They differ in who charges them, what they're charged on, and how often.

| | **1. Recurring fund fee** | **2. One-off currency conversion** | **3. Dividend withholding tax** |
|---|---|---|---|
| What it is | The fund's expense ratio (TER) | The broker's markup when converting CZK ↔ USD | US tax withheld from each dividend |
| Who takes it | The fund | The broker | US tax authority (via the payer / broker) |
| Charged on | The whole holding, every year | Each converted amount, each time: purchase, sale, and dividends converted to CZK | Gross dividends only, not the holding |
| How often | Continuously (deducted from NAV) | Per transaction. With monthly investing it repeats, but only on new money | Each payout (quarterly for all 7 funds) |
| Typical size | 0.02–0.0945% a year (B3) | e.g. 0.5% per conversion at XTB (B2) | 15% of dividends with W-8BEN; 30% without (C1) |
| Nature | Fee | Fee | **Tax, not a fee.** Can be credited against Czech tax (D3) |
| How to show it | "Kč ročně" (CZK per year) | "Kč při každém nákupu" (CZK per purchase) | "Kč ročně z dividend" (CZK per year, from dividends) |

**Rules for the page**
1. Never add the three into one "annual cost" without labels. A one-off conversion and an annual fee aren't the same unit.
2. Never call the withholding tax a "poplatek" (fee).
3. Never imply that buying a European (UCITS) fund avoids US dividend tax. A UCITS fund holding US stocks also has US tax withheld on dividends at fund level (general knowledge, ❓ not verified in this pass). The withholding comparison is **not** an argument against US ETFs specifically.

### B1. "The expense ratio is not the only cost" ✅ Verified

The SEC investor bulletin on ETFs lists several costs:

| Cost | How you pay it |
|---|---|
| Expense ratio | Charged indirectly through the fund's net asset value (NAV) |
| Brokerage commissions | Per trade |
| Bid-ask spread | Called a "hidden cost" |
| Other broker fees | Platform, inactivity, transfer and similar fees |

**Source:** https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins-24

### B2. Currency conversion ✅ Verified for XTB · ❓ Trading 212

**XTB, official Czech fee table dated 29 April 2026**
Source: https://www.xtb.com/cz/soubory/tabulka-poplatku-a-provizi.pdf (redirects to an XTB CDN file; PDF metadata 2026-04-15)

- **Commission on stocks/ETFs:** 0% up to €100,000 monthly turnover; above that, 0.2% (minimum €10).
- **Conversion fee "0,5%".** Footnote 2: *„Všechny měnové konverze související s obchodováním a korporátní události … podléhají 0,5% přirážce na vrcholu kurzu"* (all trading-related conversions and corporate events carry a 0.5% markup on top of the rate).
- **The formula makes the real cost slightly higher than 0.5%.**
  - Example from the table: a USD instrument bought on an EUR account converts at *"bid EUR/USD − 0.5%×mid"*.
  - So the 0.5% comes **on top of** XTB's own bid/ask rate, not on the mid rate.
  - 🧮 The effective cost is **at least 0.5%**. The extra spread isn't published as a number.
  - Copy should say *"od 0,5 %"* (from 0.5%) or *"přirážka 0,5 %"* (0.5% markup), not *"přesně 0,5 %"* (exactly 0.5%).
- **"Corporate events"** include dividends: a USD dividend credited to a CZK account is also converted with the 0.5% markup. 🧮 That's tiny (e.g. VOO: about 1.04% × 0.5% ≈ 0.005% of the holding a year), so it can go in a footnote.
- **Avoiding conversion:** XTB lets clients hold accounts in CZK, EUR or USD. Conversion is avoided when the account currency matches the instrument's currency. Secondary source (finhacker.cz); the fee table implies it but I didn't find it stated outright.
- **Custody fee:** 0.02% a year, only above €250,000 average portfolio value. Irrelevant for the target audience.

**Inconsistency to handle in copy:** XTB wouldn't sell a US ETF like VOO to a retail client (A1). The 0.5% must be presented as *"typická přirážka za směnu, např. XTB 0,5 % (sazebník 29. 4. 2026)"* (a typical conversion markup, e.g. XTB 0.5%, fee table of 29 April 2026), never as "what VOO costs you at XTB".

**Trading 212:** a 0.15% FX fee is widely reported. The official page (https://www.trading212.com/multi-currency) is behind a bot check and couldn't be read. ❓ Unresolved.

**Caveat:** broker fees change often. XTB's earlier fee tables (2020, January 2025) had different custody terms. Re-check right before launch and show the "as of" date.

### B3. "Fee differences between big S&P 500 ETFs are tiny" ✅ Verified (fees only)

- VOO 0.03%, IVV 0.03%, SPY 0.0945%, SPYM 0.02% (issuer pages, see [etf-selection.md](etf-selection.md)).
- Maximum gap: 0.0745 percentage points a year.
- **Not verified:** differences in tracking or total return between these funds. Don't claim they perform identically.

### B4. 🔁 Correction: "one 0.5% conversion ≈ 16 years of fund fees"

- The "16 years" figure is right **only for funds with a 0.03% fee** (VOO, IVV, VTI) and **only at zero growth**.
- Per fund, 0.5% divided by the TER (🧮):

| Fund | Years |
|---|---|
| SPYM | 25 |
| VOO, IVV, VTI | 16.7 |
| VT, SCHD | 8.3 |
| SPY | 5.3 |

- If the investment grows, the fund fee is charged on a larger balance, so the break-even comes **sooner**. The figures are therefore upper bounds.

**Decision (2026-10-09): don't use this comparison on the page or in the email.**
- It sets a one-off cost against a yearly fee, which breaks rule B0 (different units).
- It suggests conversion matters more than the fund fee. That isn't generally true:
  - the fund fee repeats every year on the whole (growing) holding;
  - conversion happens only when currencies differ, and its rate depends on the broker.
- The arithmetic stays here as research background only.

---

## C. US taxes for a Czech resident

### C1. US dividend withholding: 30% default, 15% under the treaty, claimed with W-8BEN ✅ Verified

**Withholding rate**
- **IRS, Nonresident Aliens page** (reviewed 2026-05-22): US-source FDAP income (fixed or periodic payments such as dividends) is taxed at *"a flat 30 percent (or lower treaty rate)"*.
  https://www.irs.gov/individuals/international-taxpayers/nonresident-aliens
- **IRS Tax Treaty Table 1** (Rev. May 2023): Czech Republic row, dividends, general rate **15%**. Footnote *w*: the rate applies to dividends paid by a regulated investment company (RIC).
  https://www.irs.gov/pub/irs-lbi/tax-treaty-table-1.pdf
- **The treaty itself, Czech official text** (Sdělení č. 32/1994 Sb., e-Sbírka), Art. 10(2)(b):
  - US tax on dividends paid to a Czech resident beneficial owner may not exceed *„15 % hrubé částky dividend ve všech ostatních případech"* (15% of the gross dividend in all other cases).
  - Art. 10(3): sub-paragraph (b) *„se použije v případě dividend vyplácených společností Regulated Investment Company"* (applies to dividends paid by a Regulated Investment Company).
  - https://e-sbirka.gov.cz/sb/1994/32

**W-8BEN, IRS primary sources** (About Form W-8BEN page, reviewed 2026-10-02; Instructions Rev. 10/2021)
- **Who:** a foreign individual who is the beneficial owner of US-source income subject to withholding gives it to the payer *"whether or not you are claiming a reduced rate of, or exemption from, withholding."*
- **Where it goes:** *"Do not send Form W-8BEN to the IRS. Instead, give it to the person who is requesting it from you"* (in practice, the broker).
- **Without it:** *"the withholding agent may have to withhold at the 30% rate."*
- **Treaty claim:** Part II, line 9 = country of tax residence (Czech Republic). Line 10 only for treaty provisions with extra conditions, so not needed for the standard 15% dividend rate (🧮 my reading of the instructions).
- **Foreign tax ID (line 6a):** generally required, i.e. the ID number issued by the country of tax residence.
  - ❓ Unresolved: which Czech number brokers expect here (rodné číslo, the Czech personal ID number, vs DIČ, the tax ID). Don't state it on the page.
- **Validity:** until *"the last day of the third succeeding calendar year"*, unless circumstances change. Then you must tell the payer *"within 30 days"*.
- Sources: https://www.irs.gov/forms-pubs/about-form-w-8-ben · https://www.irs.gov/instructions/iw8ben · form: https://www.irs.gov/pub/irs-pdf/fw8ben.pdf

**Still unresolved**
- ⚠️ That each of the 7 ETFs is a RIC: general knowledge, **not checked fund by fund**. SPY is a unit investment trust; how it's treated under the treaty wasn't checked.

**Safe wording**
> „Z dividend amerických ETF se v USA strhává daň. S formulářem W-8BEN, který vyplníte u brokera, je to pro daňové rezidenty ČR 15 %, bez něj až 30 %.“

### C2. US estate tax exposure for non-US investors ⚠️ Verified for the rule; its application to ETFs is an interpretation

- **IRS, "Some nonresidents with U.S. assets must file estate tax returns"** (reviewed 2026-06-27):
  - A return is required if US-situated assets exceed **$60,000** at death.
  - *"Stock of corporations organized in or under U.S. law"* counts as US-situated.
  - https://www.irs.gov/individuals/international-taxpayers/some-nonresidents-with-us-assets-must-file-estate-tax-returns
- **Interpretation, not verified:** that shares of a US ETF count as US-situated in the same way. SPY, for example, is a unit investment trust, not a corporation.
- **Not verified:** whether a US–Czech estate tax treaty exists. The 1993 treaty (32/1994 Sb.) covers *„daně z příjmů a majetku"* (income and property taxes); whether it covers US estate tax wasn't checked.
- **Recommendation: keep this off the landing page.** It's a fear-based message, it's complex, and getting it slightly wrong is a real liability.

---

## D. Czech taxes

Primary source for this section: **Act No. 586/1992 Coll. on Income Taxes** (zákon o daních z příjmů), informative consolidated text on **e-Sbírka**, version effective **1. 8. 2026** (read 2026-10-08): https://e-sbirka.gov.cz/sb/1992/586

### D1. Time test (3 years) and the 100,000 CZK exemption ✅ Verified in the statute

🔁 **Correction to paragraph letters:** the exemptions are in **§ 4 odst. 1 písm. t) and u)**. Some secondary sources cite w) and x); in the current text those letters cover other things.

**§ 4(1)(t): value test (100,000 CZK)**
> „příjmy z úplatného převodu cenných papírů, pokud jejich úhrn u poplatníka nepřesáhne ve zdaňovacím období částku 100 000 Kč"

- The test is on the **sum of sale proceeds** (*úhrn příjmů*) in the calendar year, **not profit**.
- Exclusions: it doesn't cover income from capital assets, or securities that are or were in business assets (until 3 years after the business activity ends).

**§ 4(1)(u): time test (3 years)**
> „příjem z úplatného převodu cenného papíru, přesáhne-li doba mezi nabytím a úplatným převodem tohoto cenného papíru při jeho úplatném převodu dobu 3 let"

- The wording is per security (*„tohoto cenného papíru"*, "of this security"). 🧮 So each purchase has its own 3-year clock. My reading, consistent with secondary sources.
- Same business-asset exclusion as above.
- It doesn't apply to securities acquired through a qualified employee option (§ 6a).

**§ 4(3): the 40M CZK cap now applies only to crypto-assets** (exempt under § 4(1)(zk)). This matches the Financial Administration press release of 2026-01-05: https://financnisprava.gov.cz/cs/financni-sprava/media-a-verejnost/tiskove-zpravy-gfr/tiskove-zpravy-2026/danove-novinky-pro-rok-2026

**Safe wording**
> „Zisk z prodeje ETF je v ČR osvobozen od daně, pokud jste ho drželi déle než 3 roky, nebo pokud vaše celkové příjmy z prodeje cenných papírů za rok nepřesáhnou 100 000 Kč (počítá se celková prodejní cena, ne zisk).“

### D2. 🔁 Correction to my earlier analysis

My earlier analysis mentioned a 40M CZK cap on the time-test exemption. For securities it applied only in 2025 and was **abolished from 2026** (statute § 4(3) now covers crypto only). **Don't mention the cap.**

### D3. Czech tax on dividends from US ETFs ⚠️ Rules verified in law; how they apply to an individual is ❓ unresolved

**What the law says (verified)**

1. **Type of income.** § 8(1)(a): taxable capital income includes
   > „podíly na zisku obchodní korporace nebo podílového fondu, je-li v něm podíl představován cenným papírem"
   (profit shares of a business corporation or a fund whose shares are securities).
   - ❓ That a distribution from a US ETF (a Delaware statutory trust or UIT taxed as a RIC) falls under (a) is an **interpretation**. It's commonly assumed and consistent with treaty Art. 10(3), but I found no Financial Administration guidance confirming it.
2. **Foreign source = part of the tax return.** § 8(4): foreign-source income under (a)–(d) is part of the tax base, *„nesnížené o výdaje"* (not reduced by expenses).
3. **Optional flat 15% separate base.**
   - § 8(8): such foreign income *„lze zahrnout do samostatného základu daně zdaňovaného sazbou daně podle § 16a"* (may be put in a separate tax base taxed at the § 16a rate).
   - If the taxpayer does this, **all** such foreign income must go into it.
   - § 16a(1): *„Sazba daně pro samostatný základ daně činí 15 %."* (The rate for the separate tax base is 15%.)
   - If the separate base isn't used, the income joins the general base (§ 16 rates; ❓ § 16 text not re-read in this pass).
4. **Credit for US tax.**
   - § 38f(1): double taxation is removed according to the treaty.
   - Treaty Art. 24(2) (32/1994 Sb.): the Czech Republic allows a reduction of Czech tax by the US tax paid, **capped at the part of Czech tax attributable to that income** (ordinary credit, *prostý zápočet*). § 38f(2) describes the same cap.
5. **Proof of US tax.** § 38f(5): normally a confirmation from the foreign tax authority. *„V odůvodněných případech"* (in justified cases), a confirmation from the payer or depositary that tax was withheld.
6. **Filing thresholds** (§ 38g):
   - Generally a return is required if taxable annual income exceeds **50,000 CZK** (§ 38g(1)).
   - An employee whose employers handle their tax is not required to file if their other income under §§ 7–10 is **no more than 20,000 CZK** (§ 38g(2)). Dividends are § 8 income.
7. **Converting USD to CZK for tax** (§ 38(1)(b), § 38(5), § 38(7)): an individual who doesn't keep accounts uses either the ČNB rate (*kurz devizového trhu*) for the day of the income, or the "unified rate" (*jednotný kurz*, an average of month-end ČNB rates). Not both in one year.

**What follows from it (🧮 derived, needs tax adviser confirmation)**
- **With W-8BEN** (15% US), using the 15% separate base:
  - Czech tax = 15% of the gross dividend.
  - Credit = US tax paid (15%), capped at that Czech tax.
  - **So the extra Czech tax is about zero**, apart from rounding and exchange-rate effects.
- **Without W-8BEN** (30% US):
  - The credit is capped at the 15% Czech tax.
  - **So the extra 15% can't be recovered in the Czech return.** Whether it can be reclaimed from the IRS wasn't researched.
- **An employee with small dividends** (≤ 20,000 CZK of other §§ 7–10 income) may not be required to file at all. In that case the US 15% would be the only tax. Whether that's the correct result for a given person is ❓ a question for a tax adviser. **Don't put it on the page.**

**Safe wording**
> „Dividendy ze zahraničí podléhají i české dani. Daň zaplacenou v USA si lze podle smlouvy o zamezení dvojího zdanění započíst. Jak to platí ve vaší situaci, ověřte s daňovým poradcem.“

**Avoid**
- "z dividend už v ČR nic neplatíte" (you pay nothing more in CZ on dividends)
- "nemusíte podávat přiznání" (you don't have to file)
- any per-person conclusion

**Sources**
- Act 586/1992 Coll., §§ 4, 8, 16a, 38, 38f, 38g: https://e-sbirka.gov.cz/sb/1992/586
- US–CZ treaty, Arts. 10 and 24: https://e-sbirka.gov.cz/sb/1994/32
- Not used as authority (secondary, consistent with the above): https://www.dauc.cz/clanky/13545/drzba-zahranicnich-akcii-fyzickou-osobou-jak-zdanit-vyplacenou-dividendu

### D4. Long-term investment product (DIP) ❓ Unresolved

Mentioned in my earlier analysis, not checked. Leave it out until it's verified.

---

## E. Listing venue

### E1. "NYSE-traded" ⚠️ Nuance

All 7 selected funds list on **NYSE Arca**, a separate NYSE Group exchange, not the main NYSE board (issuer pages). QQQ, one of the best-known ETFs, is on **Nasdaq** and is out of scope.

**Page copy:** say "NYSE Arca" when precise, or "ETF obchodované v USA" (US-traded ETFs). Don't say "NYSE" alone in a data table.

---

## F. Numbers for the reality-check card

### F1. Exchange-rate source ✅ Verified

**Czech National Bank (ČNB) foreign exchange market rate (*kurz devizového trhu*)**, the rate the income tax act itself points to (§ 38(5)).

- Daily file: https://www.cnb.cz/cs/financni-trhy/devizovy-trh/kurzy-devizoveho-trhu/kurzy-devizoveho-trhu/denni_kurz.txt
- Value used: **08.10.2026 #194: 1 USD = 21,811 CZK; 1 EUR = 24,400 CZK**
- **Where it's needed:** only to show USD amounts in CZK (e.g. share price) and for tax conversion. 🧮 The card's cost lines are percentages of a CZK amount, so they **don't depend on the exchange rate**.
- **Copy must not imply** that a broker converts at the ČNB rate. Brokers use their own rate plus a markup (B2).

### F2. Dividend yield used for the withholding line 🧮 Recomputed

- **Method:** the issuer definition State Street publishes: *"sum of the distributions within the past 365 days divided by Net Asset Value per share"*.
  - Applied to issuer-published distribution history and NAV for Vanguard, iShares and Schwab.
  - For SPY and SPYM, the State Street figure is used as published.
- **Reference date:** NAV 2026-10-07; distributions with ex-date 2025-10-08 to 2026-10-07.
- **These are past payouts, not a forecast.**
- **The Yield column is rounded for display only.** Calculations use the unrounded value (distributions ÷ NAV, e.g. VOO 7.4282 ÷ 714.56 = 1.03955%). The withholding % column is derived and shown rounded.

| ETF | TER | Distributions, last 365 days (per share) | NAV | Yield | Withholding at 15% (% of holding / year) | Withholding vs TER |
|---|---|---|---|---|---|---|
| VOO | 0.03% | $7.4282 (4 payments) | $714.56 | 1.04% | 0.156% | 5.2× |
| SPY | 0.0945% | issuer-published | $777.39 | 0.98% | 0.147% | 1.6× |
| IVV | 0.03% | $8.3954 (4) | $780.82 | 1.08% | 0.161% | 5.4× |
| SPYM | 0.02% | issuer-published | — | 1.00% | 0.150% | 7.5× |
| VTI | 0.03% | $3.9482 (4) | $381.13 | 1.04% | 0.155% | 5.2× |
| VT | 0.06% | $2.4135 (4) | $159.51 | 1.51% | 0.227% | 3.8× |
| SCHD | 0.06% | $1.0541 (4) | $32.64 | 3.23% | 0.484% | 8.1× |

**Cross-checks**
- iShares publishes IVV "12m Trailing Yield" 1.06% as of 2026-08-31. That's a different date and a slightly different definition, but consistent.
- Schwab publishes SCHD "Distribution Yield (TTM)" 3.00% as of 2026-08-31.
- 🔁 My previous answer used the 3.00% August figure for SCHD (≈ 0.45%). The 365-day recomputation as of 7 Oct gives **3.23% (≈ 0.48%)**. Use one method for all funds and show its date.

**Sources**
- Vanguard distribution tables on each fund page (VOO, VTI, VT)
- iShares IVV distributions table: https://www.ishares.com/us/products/239726/ishares-core-sp-500-etf
- Schwab SCHD distributions CSV: https://www.schwabassetmanagement.com/sites/g/files/eyrktu361/files/product_files/SCHD/SCHD_Fund_Distributions.CSV
- State Street SPY / SPYM pages (Fund Distribution Yield)

### F3. Worked example (🧮 derived) — 100,000 CZK, held 1 year

**Calculation basis** (reconciled with the wireframe on 2026-10-09; same rules wherever figures are meant to be comparable)
1. A one-off investment of 100,000 CZK from a CZK account into a USD-listed fund.
2. **Each line is calculated independently from the full amount entered:**
   - fund fee = amount × TER;
   - conversion = amount × model rate;
   - withholding = amount × yield × 15% (or 30%).
   - The fee and the withholding are *not* reduced by the conversion cost. This is a deliberate simplification so the conversion rate affects only its own line.
3. Model conversion rate 0.5%, the XTB markup (fee table 29 April 2026). The real cost may be higher because the markup is added to the broker's own exchange rate (B2).
4. Price and exchange rate unchanged for 1 year. No growth, no currency risk modelled.
5. **Yield = unrounded historical value** (sum of the past 365 days' distributions ÷ NAV, F2). SPY and SPYM use the issuer-published 2-decimal figure. It's a past figure, not a forecast. Displayed to 2 decimals.
6. W-8BEN on file → 15% withholding; a 30% column for comparison. The 15% treaty rate for these funds assumes each is treated as a RIC under the treaty: **not verified per fund** (C1).
7. **Rounding (same rule as the UI):** 3 significant digits, never finer than whole CZK, ties rounded half-up. Examples: 155.93 → 156; 94.50 → 95; 15,593 → 15,600.
8. Czech income tax and Czech tax credits are **not** modelled (D3).

| ETF | 1. Fund fee (recurring, per year) | 2. Conversion (one-off, at purchase) | 3. Withholding 15% (per year, from dividends) | Withholding without W-8BEN (30%) |
|---|---|---|---|---|
| IVV | ≈ 30 Kč | ≈ 500 Kč | ≈ 161 Kč | ≈ 323 Kč |
| SCHD | ≈ 60 Kč | ≈ 500 Kč | ≈ 484 Kč | ≈ 969 Kč |
| SPY | ≈ 95 Kč | ≈ 500 Kč | ≈ 147 Kč | ≈ 294 Kč |
| SPYM | ≈ 20 Kč | ≈ 500 Kč | ≈ 150 Kč | ≈ 300 Kč |
| VOO | ≈ 30 Kč | ≈ 500 Kč | ≈ 156 Kč | ≈ 312 Kč |
| VT | ≈ 60 Kč | ≈ 500 Kč | ≈ 227 Kč | ≈ 454 Kč |
| VTI | ≈ 30 Kč | ≈ 500 Kč | ≈ 155 Kč | ≈ 311 Kč |

- These match the wireframe card and the email table at 100,000 CZK and a 0.5% rate (checked in the browser on 2026-10-09).
- Earlier versions of this table used 99,500 CZK (after conversion), yields rounded to 2 decimals and plain whole-CZK rounding. They are superseded.
- **Recalculating from the displayed yield isn't guaranteed to reproduce the shown tax.** The calculation uses the unrounded yield. Checked across all 7 funds at 1,000–10,000,000 CZK: the gap isn't bounded by 1 CZK or by one rounding step (e.g. IVV at 6,350,000 CZK: shown 10,200, recalculated from 1.08% → 10,300). So the page says only "přibližně" (approximately).
- Selling and converting back to CZK would add another conversion on the sale amount (one-off).
- With monthly investing, the conversion applies to each contribution, not to the whole balance.

**Example price in CZK:** 1 share of VOO = $714.34 (market price 2026-10-07) × 21.811 ≈ **15,580 Kč** (ČNB 08.10.2026).

---

## G. Fund marketing, investment recommendations and advice (checked 2026-10-09)

**Question:** could an educational comparison of US-domiciled ETFs count as marketing or offering of non-EU funds, or as an investment recommendation or advice?

**Bottom line:** the sources **neither permit nor prohibit** the concept outright. Two questions remain open:
1. Does a neutral comparison count as *„nabízení investic“* (offering investments) under ZISIF?
2. Does the page contain an investment recommendation?

Both need a lawyer's view before launch.

### G1. Confirmed rules (primary sources)

**Czech Act No. 240/2013 Coll. (ZISIF)**, e-Sbírka consolidated text effective 1. 9. 2026: https://e-sbirka.gov.cz/sb/2013/240

| Rule | Text (short quote) |
|---|---|
| **§ 97**: "foreign investment fund" (*zahraniční investiční fond*) | A foreign legal entity *„srovnatelná s investičním fondem“* (comparable to an investment fund), or an arrangement under foreign law comparable to a unit trust or trust fund |
| **§ 294(1)**: what offering investments in a foreign fund is | *„nabízení podílových listů nebo srovnatelných cenných papírů … vydávaných … zahraničním investičním fondem“* (offering its units or comparable securities). The provision describes **what** is offered; it doesn't say **who** offers |
| **§ 295**: own initiative | Not offering if the investor decides to acquire *„z vlastního podnětu“* (on their own initiative) |
| **§ 295a(1)**: public offering | Public offering in CZ only under the Act's conditions *„a jen tehdy, je-li tento fond zapsán v příslušném seznamu vedeném Českou národní bankou“* (and only if the fund is on the relevant ČNB list) |
| **§ 295a(2)**: private placement | Private placement to non-qualified investors only if the fund could be offered publicly, or to **≤ 20** persons |
| **§ 296**: qualified-investor funds | Public offering of qualified-investor funds or comparable foreign funds: only qualified investors may invest, and this must be stated explicitly |
| **§ 297(1)–(2)**: retail offering of foreign "special-fund-comparable" funds | Allowed only if the manager holds an EU/ČNB AIFM authorisation **and** ČNB has decided the fund is comparable. Otherwise § 296 applies (qualified investors only) |

**ČNB guidance on offering AIFs in CZ**
- Marketing materials aren't pre-approved by ČNB, but must meet ZISIF §§ 243–244.
- The page covers EU-managed AIFs only, **not funds from outside the EU**.
- https://www.cnb.cz/cs/dohled-financni-trh/legislativni-zakladna/preshranicni-distribuce-fondu/vnitrostatni-pozadavky-tykajici-se-nabizeni-aif-fondu-v-cr/
- ČNB position RS2017-01 (13. 3. 2017) covers the procedure for EU AIFs. It **doesn't define** what is or isn't "offering": https://www.cnb.cz/cs/dohled-financni-trh/legislativni-zakladna/stanoviska-k-regulaci-financniho-trhu/RS2017-01

**ESMA Guidelines on marketing communications** (ESMA34-45-1272, apply from 2 Feb 2022)
- They apply to *"UCITS management companies … Alternative Investment Fund Managers, EuVECA managers and EuSEF managers"*.
- Third-party material is in scope only when it is *"used by a UCITS management company, an AIFM … for marketing purposes"*.
- https://www.esma.europa.eu/sites/default/files/library/esma34-45-1272_guidelines_on_marketing_communications.pdf

**ESMA warning on social media and investment recommendations** (6 Feb 2024)
- MAR has *"a very broad definition of Investment Recommendation"*: any public communication giving *"advice or ideas, directly or indirectly, about buying or selling a financial instrument or on how to compose a portfolio"* may qualify.
- *"a case-by-case assessment is always necessary"*.
- For educational content *"it is best to use historical data and past examples"*, and to avoid recommending a strategy or valuing a present or future price.
- https://www.esma.europa.eu/sites/default/files/2024-02/ESMA74-1103241886-912_Warnings_on_Social_Media_and_Investment_Recommendations.pdf

**ZPKT (Act No. 256/2004 Coll.) § 2(1)(f)**
- Investment advice (*investiční poradenství*) = *„poskytnutí individualizovaného doporučení zákazníkovi ohledně obchodu s konkrétním investičním nástrojem“* (giving a client an individualised recommendation about a transaction in a specific instrument).
- https://e-sbirka.gov.cz/sb/2004/256

**ČNB on finfluencers** (board member interviews on cnb.cz)
- ČNB monitors possible unauthorised investment advice and breaches of the investment-recommendation rules.
- https://www.cnb.cz/cs/verejnost/servis-pro-media/autorske-clanky-rozhovory-s-predstaviteli-cnb/Jan-Prochazka-Finfluencery-sledujeme-ispomociAI/

**PRIIPs Art. 13** binds those who *advise on or sell* a PRIIP (A1).

### G2. Not retrieved from a primary source ❓

- **AIFMD Art. 4(1)(x)**, the EU definition of "marketing". Secondary sources describe it as an offering or placement *at the initiative of, or on behalf of,* the fund manager, to investors in the EU. EUR-Lex redirected every request on 2026-10-09, so **re-check the official text**.
  - Secondary: https://www.osborneclarke.com/wp-content/uploads/2020/11/Fund-Marketing-November-2020.pdf
- **Whether US ETFs are "AIFs" / "foreign investment funds" under § 97 ZISIF.** Probable, because they're collective investment funds that aren't UCITS, but it's an interpretation.
- **Whether any of the 7 funds is on a ČNB list** under § 295a(1). Not checked.
- **justETF's claim** that US ETFs "must not be marketed in the EU" is secondary (2018).

### G3. Interpretations (for counsel to confirm, not conclusions)

1. **EU marketing regime.**
   - If the AIFMD definition is as secondary sources describe, and the ESMA guidelines address managers, a page run by an operator who is **not** the fund manager and **not acting on its behalf** is probably outside the EU fund-marketing rules.
   - Any payment or arrangement with issuers or brokers could change that ("on behalf of", "indirect" offering).
2. **Czech "offering" (§ 294).**
   - The Czech definition isn't limited to managers. No source found says whether a neutral comparison with no buy path counts as *nabízení* (offering).
   - If it did, the § 295a(1) list requirement and the retail limits in §§ 296–297 would be a serious problem. **This is the main open legal question.**
3. **Investment recommendation (MAR).**
   - The page shows factual and historical data for seven funds without ranking them. That is closer to the "educational, historical data" practice ESMA describes.
   - These would push it towards a recommendation:
     - a highlighted "best/cheapest" fund
     - a default framed as preferred
     - opinions on future prices
     - portfolio suggestions
4. **Investment advice (ZPKT).** The amount input changes the arithmetic, not the choice of fund. Without an individualised recommendation it probably isn't investment advice.

### G4. Guardrails that reduce risk under any reading (design rules, not legal conclusions)

- No buy buttons, no broker or affiliate links, no step-by-step instructions for acquiring a specific fund.
- Same fields for all 7 funds. No ranking, no "best for…", no badges.
- The default fund is labelled *příklad* (example).
- Historical data only, dated. No price or return forecasts.
- A clear statement that the page doesn't offer investments and isn't a recommendation. The page must still *be* neutral; per ESMA a disclaimer alone doesn't make content neutral.
- The KID restriction is shown prominently, which works against any impression of an offer.
- Any relationship with issuers or brokers is either avoided or disclosed (business decision).

**Voluntary best practice from ESMA34-45-1272** (binding on managers, not on us; still a useful standard)
- **para 33:** compare funds with a similar policy, or explain the differences. Index labels must be visible in the overview.
- **para 41:** explain the overall effect of costs.
- **para 42:** where costs are in a foreign currency, state the currency and warn that costs *"may increase or decrease as a result of currency and exchange rate fluctuations"*.

---

## H. Launch-relevant legal requirements (checked 2026-10-09)

| Topic | Confirmed rule | Source |
|---|---|---|
| Operator identity | § 435(1) Civil Code: every business must state *„své jméno a sídlo“* (name and registered office) in information made publicly available online, plus its registry entry and ID number (IČO) if assigned | https://e-sbirka.gov.cz/sb/2012/89 |
| Marketing emails | § 7(2) Act 480/2004: commercial communications by email only to users *„kteří k tomu dali předchozí souhlas“* (who gave prior consent). § 7(4): forbidden unless clearly marked as commercial, sender identity not hidden, valid opt-out address included | https://e-sbirka.gov.cz/sb/2004/480 |
| Cookies / device storage | § 89(3) Act 127/2005: storing or reading data on a user's device requires *„předem prokazatelný souhlas“* (prior provable consent), except where technically necessary or necessary for a service the user explicitly requested | https://e-sbirka.gov.cz/sb/2005/127 |
| Cookie consent practice | ÚOOÚ: opt-in since 1 Jan 2022. Analytical cookies need consent; staying on the site isn't consent; refusing must be as easy as accepting | https://uoou.gov.cz/novinky/nezarazene/cookies-od-zacatku-roku-2022-pouze-se-souhlasem |
| Privacy notice | GDPR Art. 13 (per ÚOOÚ): identity and contact of the controller, purpose and legal basis, recipients, whether giving data is required, data-subject rights including objection to direct marketing. ❓ Full Art. 13 list not re-read in the primary text (EUR-Lex unavailable) | https://uoou.gov.cz/profesional/metodiky-a-doporuceni-pro-spravce/metodika-k-plneni-informacni-povinnosti-a-k-souvisejicim-ujednanim-vuci-zakaznikum |
| Email deliverability | Gmail, all senders: *"Set up SPF or DKIM"*, valid forward/reverse DNS, TLS, spam rate < 0.3%. At 5,000+/day: SPF **and** DKIM, DMARC, one-click unsubscribe for marketing | https://support.google.com/a/answer/81126 |

❓ **Unresolved:** whether the email that delivers the requested comparison counts as a *„obchodní sdělení“* (commercial communication) under Act 480/2004. It probably doesn't if it contains only what was requested, but that's an interpretation. If it promotes anything, treat it as one.

---

## Summary: what the page can and cannot say

| Claim | Can we say it? |
|---|---|
| TER, index, exchange, distribution frequency of the 7 funds | ✅ Yes, with "as of" date and issuer link |
| EU retail investors usually can't buy US ETFs through EU brokers because of missing KIDs | ✅ Yes, in the narrow wording (A1) |
| A specific Czech broker blocks US ETFs | ❌ No official broker source |
| The three cost types, shown separately (fee / one-off conversion / withholding tax) | ✅ Yes, per B0 |
| Conversion markup "od 0,5 %" with XTB as the cited example | ✅ Yes, with date; don't tie it to VOO at XTB |
| "One conversion ≈ N years of fund fees" | ❌ Don't use: mixes one-off and recurring costs (B4) |
| 15% US withholding with W-8BEN, up to 30% without; the form goes to the broker | ✅ Yes (C1) |
| Which Czech ID number goes on W-8BEN line 6a | ❌ Unresolved |
| US estate tax | ❌ Keep off the page |
| Time test > 3 years; 100k CZK yearly limit on sale proceeds; no 40M cap for securities from 2026 | ✅ Yes, cite § 4(1)(t), (u) |
| Foreign dividends are taxable in CZ; US tax can be credited under the treaty | ✅ Yes, in the general wording (D3) |
| "No extra Czech tax on dividends" / "no need to file" | ❌ Derived only; needs tax adviser |
| Dividend yields and CZK figures | 🧮 Yes, as past data with method, date and assumptions (F2, F3) |
| DIP | ❌ Unresolved |
| UCITS funds avoid US dividend tax | ❌ Don't imply it; not verified |
| "This page doesn't offer investments / isn't a recommendation" | ✅ Say it, **and** keep the content neutral (G4); a disclaimer alone isn't enough |
| "The page is legally permitted / not fund marketing" | ❌ Not established (G3): needs counsel |
| Buy links, broker links, "best" fund, rankings | ❌ Out (G4) |
