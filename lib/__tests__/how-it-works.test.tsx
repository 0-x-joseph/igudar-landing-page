import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { LIMITS, formatMad, simulate } from "@/lib/finance";

vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

import HowItWorksSection from "@/components/HowItWorksSection";

const nbsp = (s: string) => s.replace(/\s/g, " ");
const region = (container: HTMLElement, name: string) => container.querySelector(`[data-region="${name}"]`) as SVGElement;

describe("#how-it-works granary", () => {
  it("keeps every approved sentence of the four ideas", () => {
    const { container } = render(<HowItWorksSection />);
    const text = nbsp(container.textContent ?? "");
    for (const sentence of [
      "The igudar were the Amazigh collective granaries: one strong building that many families raised and guarded together.",
      "A property bought through IGUDAR works the same way. One building, many owners.",
      "Each family kept its own chamber, marked and remembered.",
      "You hold shares of the company that owns the property, a defined and recorded part, never an unwritten promise.",
      "A granary needed a keeper everyone trusted.",
      "Here, a regulated bank holds your money in escrow, and a professional operator rents and looks after the property.",
      "Everyone agreed the rules before the first harvest.",
      "Ours are written in the shareholders' agreement, and the fee grid is published in full, the same for everyone.",
      "An old idea, built for today",
      "Follow every dirham",
    ]) {
      expect(text).toContain(nbsp(sentence));
    }
  });

  it("draws one granary with four regions, the first lit by default", () => {
    const { container } = render(<HowItWorksSection />);
    expect(container.querySelectorAll("[data-granary]")).toHaveLength(1);
    expect(["building", "chamber", "keeper", "rules"].map((n) => region(container, n).getAttribute("data-active"))).toEqual([
      "true",
      "false",
      "false",
      "false",
    ]);
  });

  it("hovering a card highlights its chamber in the sketch", () => {
    const { container } = render(<HowItWorksSection />);
    const cards = container.querySelectorAll("[data-pillar]");
    expect(cards).toHaveLength(4);
    fireEvent.mouseEnter(cards[1]);
    expect(region(container, "chamber")).toHaveAttribute("data-active", "true");
    expect(region(container, "building")).toHaveAttribute("data-active", "false");
    fireEvent.focus(cards[3]);
    expect(region(container, "rules")).toHaveAttribute("data-active", "true");
    expect(region(container, "chamber")).toHaveAttribute("data-active", "false");
  });

  it("gives phones a tab strip that steps through the four ideas", () => {
    const { container } = render(<HowItWorksSection />);
    const tabs = within(screen.getByRole("tablist", { name: /four ideas/i })).getAllByRole("tab");
    expect(tabs).toHaveLength(4);
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    fireEvent.click(tabs[2]);
    expect(tabs[2]).toHaveAttribute("aria-selected", "true");
    expect(tabs[0]).toHaveAttribute("aria-selected", "false");
    expect(region(container, "keeper")).toHaveAttribute("data-active", "true");
    expect(container.querySelectorAll("[data-pillar]")[2]).toHaveAttribute("data-active", "true");
  });

  it("gives each idea a violet picto and an 'In IGUDAR' line made of approved words", () => {
    const { container } = render(<HowItWorksSection />);
    for (const card of Array.from(container.querySelectorAll("[data-pillar]"))) {
      expect(card.querySelector("[data-pillar-icon]")!.className).toContain("text-primary");
      expect(card.querySelector("[data-in-igudar]")).not.toBeNull();
      expect(card).toHaveTextContent("In IGUDAR");
    }
  });

  it("keeps the wallet with three counted figures from the engine and draws the dirham path", () => {
    const { container } = render(<HowItWorksSection />);
    const sim = simulate({ ticketMad: LIMITS.MIN_TICKET_MAD, scenario: "base" });
    const wallet = container.querySelector("figure") as HTMLElement;
    expect(wallet).toHaveTextContent(nbsp(formatMad(sim.netCashYear1Mad)));
    expect(wallet.querySelectorAll("[data-counted]").length).toBe(3);
    expect(container.querySelector("[data-dirham-path]")).not.toBeNull();
    expect(container.querySelector("[data-dirham-path] path")!.getAttribute("d")).toBeTruthy();
  });

  it("does not repeat the escrow flow diagram (that lives in 'How your money moves')", () => {
    const { container } = render(<HowItWorksSection />);
    expect(container.querySelector("[data-money-flow]")).toBeNull();
    expect(container.textContent).not.toContain("Full refund");
  });
});
