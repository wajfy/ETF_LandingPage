# ETF selection

**Status:** APPROVED 2026-10-08: VOO, SPY, IVV, SPYM, VTI, VT, SCHD. AGG dropped (off-topic for the target audience). Data accessed **2026-10-08**.
**Machine-readable data:** [etf-data.json](etf-data.json). Every value there has a source URL and a status (`verified` / `derived` / `unverified`).

## Scope

- **In scope:** US-domiciled ETFs listed on NYSE or NYSE Arca.
- **Observation:** every fund below lists on **NYSE Arca**, not the main NYSE board. The page copy should say "NYSE Arca" or "US exchanges", not just "NYSE".
- **European (UCITS) alternatives:** context only. None were verified in this pass (see the end of this file).

## Approved set: 7 funds (AGG dropped)

| # | Ticker | Fund | What it tracks | Expense ratio | Distributions | Why include it |
|---|---|---|---|---|---|---|
| 1 | **VOO** | Vanguard S&P 500 ETF | S&P 500 Index | 0.03% | Quarterly | The ticker people name when they say "just buy the S&P 500" (assumption: popularity not measured) |
| 2 | **SPY** | State Street SPDR S&P 500 ETF Trust | S&P 500 Index | 0.0945% | Quarterly | Oldest S&P 500 ETF (1993). Same index as VOO but about 3× the fee. Unit investment trust structure |
| 3 | **IVV** | iShares Core S&P 500 ETF | S&P 500 Index | 0.03% | Quarterly | Third big S&P 500 fund. Together with VOO it shows the same index at the same fee from two issuers |
| 4 | **VTI** | Vanguard Morningstar Total Stock Market ETF | Morningstar US Total Market Index | 0.03% | Quarterly | "Whole US market" instead of the 500 largest companies |
| 5 | **VT** | Vanguard Total World Stock ETF | FTSE Global All Cap Index | 0.06% | Quarterly | The whole world in one fund. The most diversified option in the set |
| 6 | **SCHD** | Schwab U.S. Dividend Equity ETF | Dow Jones U.S. Dividend 100 Index | 0.06% | Quarterly | A different strategy (dividend stocks) that finance creators often talk about (assumption) |
| 7 | **SPYM** | State Street SPDR Portfolio S&P 500 ETF | S&P 500 Index | 0.02% | Quarterly | Cheapest S&P 500 fund in the set; makes the point that fee gaps between funds on the same index are tiny. **Ticker was SPLG until 2025-10-31**, so older articles use SPLG |
| ~~8~~ | ~~**AGG**~~ *(dropped)* | iShares Core U.S. Aggregate Bond ETF | Bloomberg US Aggregate Bond Index | 0.03% | Monthly | The only bond fund, a non-stock reference point. Probably off-topic for the target segment |

All 7 funds (and the dropped AGG) are **US-domiciled**, **listed on NYSE Arca**, **distributing** (none reinvests income), and **USD-denominated**.

## Why this set (and what it shows)

1. **Three to four funds track the same index (S&P 500): VOO, SPY, IVV, SPYM.** Their fees range from 0.02% to 0.0945% a year, a gap of at most 0.0745 percentage points. This backs up our earlier critical point: comparing funds on the same index is mostly comparing tiny fee differences.
2. **VOO → VTI → VT is a ladder of diversification:** 500 large US companies → the whole US market → the whole world. This is a real decision a beginner has to make, unlike choosing between VOO and IVV.
3. **SCHD is a different strategy, not a different wrapper.** It shows that "which ETF" is often really "which index or strategy".
4. **All are distributing, so a distribution-policy column wouldn't distinguish them.** The accumulating vs distributing question only arises with European funds. Worth knowing before we design a comparison table.

## Excluded

| Ticker | Reason |
|---|---|
| **QQQ** | **Listed on Nasdaq**, so outside scope, though visitors may ask about it. Expense ratio is 0.18% (issuer site). It converted from a unit investment trust to an open-end ETF on 2025-12-22 (secondary sources: [etf.com](https://www.etf.com/sections/features/invesco-wins-approval-convert-qqq-standard-etf), [nasdaq.com](https://www.nasdaq.com/articles/invesco-shareholders-approve-qqq-reclassification-open-end-etf)). |
| **VXUS, BND** | I believe they are Nasdaq-listed; **not checked**. Not needed for the core set. |

## Data confidence notes

- **Exchange, expense ratio, index, distribution frequency and inception** come straight from issuer pages (links below).
- **ISINs for VOO, IVV, VTI, VT, SCHD and AGG** are *derived*: I computed them from the issuer-published CUSIPs using the standard ISIN check-digit method. Applying the same method to SPY and SPYM reproduces the ISINs State Street publishes, which validates it. Before printing them on the page, cross-check against a fact sheet or prospectus.
- **Domicile = United States.** The issuer pages don't have a "domicile" field. This rests on all funds being US-registered (SEC filings, US ISIN prefix). I'm confident it's right; to quote the exact legal form of each trust, use its Statement of Additional Information.
- **Expense ratio dates differ by issuer.** Vanguard shows the prospectus date; iShares shows no date; State Street and Schwab show the date the page was viewed. Re-check all of them right before launch.
- **VTI's index changed.** Older sources (and my earlier knowledge) say the CRSP US Total Market Index. The issuer now names the Morningstar US Total Market Index. Don't copy index names from third-party sites.

## Sources (official issuer pages)

| Ticker | Source |
|---|---|
| VOO | https://investor.vanguard.com/investment-products/etfs/profile/voo |
| SPY | https://www.ssga.com/us/en/intermediary/etfs/spdr-sp-500-etf-trust-spy |
| IVV | https://www.ishares.com/us/products/239726/ishares-core-sp-500-etf |
| VTI | https://investor.vanguard.com/investment-products/etfs/profile/vti |
| VT | https://investor.vanguard.com/investment-products/etfs/profile/vt |
| SCHD | https://www.schwabassetmanagement.com/products/schd |
| SCHD distributions | https://www.schwabassetmanagement.com/sites/g/files/eyrktu361/files/product_files/SCHD/SCHD_Fund_Distributions.CSV |
| SPYM | https://www.ssga.com/us/en/intermediary/etfs/state-street-spdr-portfolio-sp-500-etf-spym |
| SPLG → SPYM notice | https://www.ssga.com/library-content/products/fund-docs/etfs/us/information-schedules/ap-notice/notice-to-aps-ticker-fund-name-and-benchmark-index-name-changes-10-31-25.pdf |
| AGG | https://www.ishares.com/us/products/239458/ishares-core-total-us-bond-market-etf |

Note: the Vanguard and Schwab pages render with JavaScript. A plain HTTP fetch returns an empty page or HTTP 403. They were read in a real browser.

## European (UCITS) alternatives — context only, NOT verified

These are commonly cited European counterparts. **I have not checked their tickers, ISINs or fees.** Verify them on the issuer's page before any use:

- S&P 500: iShares Core S&P 500 UCITS ETF (CSPX), Vanguard S&P 500 UCITS ETF (VUAA / VUSA)
- Total world: Vanguard FTSE All-World UCITS ETF (VWCE / VWRL)

Don't call them "twins" of the US funds on the page without checking that the index, currency and distribution policy actually match.
