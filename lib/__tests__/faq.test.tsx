import { describe, expect, it } from "vitest";
import { fireEvent, screen, within } from "@testing-library/react";

import FaqPageContent from "@/components/faq/FaqPageContent";
import { messagesFor, renderIntl } from "@/lib/__tests__/helpers/intl";

type FaqMessages = {
  categories: Record<string, string>;
  explorer: { all: string; railLabel: string };
  items: Record<string, { q: string; a: string }>;
  still: { title: string; applyBeta: string; joinWaitlist: string };
};
const faqMessages = (locale: "en" | "fr" | "ar") => messagesFor(locale).faq as FaqMessages;

const TOTAL = 13;
const rail = () => screen.getByRole("navigation", { name: /question categories/i });
const questionButtons = (container: HTMLElement) => container.querySelectorAll("[data-faq-item] h3 button");

describe("/faq explorer", () => {
  it("keeps all thirteen questions", () => {
    const { container } = renderIntl(<FaqPageContent />);
    expect(questionButtons(container)).toHaveLength(TOTAL);
    expect(Object.keys(faqMessages("en").items)).toHaveLength(TOTAL);
    expect(screen.getByRole("button", { name: "Can IGUDAR promise me a return?" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "How does payment work?" })).toBeInTheDocument();
  });

  it("has a category rail with counts that add up to the total", () => {
    renderIntl(<FaqPageContent />);
    const buttons = within(rail()).getAllByRole("button");
    const counts = buttons.map((b) => Number(b.querySelector("[data-count]")!.textContent));
    expect(buttons[0]).toHaveTextContent("All");
    expect(counts[0]).toBe(TOTAL);
    expect(counts.slice(1).reduce((a, b) => a + b, 0)).toBe(TOTAL);
    expect(buttons.length).toBeGreaterThanOrEqual(4);
  });

  it("filters by category", () => {
    const { container } = renderIntl(<FaqPageContent />);
    const buttons = within(rail()).getAllByRole("button");
    const expected = Number(buttons[1].querySelector("[data-count]")!.textContent);
    fireEvent.click(buttons[1]);
    expect(buttons[1]).toHaveAttribute("aria-pressed", "true");
    expect(questionButtons(container)).toHaveLength(expected);
    fireEvent.click(buttons[0]);
    expect(questionButtons(container)).toHaveLength(TOTAL);
  });

  it("filters as you type and highlights the matches", () => {
    const { container } = renderIntl(<FaqPageContent />);
    fireEvent.change(screen.getByRole("searchbox", { name: /search the questions/i }), { target: { value: "escrow" } });
    const shown = questionButtons(container).length;
    expect(shown).toBeGreaterThan(0);
    expect(shown).toBeLessThan(TOTAL);
    const marks = Array.from(container.querySelectorAll("[data-faq-item] mark"));
    expect(marks.length).toBeGreaterThan(0);
    for (const m of marks) expect(m.textContent?.toLowerCase()).toBe("escrow");
    expect(screen.getByRole("status")).toHaveTextContent(`${shown} of ${TOTAL}`);
  });

  it("says so when nothing matches and recovers when cleared", () => {
    const { container } = renderIntl(<FaqPageContent />);
    const box = screen.getByRole("searchbox", { name: /search the questions/i });
    fireEvent.change(box, { target: { value: "zzzzqqq" } });
    expect(questionButtons(container)).toHaveLength(0);
    expect(screen.getByRole("status")).toHaveTextContent(/no question/i);
    fireEvent.change(box, { target: { value: "" } });
    expect(questionButtons(container)).toHaveLength(TOTAL);
  });

  it("treats the query as plain text, not a pattern", () => {
    const { container } = renderIntl(<FaqPageContent />);
    fireEvent.change(screen.getByRole("searchbox", { name: /search the questions/i }), { target: { value: "(.*" } });
    expect(questionButtons(container)).toHaveLength(0);
  });

  it("opens and closes an answer with a chevron button", () => {
    renderIntl(<FaqPageContent />);
    const q = screen.getByRole("button", { name: "What happens if the raise fails?" });
    expect(q).toHaveAttribute("aria-expanded", "false");
    expect(q.querySelector("svg")).not.toBeNull();
    fireEvent.click(q);
    expect(q).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText(/the bank refunds you in full/)).toBeInTheDocument();
  });

  it("ends with 'Still have a question?' and the two approved CTAs", () => {
    renderIntl(<FaqPageContent />);
    const card = within(screen.getByRole("heading", { name: "Still have a question?" }).parentElement as HTMLElement);
    expect(card.getByRole("link", { name: "Apply for beta" })).toHaveAttribute("href", "https://app.igudar.tech/auth/register");
    expect(card.getByRole("button", { name: "Join the waitlist" })).toBeInTheDocument();
    expect(card.getAllByRole("link").length + card.getAllByRole("button").length).toBe(2);
    expect(screen.queryByText(/Access the demo/)).toBeNull();
  });
});

describe("/faq in the other languages", () => {
  it("reads in French and searches the French text", () => {
    const fr = faqMessages("fr");
    const { container } = renderIntl(<FaqPageContent />, { locale: "fr" });
    expect(screen.getByRole("heading", { name: fr.still.title })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: fr.items.promise.q })).toBeInTheDocument();
    const railFr = screen.getByRole("navigation", { name: fr.explorer.railLabel });
    expect(within(railFr).getAllByRole("button")[0]).toHaveTextContent(fr.explorer.all);
    expect(within(railFr).getByText(fr.categories.returns)).toBeInTheDocument();
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "séquestre" } });
    const shown = questionButtons(container).length;
    expect(shown).toBeGreaterThan(0);
    expect(shown).toBeLessThan(TOTAL);
    expect(screen.getByRole("link", { name: fr.still.applyBeta })).toHaveAttribute("href", "https://app.igudar.tech/auth/register");
  });

  it("reads in Arabic and searches the Arabic text", () => {
    const ar = faqMessages("ar");
    const { container } = renderIntl(<FaqPageContent />, { locale: "ar" });
    expect(screen.getByRole("heading", { name: ar.still.title })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: ar.items.payment.q })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: ar.still.joinWaitlist })).toBeInTheDocument();
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "حساب ضمان" } });
    const shown = questionButtons(container).length;
    expect(shown).toBeGreaterThan(0);
    expect(shown).toBeLessThan(TOTAL);
    expect(container.textContent).not.toMatch(/\bMAD\b/);
  });
});
