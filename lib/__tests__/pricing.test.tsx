import { describe, expect, it } from "vitest";
import { screen, within } from "@testing-library/react";
import { FEE_LINES, INDICATIVE_NOTICE, LIMITS, feeLinesForTicket, formatMad } from "@/lib/finance";
import PricingTable from "@/components/pricing/PricingTable";
import PricingPageContent from "@/components/pricing/PricingPageContent";
import { messagesFor, renderIntl } from "@/lib/__tests__/helpers/intl";

type TableMessages = { table: { headers: { fee: string; paidBy: string }; meaning: { notCharged: string } } };

describe("PricingTable", () => {
  it("has one row per fee line: eight", () => {
    const { container } = renderIntl(<PricingTable />);
    expect(FEE_LINES).toHaveLength(8);
    expect(container.querySelectorAll("tbody tr")).toHaveLength(8);
    for (const line of FEE_LINES) {
      expect(screen.getAllByText(line.label).length).toBeGreaterThan(0);
    }
  });

  it("works the last column out for 25,000 MAD with the engine's own numbers", () => {
    const { container } = renderIntl(<PricingTable />);
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
    const { container } = renderIntl(<PricingTable />);
    const d1Row = within(container.querySelector("table")!).getByText("D1").closest("tr")!;
    expect(d1Row).toHaveTextContent("0 MAD");
    expect(d1Row).not.toHaveTextContent("0.00 MAD");
  });

  it("says the seller and operator fees are not charged to the investor", () => {
    const { container } = renderIntl(<PricingTable />);
    for (const code of ["S1", "S2"]) {
      const row = within(container.querySelector("table")!).getByText(code).closest("tr")!;
      expect(row).toHaveTextContent("Not charged to you");
    }
  });

  it("never offers priority access with the analytics add-on", () => {
    const { container } = renderIntl(<PricingTable />);
    const d6 = within(container.querySelector("table")!).getByText("D6").closest("tr")!;
    expect(d6).toHaveTextContent("never priority access");
  });

  it("reads in French with French number marks", () => {
    const fr = (messagesFor("fr").pricing as TableMessages).table;
    const { container } = renderIntl(<PricingTable />, { locale: "fr" });
    expect(screen.getByRole("columnheader", { name: fr.headers.fee })).toBeInTheDocument();
    const table = container.querySelector("table")!;
    expect(within(table).getByText("S1").closest("tr")).toHaveTextContent(fr.meaning.notCharged);
    expect(within(table).getByText("D2").closest("tr")).toHaveTextContent("0,75 %");
  });

  it("reads in Arabic", () => {
    const ar = (messagesFor("ar").pricing as TableMessages).table;
    const { container } = renderIntl(<PricingTable />, { locale: "ar" });
    expect(screen.getByRole("columnheader", { name: ar.headers.paidBy })).toBeInTheDocument();
    const table = container.querySelector("table")!;
    expect(within(table).getByText("S2").closest("tr")).toHaveTextContent(ar.meaning.notCharged);
    expect(within(table).getByText("D1").closest("tr")).toHaveTextContent("درهم");
  });
});

describe("pricing page content", () => {
  it("has the 'what you don't pay' block, the notice and the calculator link", () => {
    renderIntl(<PricingPageContent />);
    expect(screen.getByRole("heading", { level: 1, name: "One property, three ways to invest" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /What you don.t pay/ })).toBeInTheDocument();
    expect(screen.getByText(INDICATIVE_NOTICE)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /calculator/i })).toHaveAttribute("href", "/calculator");
    expect(screen.getByRole("link", { name: /FAQ/ })).toHaveAttribute("href", "/faq");
  });

  it("prefixes internal links with the language", () => {
    renderIntl(<PricingPageContent />, { locale: "fr" });
    expect(screen.getByRole("link", { name: /calculateur/i })).toHaveAttribute("href", "/fr/calculator");
    expect(screen.getByRole("link", { name: /FAQ/ })).toHaveAttribute("href", "/fr/faq");
  });

  it("drops the old plan tiers, the 1,000 MAD minimum and every promotion", () => {
    const { container } = renderIntl(<PricingPageContent />);
    const text = container.textContent ?? "";
    expect(text).not.toMatch(/1,000 MAD/);
    expect(text).not.toMatch(/Discovery|Premium|Get Started/);
    expect(text).not.toMatch(/founding|referral|waived|priority in allocation/i);
  });
});
