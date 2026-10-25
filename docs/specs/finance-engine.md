# IGUDAR finance engine — fees, returns, scenarios

> Shared with the platform repo (same file), together with `lib/finance/__tests__/test-vectors.json`.
> Source of truth: `IGUDAR_Financial_Model_Gate2_Final_5.xlsx` (Simulator, Fee_Grid, Investor_Returns sheets), 8 Oct 2026. The formulas below were rebuilt independently and reproduce the model's Pessimistic / Base / Optimistic results exactly.

## 1. Why one engine

The landing page simulator, the landing page calculator, the platform's property ROI card, the investment modal and the wallet projections must all show **the same numbers as the financial model**. So there is one pure TypeScript module, `lib/finance/`, with no React and no I/O, copied identically into both repos (same file, same tests). If it changes in one repo, it changes in the other in the same week.

```
lib/finance/
  fee-grid.ts        // the active grid + legal caps + tax constants (single source of truth)
  scenarios.ts       // pessimistic / base / optimistic assumptions
  engine.ts          // simulate(input) → full result
  irr.ts             // Newton-Raphson with bisection fallback
  format.ts          // MAD formatting, percentage formatting, "indicative · not guaranteed" labels
  __tests__/engine.test.ts + test-vectors.json
```

Money is computed in floating point inside the engine, then **rounded to the centime only for display**. Stored amounts elsewhere in the platform stay integer cents.

## 2. The fee grid (v6, final 22 Oct 2026)

| Code | Fee | Paid by | Rate | When |
|---|---|---|---|---|
| S1 | Syndication | Seller / developer, **only if the raise closes** | 3 % of capital raised | Closing |
| D1 | Structuring fee | **Investor, the only fee paid directly** | **1.5 % + 20 % VAT** on the amount invested (450 MAD on 25,000), shown before payment | Subscription |
| D2 | Platform fee (all-in, covers SAS running costs) | SAS, from the rent, before payouts | **0.75 %/yr** of capital raised, HT (0.90 % with non-recoverable VAT) | Quarterly, before payouts |
| D3 | Exit fee | SAS, deductible | 1.5 % of sale price, HT | Asset sale / block sale |
| D4 | Secondary transfer | Selling investor | 1 % of the transfer amount | Each transfer window (every 6 months after year 1) |
| D5 | Performance fee | SAS at exit | 15 % of profit above a **6 %/yr** hurdle | Exit |
| D6 | Dossier fee | Nobody | 0 | None |

S2 (operator structuring) is **removed**. Analytics subscription plans and Family Circle are out of scope until Gate 3 and are not advertised. No agency referral fees. The investor pays only D1 directly; D2/D3/D5 are inside the property company before payouts; D4 only when selling early. Outlay at subscription = ticket + D1 incl. VAT (25,450 on 25,000).

At 25,000 MAD over 5 years: Base 1,122.51 MAD/yr net (4.49 % cash yield), profit +3,796.26 MAD, net IRR 3.0683 %; Pessimistic IRR 1.395 %, profit +1,696.55 MAD (below the 1.82 % bank deposit, shown honestly).

Seller fee (S1) does **not** reduce the investor's return. Failed raise → full refund by the escrow bank. All fees appear in the DIC and the règlement de gestion. Fees are a disclosed service charge; never netted against a promised yield.

Promotions from the Gate 2 pricing document, **off by default, behind config flags** (decided later, and only after the licence):
- Platform fee waived in year 1 for founding investors (projects 1–4).
- 0.5 % instead of 0.75 % on the part of a holding above 100,000 MAD.
- Referral: 300 MAD or a fee credit.
- Priority in allocation order for investors in two or more projects.
No cash bonuses, no price discounts, no return promises.

### Legal and product constants

| Constant | Value |
|---|---|
| Minimum ticket per project | **25,000 MAD** (decided — Entry Ticket Decision, Gate 2) |
| Max per contributor per project | 500,000 MAD (angels exempt, art. 44) |
| Max per contributor, all platforms | 1,000,000 MAD |
| Max raise per project / 12 months | 5,000,000 MAD |
| Holding period / lock-up | 5 years |
| Exit windows | every 6 months, after 1 year of holding |
| Cooling-off | 14 days |
| Acquisition costs (paid by the SAS from the capital) | 6.5 % of price (4 % registration + 1.5 % land registry + 1 % notary) |
| IS (SAS) | 20 %; cotisation minimale 0.25 % of rent, min 3,000 MAD, from year 4 |
| Withholding on dividends / liquidation surplus (resident individual) | 10 % (**flagged in the model: 10 % vs 11.25 % for 2026 to confirm**) |
| TVA on IGUDAR fees | 20 %, not recoverable by the SAS |
| Bank-deposit benchmark | 1.82 %/yr (12-month deposit) |

## 3. Scenarios

| Assumption | Pessimistic | Base | Optimistic |
|---|---|---|---|
| Gross rental yield | 7.31 % | 8.00 % | 8.80 % |
| Rent indexation | 0 % | 0 % | 1 %/yr |
| Vacancy / operator default | 5 % | 0 % | 0 % |
| Rent reserve | 8 % | 5 % | 5 % |
| Property price growth | 0 % | 0.5 %/yr | 1.5 %/yr |
| Seller-side costs at exit | 2 % | 0 % | 0 % |
| Building depreciation for IS | off | off | on (70 % of price × 4 %/yr) |

## 4. The calculation (per SAS, then your share)

```
raise R = 5,000,000         price P = R / (1 + 0.065)        share s = ticket / R
for year t = 1..hold:
  rent_t   = P × yield × (1 + indexation)^(t−1)
  cash_t   = rent_t × (1 − vacancy − reserve) − R × D2 × (1 + TVA)
  dep_t    = useDep ? P × 0.70 × 0.04 : 0
  cm_t     = t > 3 ? max(3000, 0.0025 × rent_t) : 0
  IS_t     = max(0.20 × max(0, cash_t − dep_t), cm_t)
  div_t    = cash_t − IS_t
exit (year = hold):
  sale     = P × (1 + growth)^hold
  costs    = sale × sellerCosts + sale × D3 × (1 + TVA)
  gain     = max(0, sale − costs − (R − Σdep))
  proceeds = sale − costs − 0.20 × gain
  perf     = D5 × (1 + TVA) × max(0, Σdiv + proceeds − R × (1 + hurdle)^hold)
  surplus  = max(0, proceeds − perf − R)
investor:
  upfront  = ticket + (ticket × D1 + dossierFee + onboardingFee) × (1 + TVA)     // all 0 today
  cash flow year 0 = −upfront
  cash flow year t = s × div_t × (1 − WHT)  (+ in the exit year) s × (proceeds − perf − surplus × WHT)
outputs: net IRR, net cash year 1 (and yield on ticket), net exit proceeds, net profit, money multiple,
         bank-deposit profit = ticket × (1.0182^hold − 1), "beats bank deposit?" flag,
         rent bridge (where each 100 MAD of rent goes: reserve/vacancy, IGUDAR fee, IS, withholding, you).
early exit (secondary window in year k ≥ 1): seller pays D4 = 1 % of the traded value (+ registration duty and tax on gain — show as "to confirm with counsel").
```

## 5. Reference results at the 25,000 MAD minimum (5-year hold)

| | Pessimistic | Base | Optimistic |
|---|---|---|---|
| Net cash per year (year 1) | 912.88 MAD | 1,122.51 MAD | 1,369.27 MAD |
| Net cash yield | 3.65 % | 4.49 % | 5.48 % |
| Net IRR (after 6.5 % purchase costs, all fees and taxes) | 1.79 % | 3.47 % | 5.01 % |
| Net profit over 5 years | 2,146.55 MAD | 4,246.26 MAD | 6,198.31 MAD |
| Same money in a 12-month bank deposit, 5 years | 3,423.45 MAD | 3,423.45 MAD | 3,423.45 MAD |
| Beats the bank deposit? | **No** | Yes | Yes |

Where 100 MAD of gross rent goes (Base): 5 reserve · 12 IGUDAR platform fee incl. TVA · 16.6 IS · 6.6 withholding · **59.8 to you**.

Full vectors (5 tickets × 3 scenarios, year-by-year cash flows) are in `test-vectors.json`. Tests must match to 0.01 MAD and 0.0001 on rates.

**Note for the founders:** the Gate 2 PDFs (Pricing, Entry Ticket) quote ~1,150 MAD/yr and ~5,650 MAD profit at 25,000 MAD, and "net return ~4.5 %". The latest model (Final_5) gives 1,122.51 MAD/yr and 4,246.26 MAD. "4.5 %" is the **cash yield**; the IRR is 3.47 %. Show both, labelled, and align the PDFs.

## 6. Display rules (apply everywhere)

- Always say **net**, always **indicative · not guaranteed**, and always name the scenario.
- Show the pessimistic case next to the base case, never only the optimistic one. If a scenario doesn't beat the bank deposit, say so plainly — honesty is the brand.
- Show both "net cash yield" and "net IRR", each with a one-line explainer (IRR includes the 6.5 % purchase costs, so it's lower).
- Never display a bare green "+x %". Use neutral ink for projections; green only for money actually received.
- Ticket inputs: min 25,000, max 500,000 (show "Business angels: no cap — contact us" beyond), step 5,000.
- Every result block has a "How is this calculated?" link to the explanation page/section and the scenario assumptions.
- Every page with numbers carries: "Indicative simulation based on the IGUDAR financial model. Returns are not guaranteed. Not an offer or solicitation; no investment is collected before the AMMC licence (Loi 15-18)."
