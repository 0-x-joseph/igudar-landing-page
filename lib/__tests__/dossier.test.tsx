import { describe, expect, it } from "vitest";
import { fireEvent, screen, within } from "@testing-library/react";
import { LIMITS, MODEL_SCENARIOS, formatPercent, simulate } from "@/lib/finance";
import { messagesFor, renderIntl } from "@/lib/__tests__/helpers/intl";
import FeaturesSection from "@/components/FeaturesSection";

const nbsp = (s: string) => s.replace(/\s/g, " ");

type SectionsMessages = {
  features: { title: string };
  dossier: { badge: string; demo: { name: string }; layers: { market: { title: string } } };
};
const sections = (locale: "fr" | "ar") => messagesFor(locale).sections as SectionsMessages;

describe("#ai-powered property dossier", () => {
  it("keeps the section, the heading and the three approved descriptions word for word", () => {
    const { container } = renderIntl(<FeaturesSection />);
    expect(container.querySelector("#ai-powered")).not.toBeNull();
    expect(screen.getByRole("heading", { level: 2, name: "Clear data on every property" })).toBeInTheDocument();
    for (const [title, desc] of [
      ["Market Analysis", "Real-time analysis of Moroccan real estate market trends and emerging opportunities."],
      ["Risk Assessment", "A plain-language view of the main risks of each property, next to the numbers."],
      ["Personalized Matching", "Tailored recommendations based on your profile, goals, and risk tolerance."],
    ]) {
      expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
      expect(screen.getByText(desc)).toBeInTheDocument();
    }
  });

  it("is one mocked property, labelled as demo data", () => {
    const { container } = renderIntl(<FeaturesSection />);
    expect(container.querySelectorAll("[data-dossier]")).toHaveLength(1);
    expect(screen.getByText("Example · demo data")).toBeInTheDocument();
    expect(container.querySelectorAll("[data-layer]")).toHaveLength(3);
  });

  it("draws the rent-versus-district chart from the engine's gross yield and the bank deposit rate", () => {
    const { container } = renderIntl(<FeaturesSection />);
    const chart = container.querySelector('[data-chart="rent-vs-district"]')!;
    const bars = Array.from(chart.querySelectorAll("[data-bar]"));
    expect(bars.map((b) => b.getAttribute("data-bar"))).toEqual(["property", "district", "deposit"]);
    const value = (name: string) => Number(chart.querySelector(`[data-bar="${name}"]`)!.getAttribute("data-value"));
    expect(value("property")).toBe(MODEL_SCENARIOS.base.grossYield);
    expect(value("deposit")).toBe(LIMITS.BANK_DEPOSIT_RATE);
    expect(value("district")).toBeGreaterThan(0);
    expect(chart).toHaveAttribute("role", "img");
    const text = nbsp(container.textContent ?? "");
    expect(text).toContain(nbsp(formatPercent(MODEL_SCENARIOS.base.grossYield)));
    expect(text).toContain(nbsp(formatPercent(LIMITS.BANK_DEPOSIT_RATE)));
  });

  it("labels every figure indicative and shows the net cash yield and IRR of the Base case", () => {
    const { container } = renderIntl(<FeaturesSection />);
    const sim = simulate({ ticketMad: LIMITS.MIN_TICKET_MAD, scenario: "base" });
    const text = nbsp(container.textContent ?? "");
    expect(text).toContain(nbsp(formatPercent(sim.netCashYieldYear1)));
    expect(text).toContain(nbsp(formatPercent(sim.netIrr!)));
    expect(text).toMatch(/indicative/i);
    expect(text).toMatch(/not guaranteed/i);
  });

  it("shows three risk chips, each an icon and a word", () => {
    const { container } = renderIntl(<FeaturesSection />);
    const chips = Array.from(container.querySelectorAll("[data-risk-chip]"));
    expect(chips).toHaveLength(3);
    for (const chip of chips) {
      expect(chip.querySelector("svg")).not.toBeNull();
      expect((chip.textContent ?? "").trim().split(/\s+/).length).toBeLessThanOrEqual(2);
    }
  });

  it("shows a suitability meter with an accessible value", () => {
    renderIntl(<FeaturesSection />);
    const meter = screen.getByRole("meter");
    expect(Number(meter.getAttribute("aria-valuenow"))).toBeGreaterThan(0);
    expect(Number(meter.getAttribute("aria-valuenow"))).toBeLessThanOrEqual(Number(meter.getAttribute("aria-valuemax")));
    expect(meter).toHaveAccessibleName(/demo/i);
  });

  it("lights a layer when it is hovered or focused", () => {
    const { container } = renderIntl(<FeaturesSection />);
    const layers = container.querySelectorAll("[data-layer]");
    expect(layers[0]).toHaveAttribute("data-active", "false");
    fireEvent.mouseEnter(layers[1]);
    expect(layers[1]).toHaveAttribute("data-active", "true");
    fireEvent.focus(within(layers[2] as HTMLElement).getByRole("heading"));
    expect(layers[2]).toHaveAttribute("data-active", "true");
    expect(layers[1]).toHaveAttribute("data-active", "false");
  });

  it("reads in French, with the French decimal mark in the percentages", () => {
    const m = sections("fr");
    const { container } = renderIntl(<FeaturesSection />, { locale: "fr" });
    expect(screen.getByRole("heading", { level: 2, name: m.features.title })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: m.dossier.layers.market.title })).toBeInTheDocument();
    expect(screen.getByText(m.dossier.badge)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: m.dossier.demo.name })).toBeInTheDocument();
    const text = nbsp(container.textContent ?? "");
    expect(text).toMatch(/\d,\d %/);
    expect(text).not.toContain("Clear data on every property");
  });

  it("reads in Arabic, with the minimum ticket in dirhams", () => {
    const m = sections("ar");
    const { container } = renderIntl(<FeaturesSection />, { locale: "ar" });
    expect(screen.getByRole("heading", { level: 2, name: m.features.title })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: m.dossier.layers.market.title })).toBeInTheDocument();
    expect(screen.getByText(m.dossier.badge)).toBeInTheDocument();
    const text = nbsp(container.textContent ?? "");
    expect(text).toContain("درهم");
    expect(text).not.toContain("MAD");
  });
});
