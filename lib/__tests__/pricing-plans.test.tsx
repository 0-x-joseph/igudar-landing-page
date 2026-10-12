import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { screen, within } from "@testing-library/react";
import { LIMITS, formatMad, formatPercent, simulate } from "@/lib/finance";
import { PLANS, PROFESSIONAL_MIN_TICKET_MAD, planFigures } from "@/lib/plans";
import PlanCards from "@/components/pricing/PlanCards";
import PricingPageContent from "@/components/pricing/PricingPageContent";
import { messagesFor, renderIntl } from "@/lib/__tests__/helpers/intl";

const nbsp = (s: string) => s.replace(/\s/g, " ");

type PricingMessages = { hero: { title: string }; plans: { minimumTicket: string } };
const pricingMessages = (locale: "fr" | "ar") => messagesFor(locale).pricing as PricingMessages;

describe("plan figures come from the engine", () => {
  it("uses 25,000 / 25,000 / 250,000 MAD tickets, the first two from LIMITS", () => {
    expect(PLANS.map((p) => p.ticketMad)).toEqual([LIMITS.MIN_TICKET_MAD, LIMITS.MIN_TICKET_MAD, PROFESSIONAL_MIN_TICKET_MAD]);
    expect(PROFESSIONAL_MIN_TICKET_MAD).toBe(250_000);
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

  it("types no figure by hand: no quoted literal with a digit in the card source", () => {
    const src = readFileSync(path.resolve(import.meta.dirname, "../../components/pricing/PlanCards.tsx"), "utf8");
    const literals = src.match(/(["'`])(?:(?!\1)[^\n])*\1/g) ?? [];
    // Tailwind classes (size-4, px-5, text-2xl ...) are the only strings allowed to hold a digit.
    const offenders = literals.filter((l) => /\d[\d,.]*\s?(MAD|%|years?|\/yr)/i.test(l));
    expect(offenders, offenders.join("\n")).toEqual([]);
  });
});

describe("the three plan cards", () => {
  it("render in order with the family card highlighted in the middle", () => {
    const { container } = renderIntl(<PlanCards />);
    const cards = Array.from(container.querySelectorAll("[data-plan]"));
    expect(cards.map((c) => c.getAttribute("data-plan"))).toEqual(["individual", "family", "institutional"]);
    expect(cards[1]).toHaveAttribute("data-highlight", "true");
    expect(cards[0]).not.toHaveAttribute("data-highlight");
    for (const eyebrow of ["RETAIL", "FAMILY CIRCLE", "PROFESSIONAL"]) expect(screen.getByText(eyebrow)).toBeInTheDocument();
  });

  it("states tickets and caps from LIMITS", () => {
    const { container } = renderIntl(<PlanCards />);
    const ind = within(container.querySelector('[data-plan="individual"]') as HTMLElement);
    expect(ind.getByText(nbsp(formatMad(LIMITS.MIN_TICKET_MAD, { decimals: 0 })))).toBeInTheDocument();
    expect(ind.getByText(`cap ${nbsp(formatMad(LIMITS.MAX_PER_PROJECT_MAD, { decimals: 0 }))} per project`)).toBeInTheDocument();
    const fam = within(container.querySelector('[data-plan="family"]') as HTMLElement);
    expect(fam.getByText("per member")).toBeInTheDocument();
    expect(fam.getByText("family tickets add up")).toBeInTheDocument();
    const inst = within(container.querySelector('[data-plan="institutional"]') as HTMLElement);
    expect(inst.getByText(nbsp(formatMad(PROFESSIONAL_MIN_TICKET_MAD, { decimals: 0 })))).toBeInTheDocument();
    expect(inst.getByText("business angels exempt from caps (art. 44)")).toBeInTheDocument();
  });

  it("marks every line that is not in the fee grid as Planned and gives it no amount", () => {
    const { container } = renderIntl(<PlanCards />);
    const planned = Array.from(container.querySelectorAll("[data-planned]"));
    expect(planned.length).toBeGreaterThanOrEqual(5);
    for (const row of planned) {
      expect(row).toHaveTextContent(/planned/i);
      expect(row.textContent).not.toMatch(/\d/);
    }
  });

  it("shows the grid fees D1, D2 and D4 on every card", () => {
    const { container } = renderIntl(<PlanCards />);
    for (const card of Array.from(container.querySelectorAll("[data-plan]"))) {
      expect(nbsp(card.textContent ?? "")).toContain(nbsp(formatPercent(0, 0)));
      expect(nbsp(card.textContent ?? "")).toContain(nbsp(formatPercent(0.0075, 2)));
      expect(nbsp(card.textContent ?? "")).toContain(nbsp(formatPercent(0.015)));
    }
  });

  it("carries the engine-true footnote", () => {
    renderIntl(<PlanCards />);
    expect(
      screen.getByText(
        `Simulation net of fees and taxes, not guaranteed: Base scenario of the IGUDAR financial model, sold after ${LIMITS.HOLD_YEARS} years; the IRR includes the sale; total gain = net rent + sale proceeds − amount invested. Pessimistic shown beside Base.`,
      ),
    ).toBeInTheDocument();
  });
});

describe("pricing page", () => {
  it("leads with the three ways to invest and keeps the detailed grid below", () => {
    const { container } = renderIntl(<PricingPageContent />);
    expect(screen.getByRole("heading", { level: 1, name: "One property, three ways to invest" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Who pays what, when" })).toBeInTheDocument();
    expect(container.querySelectorAll('[data-testid="fee-row"]').length).toBeGreaterThanOrEqual(8);
    const cards = container.querySelector("[data-plan]")!;
    const table = container.querySelector("table")!;
    expect(cards.compareDocumentPosition(table) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("reads in French, with French money formatting", () => {
    const fr = pricingMessages("fr");
    const { container } = renderIntl(<PricingPageContent />, { locale: "fr" });
    expect(screen.getByRole("heading", { level: 1, name: fr.hero.title })).toBeInTheDocument();
    expect(screen.getAllByText(fr.plans.minimumTicket).length).toBe(3);
    expect(nbsp(container.textContent ?? "")).toMatch(/25[ .]000 MAD/);
  });

  it("reads in Arabic, with the dirham word from the formatter", () => {
    const ar = pricingMessages("ar");
    const { container } = renderIntl(<PricingPageContent />, { locale: "ar" });
    expect(screen.getByRole("heading", { level: 1, name: ar.hero.title })).toBeInTheDocument();
    expect(screen.getAllByText(ar.plans.minimumTicket).length).toBe(3);
    expect(nbsp(container.textContent ?? "")).toMatch(/25[ ,.]000 درهم/);
    expect(container.textContent).not.toMatch(/\bMAD\b/);
  });
});
