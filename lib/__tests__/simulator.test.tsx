import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { INDICATIVE_NOTICE, LIMITS } from "@/lib/finance";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/",
}));
vi.mock("@/components/Navbar", () => ({ default: () => <nav data-testid="navbar" /> }));
vi.mock("@/components/SiteFooter", () => ({ default: () => <footer data-testid="footer" /> }));

import { HeroSimulator } from "@/components/simulator/HeroSimulator";
import { Simulator } from "@/components/simulator/Simulator";
import SimulatorPage from "@/app/simulator/page";
import CalculatorPage from "@/app/calculator/page";
import WalletIllustration from "@/components/WalletIllustration";
import { TRACK_EVENT_NAME, track } from "@/lib/analytics";

// Testing Library collapses NBSP into a plain space, so matchers use plain spaces.
const nbsp = (s: string) => s;

describe("HeroSimulator", () => {
  it("shows the Base numbers for 25,000 MAD", () => {
    render(<HeroSimulator />);
    expect(screen.getByText(nbsp("1,122.51 MAD"))).toBeInTheDocument();
    expect(screen.getByText(nbsp("4,246.26 MAD"))).toBeInTheDocument();
    expect(screen.getByText(nbsp("3,423.45 MAD"))).toBeInTheDocument();
  });

  it("carries the entry-ticket headline, the full-simulator link and the notice", () => {
    render(<HeroSimulator />);
    expect(
      screen.getByRole("heading", { name: /Own real, rented property alongside professionals, from 25,000/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Open the full simulator/ })).toHaveAttribute("href", "/simulator");
    expect(screen.getByText(INDICATIVE_NOTICE)).toBeInTheDocument();
  });

  it("cannot go below 25,000 and steps by 5,000", () => {
    render(<HeroSimulator />);
    const input = screen.getByLabelText("If I put in") as HTMLInputElement;
    expect(input.value).toBe("25000");
    expect(screen.getByRole("button", { name: /Decrease amount/ })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: /Increase amount/ }));
    expect(input.value).toBe("30000");

    fireEvent.change(input, { target: { value: "10000" } });
    fireEvent.blur(input);
    expect(input.value).toBe("25000");
  });

  it("updates the figures when the amount changes", async () => {
    render(<HeroSimulator />);
    fireEvent.click(screen.getByRole("button", { name: /Increase amount/ }));
    await waitFor(() => expect(screen.queryByText(nbsp("1,122.51 MAD"))).not.toBeInTheDocument());
    // 30,000 MAD at Base: 1,122.51 * 1.2
    await waitFor(() => expect(screen.getByText(nbsp("1,347.01 MAD"))).toBeInTheDocument());
  });
});

describe("Simulator", () => {
  it("shows the big numbers for 25,000 MAD Base, each with an explainer", () => {
    render(<Simulator />);
    expect(screen.getAllByText(nbsp("1,122.51 MAD")).length).toBeGreaterThan(0);
    expect(screen.getAllByText(nbsp("4,246.26 MAD")).length).toBeGreaterThan(0);
    expect(screen.getAllByText(nbsp("3.47 %")).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: /What does .* mean\?/ })).toHaveLength(4);
  });

  it("exposes a slider and an input limited to 25,000 minimum in 5,000 steps", () => {
    render(<Simulator />);
    const slider = screen.getByLabelText(/Amount slider/) as HTMLInputElement;
    expect(slider).toHaveAttribute("min", String(LIMITS.MIN_TICKET_MAD));
    expect(slider).toHaveAttribute("max", String(LIMITS.MAX_PER_PROJECT_MAD));
    expect(slider).toHaveAttribute("step", String(LIMITS.TICKET_STEP_MAD));

    const input = screen.getByLabelText("Amount to simulate") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "5000" } });
    fireEvent.blur(input);
    expect(input.value).toBe("25000");

    fireEvent.change(slider, { target: { value: "100000" } });
    expect(input.value).toBe("100000");
  });

  it("says a bank deposit would have earned more in the Pessimistic scenario", () => {
    render(<Simulator />);
    expect(screen.queryByText(/a bank deposit would have earned more/i)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("radio", { name: "Pessimistic" }));
    expect(screen.getByText(/In this scenario a bank deposit would have earned more\./)).toBeInTheDocument();
  });

  it("always shows the pessimistic result next to the chosen scenario", () => {
    render(<Simulator />);
    const compare = screen.getByRole("region", { name: "The same amount in each scenario" });
    const cards = within(compare).getAllByRole("listitem");
    expect(cards[0]).toHaveTextContent("Pessimistic");
    expect(cards[0]).toHaveTextContent(nbsp("2,146.55 MAD"));
    expect(cards[0]).toHaveTextContent("Loses to a bank deposit");
    expect(cards[1]).toHaveAttribute("aria-current", "true");
  });

  it("keeps long figures inside their cards at the maximum ticket", () => {
    render(<Simulator />);
    const input = screen.getByLabelText("Amount to simulate") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "5000000" } });
    fireEvent.blur(input);
    expect(input.value).toBe("5000000");

    // BigNumbers: each card can shrink and its value wraps instead of overflowing.
    for (const button of screen.getAllByRole("button", { name: /What does .* mean\?/ })) {
      const card = button.closest("div.rounded-3xl");
      expect(card?.className).toMatch(/min-w-0/);
      expect(card?.querySelector("p.financial-number")?.className).toMatch(/break-words/);
    }

    // ScenarioCompare: each scenario card can shrink and its values wrap.
    const compare = screen.getByRole("region", { name: "The same amount in each scenario" });
    for (const card of within(compare).getAllByRole("listitem")) {
      expect((card as HTMLElement).className).toMatch(/min-w-0/);
      for (const dd of Array.from(card.querySelectorAll("dd"))) {
        expect((dd as HTMLElement).className).toMatch(/break-words/);
      }
    }

    // BankComparison: labels shrink while figures stay on one line.
    const bank = screen.getByRole("region", { name: "Versus a bank deposit" });
    for (const value of Array.from(bank.querySelectorAll("span.financial-number"))) {
      expect((value as HTMLElement).className).toMatch(/whitespace-nowrap/);
      expect((value as HTMLElement).className).toMatch(/shrink-0/);
    }

    // FeesTable: amounts wrap instead of overflowing.
    const fees = screen.getByRole("region", { name: "What you pay IGUDAR" });
    for (const amount of Array.from(fees.querySelectorAll("dd.financial-number"))) {
      expect((amount as HTMLElement).className).toMatch(/break-words/);
    }
  });

  it("hides each explainer in a hover tooltip that also opens on click", () => {
    render(<Simulator />);
    // Four (?) buttons, one per headline figure.
    const buttons = screen.getAllByRole("button", { name: /What does .* mean\?/ });
    expect(buttons).toHaveLength(4);
    for (const button of buttons) {
      const tooltip = button.parentElement?.querySelector('[role="tooltip"]') as HTMLElement;
      expect(tooltip).toBeInTheDocument();
      // Hidden until hovered, focused or tapped.
      expect(tooltip.className).toMatch(/invisible/);
      expect(tooltip.className).toMatch(/group-hover:visible/);
      expect(tooltip.className).toMatch(/group-focus-within:visible/);
      // Tapping pins it open (touch devices).
      fireEvent.click(button);
      expect(button).toHaveAttribute("aria-expanded", "true");
      expect(tooltip.className).toMatch(/visible opacity-100/);
    }
  });

  it("notes that business angels are not capped above 500,000", () => {
    render(<Simulator />);
    const input = screen.getByLabelText("Amount to simulate") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "750000" } });
    fireEvent.blur(input);
    expect(input.value).toBe("750000");
    expect(screen.getByText(/Business angels are not capped\./)).toBeInTheDocument();
  });

  it("opens an explainer as an accessible disclosure", () => {
    const events: unknown[] = [];
    const listener = (e: Event) => events.push((e as CustomEvent).detail);
    window.addEventListener(TRACK_EVENT_NAME, listener);
    render(<Simulator />);
    const button = screen.getAllByRole("button", { name: /What does "Net IRR" mean\?/ })[0];
    expect(button).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(events).toContainEqual({ event: "sim_explainer_open", props: { topic: "net_irr" } });
    window.removeEventListener(TRACK_EVENT_NAME, listener);
  });

  it("never pre-checks the consent box and blocks submit until it is ticked", () => {
    render(<Simulator />);
    const consent = screen.getByRole("checkbox") as HTMLInputElement;
    expect(consent.checked).toBe(false);
    expect(screen.getByRole("button", { name: "Note my interest" })).toBeDisabled();
  });

  it("splits 100 MAD of rent into labelled parts that include 'You'", () => {
    render(<Simulator />);
    const section = screen.getByRole("region", { name: "Where your rent goes" });
    const parts = within(section).getByRole("img");
    expect(parts.getAttribute("aria-label")).toMatch(/Reserve and vacancy .*IGUDAR platform fee .*Corporate tax .*Withholding tax .*You /);
  });
});

describe("pages that show numbers carry the indicative notice", () => {
  it("/simulator", () => {
    render(<SimulatorPage />);
    expect(screen.getByText(INDICATIVE_NOTICE)).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("/calculator", () => {
    render(<CalculatorPage />);
    expect(screen.getByText(INDICATIVE_NOTICE)).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("the home hero widget", () => {
    render(<HeroSimulator />);
    expect(screen.getByText(INDICATIVE_NOTICE)).toBeInTheDocument();
  });
});

describe("/calculator", () => {
  it("shows 0.5 % ownership and 200 investors for 25,000 MAD of 5,000,000", () => {
    render(<CalculatorPage />);
    expect(screen.getByText(nbsp("0.500 %"))).toBeInTheDocument();
    expect(screen.getByText("200")).toBeInTheDocument();
  });

  it("is only the ownership calculator: no fee grid, early-exit or caps sections", () => {
    render(<CalculatorPage />);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(screen.getByLabelText("Your amount")).toBeInTheDocument();
    for (const gone of [/who pays what/i, /early exit calculator/i, /caps checker/i]) {
      expect(screen.queryByRole("heading", { name: gone })).toBeNull();
    }
    expect(screen.queryByRole("checkbox")).toBeNull();
    expect(screen.queryByText(/to confirm with counsel/)).toBeNull();
  });
});

describe("/simulator", () => {
  it("no longer shows the cumulative cash chart card", () => {
    render(<SimulatorPage />);
    expect(screen.queryByText(/your cash, year by year/i)).toBeNull();
    expect(screen.getAllByText("Net cash per year").length).toBeGreaterThan(0);
  });
});

describe("WalletIllustration", () => {
  it("is labelled as an illustration and shows the 25,000 MAD Base numbers", () => {
    render(<WalletIllustration />);
    expect(screen.getByText("Illustration — demo data")).toBeInTheDocument();
    for (const label of ["Committed", "In escrow", "Invested", "Received"]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
    expect(screen.getByText(nbsp("1,122.51 MAD"))).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});

describe("track", () => {
  it("dispatches a window event and carries no extra data", () => {
    const seen: unknown[] = [];
    const listener = (e: Event) => seen.push((e as CustomEvent).detail);
    window.addEventListener(TRACK_EVENT_NAME, listener);
    track("calc_view");
    window.removeEventListener(TRACK_EVENT_NAME, listener);
    expect(seen).toEqual([{ event: "calc_view", props: {} }]);
  });
});
