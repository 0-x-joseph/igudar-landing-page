# Landing page — simulator, calculator & "how your money moves"

> Uses `lib/finance/` (see `docs/specs/finance-engine.md`) — never re-implement the maths in components.

## Purpose

1. Let visitors understand, in two minutes, what owning a share of a rented Moroccan property really yields **after fees and taxes** — honestly, with the bad case shown.
2. Run the Gate 2 validation: the closed test group (~50 people) states a **non-binding** amount in the simulator. The 25,000 MAD minimum is kept if ≥ 40 % of those ready at 10,000 MAD also commit at 25,000, with an average stated amount ≥ 40,000 MAD. So capture stated interest per ticket level.
3. Stay on the right side of pre-licence rules: education and simulation only, no offer, no money collected.

## Pages and sections

### A. Hero widget (home page, above the fold or right after the hero)

Compact version: ticket input (default **25,000 MAD**) → three numbers for the Base scenario: net cash per year, net profit over 5 years, vs a bank deposit. Link "Open the full simulator →". Message from the Entry Ticket Decision: *"Own real, rented property alongside professionals, from 25,000 MAD."*

### B. `/simulator` — the full simulator

Controls:
- **Amount:** slider + input, 25,000 → 500,000 MAD, step 5,000. Above 500,000: note "Business angels are not capped — talk to us".
- **Scenario:** segmented control Pessimistic / Base / Optimistic, each with a one-line description of its assumptions (yield, vacancy, price growth). Default Base, but the pessimistic result is always visible next to it.
- Holding period fixed at 5 years (explain the lock-up and exit windows rather than offering a slider).

Results:
- Big numbers: **net cash per year**, **net profit over 5 years**, **net IRR**, **money multiple**. Each with a "?" explainer.
- **Bank-deposit comparison** bar (same ticket, 1.82 %/yr, 5 years). If the scenario loses to the deposit, say it: "In this scenario a bank deposit would have earned more."
- **Year-by-year chart:** cumulative cash (year 0 = −ticket, distributions each year, exit in year 5). Neutral colours; received money in zellige green.
- **"Where your rent goes"** — horizontal stacked bar per 100 MAD of rent: reserve · IGUDAR fee · corporate tax · withholding · **you**. This is the most educational element; make it beautiful.
- **"What you pay IGUDAR"** mini-table for the chosen amount: entry 0 MAD · platform fee per year (your share, incl. TVA) · exit fee (your share) · transfer fee only if you sell early.
- Disclaimer block (see finance spec §6).

Capture (optional, below results): "Interested at this amount? Leave your email — non-binding, no money collected." Stores email, amount, scenario viewed, consent timestamp via the existing `app/api/waitlist` route (extend payload; Resend email confirmation). Never pre-check consent.

### C. `/calculator` — fees & ownership calculator (or a tab on /simulator)

For people who want the mechanics:
- Input: amount and project size (default 5,000,000 MAD).
- Output: your ownership % of the property company, number of investors needed to fill the project at the minimum ticket, your share of each fee line (from the grid), and what the seller and operator pay (S1/S2) **that you don't**.
- **Early exit calculator:** "Sell in a window in year N" → transfer fee 1 % of the traded value, plus "registration duty and tax on gain — to confirm with counsel".
- **Caps checker:** 500,000 per project / 1,000,000 across platforms.

### D. Explanation — "How it works" + "How your money moves"

Tell it as the story of the igudar, the Amazigh collective granaries: one strong building shared by many families, each owning its own chamber, a trusted keeper, rules written down and agreed by all. Then the modern version, as a clean diagram (SVG, animated on scroll, reduced-motion safe):

```
You ──transfer──▶ Escrow account at a regulated bank (per project)
                     │ raise reaches its target          │ raise fails / deadline
                     ▼                                     ▼
               Property company (SAS) ── buys ──▶ Property      Full refund to you
                     │ rents it to a professional operator (master-lease)
                     ▼
               Rent ─▶ reserve · taxes · platform fee ─▶ net distribution to your bank account
                     │ exit windows every 6 months (after 1 year) · sale or block sale ~year 5
                     ▼
               Your capital back ± change in property value
```

Plus the fee grid as a clear public table (who pays what, when — finance spec §2), and an FAQ: "Is my return guaranteed?" (No, and here's why that protects you), "Can I get my money out early?", "What happens if the raise fails?", "Why is the IRR lower than the cash yield?".

### E. Wallet preview (explanatory only)

A section showing a static, clearly-labelled **illustration** of the platform wallet (Committed / In escrow / Invested / Received) with the 25,000 MAD Base numbers, to show transparency. Replace `public/images/igudar-investor-dashboard.png` — it shows 1,000 MAD minimums, "+12.6 %" returns, "Deposit / Withdraw / Convert" and a referral reward, all of which contradict the rules. Label any mock-up "Illustration — demo data".

## Design

Igudar design system (light): sand background, white result cards, violet primary, zellige texture behind the hero widget header only, big tabular numbers, calm motion (numbers ease between values on input change, 200 ms; instant under reduced motion). Mobile first: controls stack above results; results sticky summary bar on mobile ("1,122 MAD/yr · 4,246 MAD over 5 yrs").

## Analytics events

`sim_view`, `sim_amount_change{bucket}`, `sim_scenario_change{scenario}`, `sim_explainer_open{topic}`, `calc_view`, `interest_submit{amount_bucket, scenario}`. No PII in events.

## Tests / checks

Engine unit tests pass on the shared vectors · the widget shows 1,122.51 / 4,246.26 for 25,000 Base · slider can't go below 25,000 · pessimistic shows "bank deposit would have earned more" · disclaimer present on every page with numbers · Lighthouse a11y ≥ 95 · 390 px without horizontal scroll.
