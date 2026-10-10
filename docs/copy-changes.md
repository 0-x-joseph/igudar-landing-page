# Copy changes for founder approval (L3b / L4)

Every wording change in this PR, before and after. Items marked **NEEDS FOUNDER APPROVAL** are legal-ish or regulatory
statements: please confirm or rewrite them before merge. Numbers are never typed in copy: the minimum comes from
`LIMITS.MIN_TICKET_MAD` (25,000 MAD) and fees from `FEE_GRID`.

Categories: **S** Sharia / certification, **M** minimum ticket, **C** CTA / solicitation, **R** return or liquidity promise,
**L** licence / regulation, **N** notice, **B** beta page and form, **O** other.

## Compliance fixes

| # | Cat | Where | Before | After | Approval |
|---|---|---|---|---|---|
| 1 | S | `app/faq/page.tsx` intro | "...AI-driven, Sharia-compliant fractional real estate investment." | "IGUDAR lets you own a share of a rented Moroccan building, with the fees, the risks and the rules written down in plain language." | |
| 2 | S | FAQ pillar | "Sharia Compliant: All investments follow Islamic financial principles with certified Sharia advisor oversight." | "Participatory finance: Built on participatory-finance principles: you own shares, you share the rent, and there is no interest. Sharia board review in progress." | **NEEDS FOUNDER APPROVAL** |
| 3 | S | FAQ question | "How does IGUDAR ensure Sharia compliance?" / "collaborates with certified Sharia advisors..." | "Is IGUDAR Sharia-compliant?" / "We do not claim it yet. IGUDAR is built on participatory-finance principles: you own shares, the rent and the risk are shared, and there is no interest. Sharia board review in progress. Until the board gives its opinion, we will not describe IGUDAR with any religious label." | **NEEDS FOUNDER APPROVAL** |
| 4 | S | FAQ "developers benefit" | "Developers access competitive, Sharia-compliant financing without relying on traditional banks or high-interest loans." | New question "How do sellers and developers benefit?": raise part of the funding from a group of shareholders; seller pays 3.5 % syndication only if the raise closes, operator pays 1.5 % structuring; neither charged to the investor (both rates read from `FEE_GRID`). | |
| 5 | S | FAQ "small savers" | "...earn dividends based on project performance, and align with their religious values." | Replaced by "Who is IGUDAR for?": urban professionals and Moroccans abroad, minimum 25,000 MAD, result depends on the property, net, never promised. | |
| 6 | S | FAQ "types of contracts" | "IGUDAR uses Mudarabah (profit-sharing), Musharakah (joint ownership), and Ijara (lease-to-own), compliant with Moroccan law and Sharia standards." | "What do I actually own?": shares in a property company (SAS) for one building, rented to a professional operator; rent shared after costs, fees and taxes; no loan to you, no interest; rent comes from the operator under the lease, not from IGUDAR. | **NEEDS FOUNDER APPROVAL** (legal description of the structure) |
| 7 | S | FAQ footer (own footer, line 267) | "Democratizing real estate investment in Morocco through AI-powered, Sharia-compliant fractional ownership." | Own footer removed; the page now uses the shared `SiteFooter`. | |
| 8 | S | `components/SiteFooter.tsx` link | "Sharia Compliance" (`#sharia-compliant`, dead anchor) | Removed. Added "Simulator" and "Beta" links. | |
| 9 | S | `SiteFooter` tagline | "Democratizing real estate investment in Morocco through Sharia-compliant fractional ownership." | "Fractional ownership of rented Moroccan property, with the fees, risks and rules in plain language." | |
| 10 | S, M | `app/layout.tsx` description | "Start with 1,000 MAD. Access vetted, Sharia-compliant properties with full transparency. The smartest way to invest in real estate." | "Own a share of a rented Moroccan building, from 25,000 MAD. See every fee, simulate net returns, and join the closed beta. Returns are not guaranteed; not an offer." (amount from the constant) | |
| 11 | O | `app/layout.tsx` title | "IGUDAR — Invest in Moroccan Real Estate, Share by Share" | "IGUDAR — fractional property, simulated honestly" | |
| 12 | O | `app/layout.tsx` OG / Twitter | none | `openGraph` and `twitter` set from the same title and description (consistent). | |
| 13 | O | `app/layout.tsx` robots | not set (indexed) | Left as is. Founders: decide if the site should be indexed before the licence; add `robots: { index: false }` if not. A comment marks the spot. | **NEEDS FOUNDER APPROVAL** (indexing decision) |
| 14 | M | FAQ "How does the platform work?" | "...investors who can enter with low minimum amounts... investors pay a small percentage (1.5%) of pre-tax profit." (also wrong fee) | Plain explanation, minimum 25,000 MAD, no entry fee, 0.75 %/yr platform fee through the property company, sellers and operators pay their own fees. | |
| 15 | M | FAQ pillar | "Accessible to All: Low minimum investments starting from 1,000 MAD..." | "A clear minimum: Shares start from 25,000 MAD per project, and every fee is published in full." | |
| 16 | L | FAQ pillar | "Regulated Platform: Operating under Moroccan Law 15-18 with AMMC supervision for investor protection." | "Licence in preparation: Built for Moroccan Law 15-18. IGUDAR is preparing its AMMC licence and collects no money before it is granted." | **NEEDS FOUNDER APPROVAL** |
| 17 | L | FAQ "How is the platform regulated?" | "IGUDAR follows Moroccan crowdfunding Law 15-18 and operates under AMMC supervision..." | "Is IGUDAR licensed?": "Not yet. IGUDAR is built to follow Moroccan crowdfunding law (Loi 15-18) and is preparing its licence application with the AMMC. Until a licence is granted, nothing on this site is an offer or a solicitation." | **NEEDS FOUNDER APPROVAL** |
| 18 | L | FAQ "Does IGUDAR comply with Moroccan crowdfunding law?" | "Yes. IGUDAR operates under the investment-based crowdfunding model and is subject to AMMC accreditation per Law 15-18." | Replaced by "Can I put in real money today?": "No. The platform at app.igudar.tech is a closed beta of about 50 people, using demo money. No real money is collected anywhere, and no investment is accepted before the AMMC licence." | **NEEDS FOUNDER APPROVAL** |
| 19 | L | FAQ "mechanisms to manage risks" | "IGUDAR implements project due diligence, active monitoring, transparent reporting, and portfolio diversification, backed by legal agreements." | "How are risks managed?": each property reviewed before listing, documents/fees/risks published, escrow per project, Pessimistic case always shown, "None of this removes the risk: you can lose part or all of what you put in." | **NEEDS FOUNDER APPROVAL** |
| 20 | C | FAQ "How does the payment process work?" | "...register a Mastercard or Visa card and invest online through our secure payment gateway." | "How does payment work?": demo money in the beta; once licensed, escrow at a regulated bank, one per project, never IGUDAR itself; payment methods confirmed before launch. | **NEEDS FOUNDER APPROVAL** |
| 21 | R | FAQ question | "Is my return guaranteed?" | "Can IGUDAR promise me a return?" (answer unchanged) | |
| 22 | R | FAQ answers | "...neither is guaranteed." / "...and is never guaranteed." | "...neither is a promise." / "...and is never promised." (the copy guard forbids "guaranteed" unless "not guaranteed") | |
| 23 | C | FAQ CTAs | "Get Started Today" / "Contact Support" (dead `#` link) | "Access the demo" (app register) / "Apply for the beta" (`/beta`) | |
| 24 | C | Hero primary CTA | "Access MVP" | "Access the demo" | |
| 25 | C | Hero and Navbar secondary CTA | "Join Waitlist" | "Join the waitlist" | |
| 26 | C | Navbar banner | "Igudar early access is now live! Get Started →" | "The IGUDAR closed beta is open for applications. Demo money only. Apply for the beta →" (links to `/beta`) | |
| 27 | R | Hero headline | "Build your wealth through real [estate / trust / transparency]" (rotating word, a return promise) | **"Real property. Real rent. Clear rules."** (static; the rotation is removed) | **NEEDS FOUNDER APPROVAL** (headline) |
| 28 | R | Hero alternatives (not applied) | | "Own a share of a rented building. Honestly." / "Real property. Real rent. Clear rules." (chosen) / "A share of a real building, with the rules in plain sight." | |
| 29 | C | `FinalCtaSection` | Simulate + waitlist form | Adds "Apply for the beta" secondary link; body adds "try the closed beta with demo money". | |
| 30 | O | `FeaturesSection` | "Data-Driven Investment Intelligence" / "Market analytics, AI-powered insights, and rigorous compliance screening..." / "Comprehensive risk evaluation for each investment with transparent scoring." | "Clear data on every property" / "Market context, a plain view of the risks and the fees, all in one place." / "A plain-language view of the main risks of each property, next to the numbers." | |
| 31 | R | `PainPointsSection` | "...pricing logic, expected returns, documents..." | "...indicative returns..." | |
| 32 | O | Waitlist confirmation email | "We're building the smartest way to invest in Moroccan real estate... first to access it." / "priority access to investment opportunities" / "Democratizing real estate investment in Morocco." | "We're building a clearer way to own a share of rented Moroccan property..." / "We'll write to you when there is news" / "Joining the waitlist is not a commitment, and no money is collected" / "You can ask us to remove your email at any time" / footer shows the pre-licence sentence. | **NEEDS FOUNDER APPROVAL** (removal promise) |
| 33 | N | `SiteFooter` | no notice | Always-visible line with the exact sentence from `INDICATIVE_NOTICE` ("Indicative simulation based on the IGUDAR financial model. Returns are not guaranteed. Not an offer or solicitation; no investment is collected before the AMMC licence (Loi 15-18)."). Every page now has it in the footer; pages with numbers also keep the in-page `IndicativeNotice`. | **NEEDS FOUNDER APPROVAL** (exact sentence, as in landing.CLAUDE.md) |
| 34 | O | Partner strip | "Programmes & partners" | Confirmed, unchanged; logos unchanged. | |

Already clean before this PR (grep confirmed): "Invest now", "Start investing", "3 minutes", "flexible exit", "withdraw anytime", "passive income", "+x %" hero cards, and "1,000 MAD" in pricing and simulator (removed in the reskin). The guard keeps them out.

## New: `/beta` page

| # | Cat | Where | Copy | Approval |
|---|---|---|---|---|
| 35 | B | Hero | "Closed beta" / "Try IGUDAR with demo money." / "We are testing the platform with about 50 people. Explore properties, simulate a subscription from 25,000 MAD and tell us what works. No real money is involved." | |
| 36 | B | What the beta is | "A closed test: About 50 people, let in by hand. A founder approves every account before you get in." / "Demo money only: ...No real money is collected or moved, anywhere in the beta." / "Time can run faster: ...up to a year of activity in about two weeks. You will always see which mode is on." | |
| 37 | B | Data | "To learn what works, we record how you use the beta (usage events) and the feedback you give us. No identity documents are stored. Your data is handled under Moroccan personal-data law (Law 09-08), overseen by the CNDP. You will see a consent screen before you start." | **NEEDS FOUNDER APPROVAL** (legal reference, CNDP declaration status, "no identity documents") |
| 38 | B | Who and what | "Urban professionals in Morocco and Moroccans abroad..." and four steps: Explore properties, Simulate subscriptions, Receive simulated distributions, Tell us what works. | |
| 39 | B | Form | Fields: first name, email, city and country, amount range (5 buckets, first from 25,000 MAD), experience (3 levels), consent never pre-checked: "I agree that IGUDAR may store these answers and my email to review my application and contact me about the closed beta. I understand the beta uses demo money." | **NEEDS FOUNDER APPROVAL** (consent wording) |
| 40 | B | Success | "Thanks — a founder reviews every application by hand. You'll hear from us by email." | |
| 41 | B | Applicant email | "Thanks, {name}. We received your application." + beta summary + pre-licence sentence | |
| 42 | C | CTA | "Access the demo" to `https://app.igudar.tech/auth/register`; Navbar "Beta"; FinalCta "Apply for the beta". | |

## Counts

Compliance fixes: S 9 (rows 1-9), M 3 (10, 14, 15; row 10 also counts as S), C 6, R 5, L 4, N 1, O 6 (some rows carry two categories). 34 compliance rows plus 8 beta rows = 42 rows.

## Not changed, flagged

- `components/FeaturesSection.tsx` "Personalized Matching: Tailored recommendations based on your profile, goals, and risk tolerance." may read as investment advice. Left for a founder decision.
- Hero "Access the demo" still links to `/auth/login` (as "Access MVP" did); the beta page links to `/auth/register`.
- `public/images/igudar-investor-dashboard.png` (brief table row) is not referenced by any page; delete the file when convenient.
- Guard exception: `copy-guard.test.ts` allows exactly two phrases containing "Sharia", only in `app/faq/page.tsx`: "Is IGUDAR Sharia-compliant?" and "Sharia board review in progress". Everything else with that word fails.
