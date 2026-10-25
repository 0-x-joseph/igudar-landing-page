import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { screen, within } from "@testing-library/react";
import { LIMITS, formatMad, formatPercent, simulate } from "@/lib/finance";
import { PLANS, planFigures } from "@/lib/plans";
import PlanCards from "@/components/pricing/PlanCards";
import PricingPageContent from "@/components/pricing/PricingPageContent";
import { messagesFor, renderIntl } from "@/lib/__tests__/helpers/intl";

const nbsp = (s: string) => s.replace(/\s/g, " ");

type PricingMessages = { hero: { title: string }; plans: { minimumTicket: string } };
const pricingMessages = (locale: "fr" | "ar") => messagesFor(locale).pricing as PricingMessages;

describe("plan figures come from the engine", () => {
  it("shows only the Individual plan at the 25,000 MAD minimum; Family Circle, institutional and analytics are out of scope", () => {
    expect(PLANS.map((p) => p.id)).toEqual(["individual"]);
    expect(PLANS.map((p) => p.ticketMad)).toEqual([LIMITS.MIN_TICKET_MAD]);
  });

  it.each(PLANS)("$id card shows simulate() IRR and total gain, Base big and Pessimistic beside", (plan) => {
    const { container } = renderIntl(<PlanCards />);
    const card = container.querySelector(`[data-plan="${plan.id}"]`) as HTMLElement;
    const base = simulate({ ticketMad: plan.ticketMad, scenario: "base" });
    const pess = simulate({ ticketMad: plan.ticketMad, scenario: "pessimistic" });
    expect(base.netIrr).not.toBeNull();
    const text = (key: string) => nbsp(card.querySelector(`[data-figure="${key}"]`)!.textContent ?? "");
    expect(text("irr")).toBe(nbsp(formatPercent(base.netIrr!)));
    expect(text("gain")).toBe(nbsp(formatMad(base.netProfitMad, { decimals: 0 })));
    expect(text("irr-pessimistic")).toContain(nbsp(formatPercent(pess.netIrr!)));
    expect(text("gain-pessimistic")).toContain(nbsp(formatMad(pess.netProfitMad, { decimals: 0 })));
    expect(planFigures(plan).base.netProfitMad).toBe(base.netProfitMad);
  });

  it("shows the v6 check figures at 25,000 MAD: IRR 3.07 %, +3,796 MAD; Pessimistic 1.40 %, +1,697 MAD", () => {
    const { container } = renderIntl(<PlanCards />);
    const card = within(container.querySelector('[data-plan="individual"]') as HTMLElement);
    expect(nbsp(container.querySelector('[data-figure="irr"]')!.textContent ?? "")).toBe("3.1 %");
    expect(nbsp(container.querySelector('[data-figure="gain"]')!.textContent ?? "")).toBe("3,796 MAD");
    expect(nbsp(container.querySelector('[data-figure="irr-pessimistic"]')!.textContent ?? "")).toContain("1.4 %");
    expect(nbsp(container.querySelector('[data-figure="gain-pessimistic"]')!.textContent ?? "")).toContain("1,697 MAD");
    expect(card.getByText("25,450 MAD")).toBeInTheDocument();
  });

  it("types no figure by hand: no quoted literal with a digit in the card source", () => {
    const src = readFileSync(path.resolve(import.meta.dirname, "../../components/pricing/PlanCards.tsx"), "utf8");
    const literals = src.match(/(["'`])(?:(?!\1)[^\n])*\1/g) ?? [];
    // Tailwind classes (size-4, px-5, text-2xl ...) are the only strings allowed to hold a digit.
    const offenders = literals.filter((l) => /\d[\d,.]*\s?(MAD|%|years?|\/yr)/i.test(l));
    expect(offenders, offenders.join("\n")).toEqual([]);
  });
});

describe("the plan card", () => {
  it("renders the Individual card only, with no Family Circle, professional or analytics wording", () => {
    const { container } = renderIntl(<PlanCards />);
    const cards = Array.from(container.querySelectorAll("[data-plan]"));
    expect(cards.map((c) => c.getAttribute("data-plan"))).toEqual(["individual"]);
    expect(screen.getByText("RETAIL")).toBeInTheDocument();
    const text = container.textContent ?? "";
    expect(text).not.toMatch(/family|professional|institutional|analytics|planned/i);
  });

  it("states the ticket and cap from LIMITS", () => {
    const { container } = renderIntl(<PlanCards />);
    const ind = within(container.querySelector('[data-plan="individual"]') as HTMLElement);
    expect(ind.getByText(nbsp(formatMad(LIMITS.MIN_TICKET_MAD, { decimals: 0 })))).toBeInTheDocument();
    expect(ind.getByText(`cap ${nbsp(formatMad(LIMITS.MAX_PER_PROJECT_MAD, { decimals: 0 }))} per project`)).toBeInTheDocument();
  });

  it("shows D1 as 1.5 % + VAT (450 MAD, never rounded to 2 %), the total at subscription, D2 and D4", () => {
    const { container } = renderIntl(<PlanCards />);
    const card = nbsp(container.querySelector("[data-plan]")!.textContent ?? "");
    expect(card).toContain(nbsp("1.5 % + VAT (450 MAD)"));
    expect(card).not.toMatch(/(^|[^d.])2 ?%/);
    expect(card).toContain(nbsp(formatMad(25_450, { decimals: 0 })));
    expect(card).toContain(nbsp(formatPercent(0.0075, 2)));
    expect(card).toContain(nbsp(formatPercent(0.01)));
  });

  it("carries the engine-true footnote", () => {
    renderIntl(<PlanCards />);
    expect(
      screen.getByText(
        `Simulation net of fees and taxes, not guaranteed: Base scenario of the IGUDAR financial model, sold after ${LIMITS.HOLD_YEARS} years; the IRR includes the sale; total gain = net rent + sale proceeds − everything you paid in (amount invested + structuring fee). Pessimistic shown beside Base.`,
      ),
    ).toBeInTheDocument();
  });
});

describe("pricing page", () => {
  it("leads with the one-fee story and keeps the detailed grid below", () => {
    const { container } = renderIntl(<PricingPageContent />);
    expect(screen.getByRole("heading", { level: 1, name: "One fee for you, the rest inside the company" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Who pays what, when" })).toBeInTheDocument();
    expect(container.querySelectorAll('[data-testid="fee-row"]').length).toBeGreaterThanOrEqual(7);
    const cards = container.querySelector("[data-plan]")!;
    const table = container.querySelector("table")!;
    expect(cards.compareDocumentPosition(table) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("reads in French, with French money formatting", () => {
    const fr = pricingMessages("fr");
    const { container } = renderIntl(<PricingPageContent />, { locale: "fr" });
    expect(screen.getByRole("heading", { level: 1, name: fr.hero.title })).toBeInTheDocument();
    expect(screen.getAllByText(fr.plans.minimumTicket).length).toBe(1);
    expect(nbsp(container.textContent ?? "")).toMatch(/25[ .]000 MAD/);
  });

  it("reads in Arabic, with the dirham word from the formatter", () => {
    const ar = pricingMessages("ar");
    const { container } = renderIntl(<PricingPageContent />, { locale: "ar" });
    expect(screen.getByRole("heading", { level: 1, name: ar.hero.title })).toBeInTheDocument();
    expect(screen.getAllByText(ar.plans.minimumTicket).length).toBe(1);
    expect(nbsp(container.textContent ?? "")).toMatch(/25[ ,.]000 درهم/);
    expect(container.textContent).not.toMatch(/\bMAD\b/);
  });
});
