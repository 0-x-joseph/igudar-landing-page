import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { FEE_LINES, INDICATIVE_NOTICE, LIMITS, feeLinesForTicket, formatMad } from "@/lib/finance";
import PricingTable from "@/components/pricing/PricingTable";
import PricingPageContent from "@/components/pricing/PricingPageContent";

describe("PricingTable", () => {
  it("has one row per fee line: eight", () => {
    const { container } = render(<PricingTable />);
    expect(FEE_LINES).toHaveLength(8);
    expect(container.querySelectorAll("tbody tr")).toHaveLength(8);
    for (const line of FEE_LINES) {
      expect(screen.getAllByText(line.label).length).toBeGreaterThan(0);
    }
  });

  it("works the last column out for 25,000 MAD with the engine's own numbers", () => {
    const { container } = render(<PricingTable />);
    const d2 = feeLinesForTicket(LIMITS.MIN_TICKET_MAD).find((l) => l.code === "D2");
    // Testing Library collapses NBSP into a plain space, so the expected text does too.
    const expected = formatMad(d2!.amountMad!).replace(/\s/g, " ");
    expect(expected).toContain("187.50");

    const table = container.querySelector("table")!;
    const d2Row = within(table).getByText("D2").closest("tr")!;
    expect(d2Row).toHaveTextContent(`${expected} per year HT`);
    expect(d2Row).toHaveTextContent("225.00 MAD TTC");
  });

  it("shows the entry fee as 0 MAD", () => {
    const { container } = render(<PricingTable />);
    const d1Row = within(container.querySelector("table")!).getByText("D1").closest("tr")!;
    expect(d1Row).toHaveTextContent("0 MAD");
    expect(d1Row).not.toHaveTextContent("0.00 MAD");
  });

  it("says the seller and operator fees are not charged to the investor", () => {
    const { container } = render(<PricingTable />);
    for (const code of ["S1", "S2"]) {
      const row = within(container.querySelector("table")!).getByText(code).closest("tr")!;
      expect(row).toHaveTextContent("Not charged to you");
    }
  });

  it("never offers priority access with the analytics add-on", () => {
    const { container } = render(<PricingTable />);
    const d6 = within(container.querySelector("table")!).getByText("D6").closest("tr")!;
    expect(d6).toHaveTextContent("never priority access");
  });
});

describe("pricing page content", () => {
  it("has the 'what you don't pay' block, the notice and the calculator link", () => {
    render(<PricingPageContent />);
    expect(screen.getByRole("heading", { level: 1, name: "Who pays what, when" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /What you don.t pay/ })).toBeInTheDocument();
    expect(screen.getByText(INDICATIVE_NOTICE)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /calculator/i })).toHaveAttribute("href", "/calculator");
    expect(screen.getByRole("link", { name: /FAQ/ })).toHaveAttribute("href", "/faq");
  });

  it("drops the old plan tiers, the 1,000 MAD minimum and every promotion", () => {
    const { container } = render(<PricingPageContent />);
    const text = container.textContent ?? "";
    expect(text).not.toMatch(/1,000 MAD/);
    expect(text).not.toMatch(/Discovery|Premium|Get Started/);
    expect(text).not.toMatch(/founding|referral|waived|priority in allocation/i);
  });
});
