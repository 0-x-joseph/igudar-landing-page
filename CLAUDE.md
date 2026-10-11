# IGUDAR Landing Page — CLAUDE.md

> Repo: github.com/0-x-joseph/igudar-landing-page (co-managed — every change goes through a PR).

## What this is

Marketing site for IGUDAR, a Moroccan fractional real-estate crowdfunding platform preparing its AMMC licence. Pages today: `/` (hero, pain points, backed-by, how it works, features, stats, final CTA), `/pricing`, `/faq`, `app/api/waitlist` (Resend). "Access MVP" links to `https://app.igudar.tech/auth/login`.

To build: `/simulator` (investment simulator), `/calculator` (fees & ownership), a "How your money moves" explanation, and a wallet illustration — spec `docs/specs/landing-simulator.md`.

Read before any work: `docs/design/IGUDAR_DESIGN.md` (shared design system with the platform — one brand) and `docs/specs/finance-engine.md` (all numbers).

The name: the *igudar* are the Amazigh collective granaries — one shared, guarded building, each family owning its chamber. Always call the brand and the design "IGUDAR", never by a city name.

## Stack

Next.js 16 · React 19 · Tailwind CSS **v4** (`@theme` in `app/globals.css`) · HeroUI · framer-motion / motion · GSAP · Lenis · lucide-react · Resend.
The platform is on Tailwind v3 — express the same tokens here as hex in `@theme`, same names.

## Commands

`npm run dev` · `npm run build` · `npm run lint`. Add Vitest for `lib/finance/` (engine tests are mandatory). Verify UI with Playwright screenshots (390 / 768 / 1280 / 1600 px) and Lighthouse (accessibility ≥ 95).

## Working rules

- Git: follow `CONTRIBUTING.md` and the Git rules section below — brand-new `claude/*` branch per task, draft PR, never touch `master`.
- **All numbers come from `lib/finance/`** — the same files as the platform repo, tested against `test-vectors.json` from the financial model. Never hard-code a yield, fee or minimum in a component.
- Light theme only for now (IGUDAR light tokens: sand `#F7F5EF`, white cards, violet `#5D18E9`, ink `#17131F`).
- Motifs only via `components/brand/` (same primitives as the platform).
- Inline SVG motifs, no image files. `prefers-reduced-motion` respected. Don't add another animation library — propose consolidating the four already installed.
- 390 px with no horizontal scroll on every section.

## Git rules — read `CONTRIBUTING.md` first (mandatory)

- **Every task = a brand-new branch** `claude/<yyyymmdd>-<area>-<short>`, created from the latest `origin/master` after `git fetch origin`. Check it doesn't exist yet (`git ls-remote --heads origin <name>` prints nothing).
- **Never** commit to, push to, rebase, merge into, or delete `master`, `main`, or any existing branch (yours or the co-founder's: `feat/*`, `chore/*`, `ilyas`, …).
- Push only your `claude/*` branch, by name: `git push -u origin claude/<...>`. No force-push, no `--no-verify`, no branch deletion, no `reset --hard` / `clean` / `checkout -- .`.
- Open a **draft PR** against `master`; a founder reviews and merges. You never merge.
- Real uncommitted changes in the working tree (not just CRLF noise — check `git diff --ignore-cr-at-eol --stat`) → stop and ask.
- These rules are enforced by `.claude/settings.json` and a local `pre-push` hook. If a push is blocked, don't look for a way around it — tell me.

## Fees & numbers to use (from the latest model)

Minimum ticket **25,000 MAD** (decided). No entry fee · 0.75 %/yr platform fee (via the property company, covers its running costs) · 1.5 % exit fee · 1.5 % transfer fee only if selling early · 15 % performance fee above 6 %/yr · sellers pay 3.5 % and operators 1.5 % — not the investor.
At 25,000 MAD, 5 years, Base: ~1,120 MAD/yr net (4.5 % cash yield), net IRR ~3.5 %, ~4,250 MAD profit; bank deposit ~3,420 MAD. Pessimistic loses to the deposit — show it.
Headline message (Entry Ticket Decision): *"Own real, rented property alongside professionals, from 25,000 MAD."*

## Copy & compliance — current site needs fixing

Fix visuals freely. For copy, list each change in the PR (before → after) and get founder approval of the wording:

| Current copy (where) | Problem | Direction |
|---|---|---|
| "100% Sharia Compliant", "Halal Certified", "100% Certified" (`ComplianceSection.tsx`, `faq`, `pricing`, `FinalCtaSection.tsx`, `layout.tsx` metadata) | No Sharia claim before the CSO opinion | e.g. "Built on participatory-finance principles — Sharia board review in progress" |
| "Starting from 1,000 MAD" / "1,000 MAD" (hero, metadata, pricing ×4, faq, comparison table) | Minimum is 25,000 MAD | "From 25,000 MAD", read from `lib/finance/fee-grid.ts` |
| "+10.4 %", "+8.7 %", "+12.1 %" (hero cards) | Looks like guaranteed / gross returns | Real engine output, labelled net · indicative · not guaranteed, or remove |
| `/pricing` page | Must match the fee grid | Rebuild from the fee grid (who pays what, when) |
| "Flexible exit" (comparison) | Exit is via windows every 6 months after 1 year | "Organised exit windows" |
| "3 minutes" to invest | Overpromises (KYC, cooling-off) | "Sign up in minutes" or remove |
| `public/images/igudar-investor-dashboard.png` | Shows 1,000 MAD minimums, "+12.6 %", Deposit/Withdraw/Convert, referral reward | Replace with an illustration built from the engine, labelled "Illustration — demo data" |
| Any "Invest now" CTA | No solicitation pre-licence | "Simulate", "Join the waitlist", "Access the demo" |

Add a discreet, always-visible pre-licence notice in the footer and next to every number: "Indicative simulation based on the IGUDAR financial model. Returns are not guaranteed. Not an offer or solicitation; no investment is collected before the AMMC licence (Loi 15-18)."

## Visual direction

- Hero: sand background, big headline, faint zellige radial texture behind the headline area (never behind body text), arch-framed property visual, small Tifinagh accent; the simulator widget right below.
- "How it works": the igudar story — shared building, your own chamber, a trusted keeper, written rules — then the escrow money-flow diagram.
- Zellige one-row section dividers, faded at both ends.
- Airy and premium (Robinhood / Wealthsimple marketing): huge type, lots of space, few colours. No fake testimonials or fake investor counts.
