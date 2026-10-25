import { describe, expect, it } from "vitest";
import { screen, within } from "@testing-library/react";
import { FEE_LINES, INDICATIVE_NOTICE, LIMITS, feeLinesForTicket, formatMad } from "@/lib/finance";
import PricingTable from "@/components/pricing/PricingTable";
import PricingPageContent from "@/components/pricing/PricingPageContent";
import { messagesFor, renderIntl } from "@/lib/__tests__/helpers/intl";

type TableMessages = { table: { headers: { fee: string; paidBy: string }; meaning: { notCharged: string } } };

describe("PricingTable", () => {
  it("has one row per fee line: seven", () => {
    const { container } = renderIntl(<PricingTable />);
    expect(FEE_LINES).toHaveLength(7);
    expect(container.querySelectorAll("tbody tr")).toHaveLength(7);
    for (const line of FEE_LINES) {
      const lines = (messagesFor("en").pricing as unknown as { table: { lines: Record<string, { label: string }> } }).table.lines;
      expect(screen.getAllByText(lines[line.code].label).length).toBeGreaterThan(0);
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

  it("shows D1 as 1.5% + VAT (never rounded to 2%), worth 450 MAD on 25,000 MAD", () => {
    const { container } = renderIntl(<PricingTable />);
    const d1Row = within(container.querySelector("table")!).getByText("D1").closest("tr")!;
    expect(d1Row).toHaveTextContent(/1\.5\s%\s\+\s20\s%\sVAT/);
    expect(d1Row.textContent).not.toMatch(/(^|[^d.])2 ?%/);
    expect(d1Row).toHaveTextContent("450 MAD incl. VAT");
    expect(d1Row).toHaveTextContent("Investor, at subscription");
  });

  it("has no operator structuring row (S2) and no analytics row", () => {
    const { container } = renderIntl(<PricingTable />);
    const text = container.textContent ?? "";
    expect(within(container.querySelector("table")!).queryByText("S2")).toBeNull();
    expect(text).not.toMatch(/structuring.*operator|master-lease|Analytics/i);
  });

  it("says the seller fee is not charged to the investor", () => {
    const { container } = renderIntl(<PricingTable />);
    for (const code of ["S1"]) {
      const row = within(container.querySelector("table")!).getByText(code).closest("tr")!;
      expect(row).toHaveTextContent("Not charged to you");
    }
  });

  it("shows the dossier fee as nothing to pay", () => {
    const { container } = renderIntl(<PricingTable />);
    const d6 = within(container.querySelector("table")!).getByText("D6").closest("tr")!;
    expect(d6).toHaveTextContent("Nothing to pay");
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
    expect(within(table).getByText("S1").closest("tr")).toHaveTextContent(ar.meaning.notCharged);
    expect(within(table).getByText("D1").closest("tr")).toHaveTextContent("درهم");
  });
});

describe("pricing page content", () => {
  it("has the 'what you don't pay' block, the notice and the calculator link", () => {
    renderIntl(<PricingPageContent />);
    expect(screen.getByRole("heading", { level: 1, name: "One fee for you, the rest inside the company" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /What you pay, and what you don.t/ })).toBeInTheDocument();
    expect(
      screen.getByText(/You pay one fee yourself: a structuring fee of 1\.5\s%\s\+ VAT when you subscribe \(450\sMAD on 25,000\sMAD\)\. Everything else is taken inside the property company before you are paid\./),
    ).toBeInTheDocument();
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
    expect(text).not.toMatch(/Discovery|Premium|Get Started|Family Circle|Institutional|analytics/i);
    expect(text).not.toMatch(/founding|referral|waived|priority in allocation/i);
  });
});
