import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { LIMITS } from "@/lib/finance";
import { messagesFor, renderIntl } from "@/lib/__tests__/helpers/intl";

// Partial mock: next-intl's navigation helpers also need the real `redirect` family at import time.
vi.mock(import("next/navigation"), async (importOriginal) => ({
  ...(await importOriginal()),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }) as never,
  usePathname: () => "/",
}));
vi.mock("@/components/Navbar", () => ({ default: () => <nav data-testid="navbar" /> }));
vi.mock("@/components/SiteFooter", () => ({ default: () => <footer data-testid="footer" /> }));

import { HeroSimulator } from "@/components/simulator/HeroSimulator";
import { Simulator } from "@/components/simulator/Simulator";
import { TicketField } from "@/components/simulator/TicketField";
import { InterestCapture } from "@/components/simulator/InterestCapture";
import { SimulatorPageContent } from "@/components/simulator/SimulatorPageContent";
import { CalculatorPageContent } from "@/components/calculator/CalculatorPageContent";
import WalletIllustration from "@/components/WalletIllustration";
import { TRACK_EVENT_NAME, track } from "@/lib/analytics";

// Testing Library collapses NBSP into a plain space, so matchers use plain spaces.
const nbsp = (s: string) => s;

interface Dict {
  [key: string]: Dict | string;
}
/** Reads one message by dotted path from `messages/<locale>/<area>.json`, so tests never retype copy. */
function message(locale: "en" | "fr" | "ar", area: "common" | "simulator" | "calculator" | "beta", path: string): string {
  const value = path.split(".").reduce<Dict | string>((acc, key) => (acc as Dict)[key], messagesFor(locale)[area] as Dict);
  if (typeof value !== "string") throw new Error(`${locale}/${area}.json: ${path} is not a string`);
  return value;
}
const INDICATIVE_NOTICE = message("en", "common", "notice.indicative");

describe("HeroSimulator", () => {
  it("shows the Base numbers for 25,000 MAD", () => {
    renderIntl(<HeroSimulator />);
    expect(screen.getByText(nbsp("1,122.51 MAD"))).toBeInTheDocument();
    expect(screen.getByText(nbsp("4,246.26 MAD"))).toBeInTheDocument();
    expect(screen.getByText(nbsp("3,423.45 MAD"))).toBeInTheDocument();
  });

  it("carries the entry-ticket headline, the full-simulator link and the notice", () => {
    renderIntl(<HeroSimulator />);
    expect(
      screen.getByRole("heading", { name: /Own real, rented property alongside professionals, from 25,000/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Open the full simulator/ })).toHaveAttribute("href", "/simulator");
    expect(screen.getByText(INDICATIVE_NOTICE)).toBeInTheDocument();
  });

  it("cannot go below 25,000 and steps by 5,000", () => {
    renderIntl(<HeroSimulator />);
    const input = screen.getByLabelText("If I put in") as HTMLInputElement;
    expect(input.value).toBe("25,000");
    expect(screen.getByRole("button", { name: /Decrease amount/ })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: /Increase amount/ }));
    expect(input.value).toBe("30,000");

    fireEvent.change(input, { target: { value: "10000" } });
    fireEvent.blur(input);
    expect(input.value).toBe("25,000");
  });

  it("updates the figures when the amount changes", async () => {
    renderIntl(<HeroSimulator />);
    fireEvent.click(screen.getByRole("button", { name: /Increase amount/ }));
    await waitFor(() => expect(screen.queryByText(nbsp("1,122.51 MAD"))).not.toBeInTheDocument());
    // 30,000 MAD at Base: 1,122.51 * 1.2
    await waitFor(() => expect(screen.getByText(nbsp("1,347.01 MAD"))).toBeInTheDocument());
  });

  it("links to the French simulator and prints French amounts when read in French", () => {
    renderIntl(<HeroSimulator />, { locale: "fr" });
    expect(screen.getByRole("link", { name: message("fr", "simulator", "hero.openFull") })).toHaveAttribute("href", "/fr/simulator");
    expect(screen.getByText(message("fr", "common", "notice.indicative"))).toBeInTheDocument();
    expect(screen.getAllByText(/1\.122,51 MAD/).length).toBeGreaterThan(0);
  });
});

describe("TicketField", () => {
  function Harness() {
    const [value, setValue] = useState<number>(LIMITS.MIN_TICKET_MAD);
    return <TicketField id="t" label="Amount" value={value} onChange={setValue} />;
  }

  it.each([
    ["25 000", "25,000"],
    ["30.000", "30,000"],
    ["30,000", "30,000"],
    ["٣٠٠٠٠", "30,000"],
    ["1 250 000,50", "1,250,000"],
  ])("reads %s as %s", (typed, shown) => {
    renderIntl(<Harness />);
    const input = screen.getByLabelText("Amount") as HTMLInputElement;
    fireEvent.change(input, { target: { value: typed } });
    fireEvent.blur(input);
    expect(input.value).toBe(shown);
  });

  it("shows the amount with the language's grouping and currency word", () => {
    renderIntl(<Harness />, { locale: "ar" });
    const input = screen.getByLabelText("Amount") as HTMLInputElement;
    expect(input.value).toMatch(/^25[ .,]000$/);
    expect(screen.getByText(message("ar", "simulator", "ticket.currency"))).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /زيادة المبلغ/ })).toBeInTheDocument();
  });
});

describe("Simulator", () => {
  it("shows the big numbers for 25,000 MAD Base, each with an explainer", () => {
    renderIntl(<Simulator />);
    expect(screen.getAllByText(nbsp("1,122.51 MAD")).length).toBeGreaterThan(0);
    expect(screen.getAllByText(nbsp("4,246.26 MAD")).length).toBeGreaterThan(0);
    expect(screen.getAllByText(nbsp("3.47 %")).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: /What does .* mean\?/ })).toHaveLength(4);
  });

  it("exposes a slider and an input limited to 25,000 minimum in 5,000 steps", () => {
    renderIntl(<Simulator />);
    const slider = screen.getByLabelText(/Amount slider/) as HTMLInputElement;
    expect(slider).toHaveAttribute("min", String(LIMITS.MIN_TICKET_MAD));
    expect(slider).toHaveAttribute("max", String(LIMITS.MAX_PER_PROJECT_MAD));
    expect(slider).toHaveAttribute("step", String(LIMITS.TICKET_STEP_MAD));

    const input = screen.getByLabelText("Amount to simulate") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "5000" } });
    fireEvent.blur(input);
    expect(input.value).toBe("25,000");

    fireEvent.change(slider, { target: { value: "100000" } });
    expect(input.value).toBe("100,000");
  });

  it("describes each scenario's assumptions from the model", () => {
    renderIntl(<Simulator />);
    expect(screen.getByText(/8\.00 % gross rental yield · no vacancy/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("radio", { name: "Pessimistic" }));
    expect(screen.getByText(/5 % vacancy or operator default/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("radio", { name: "Optimistic" }));
    expect(screen.getByText(/rent indexed 1 %\/yr/)).toBeInTheDocument();
  });

  it("says a bank deposit would have earned more in the Pessimistic scenario", () => {
    renderIntl(<Simulator />);
    expect(screen.queryByText(/a bank deposit would have earned more/i)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("radio", { name: "Pessimistic" }));
    expect(screen.getByText(/In this scenario a bank deposit would have earned more\./)).toBeInTheDocument();
  });

  it("always shows the pessimistic result next to the chosen scenario", () => {
    renderIntl(<Simulator />);
    const compare = screen.getByRole("region", { name: "The same amount in each scenario" });
    const cards = within(compare).getAllByRole("listitem");
    expect(cards[0]).toHaveTextContent("Pessimistic");
    expect(cards[0]).toHaveTextContent(nbsp("2,146.55 MAD"));
    expect(cards[0]).toHaveTextContent("Loses to a bank deposit");
    expect(cards[1]).toHaveAttribute("aria-current", "true");
  });

  it("keeps long figures inside their cards at the maximum ticket", () => {
    renderIntl(<Simulator />);
    const input = screen.getByLabelText("Amount to simulate") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "5000000" } });
    fireEvent.blur(input);
    expect(input.value).toBe("5,000,000");

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
    renderIntl(<Simulator />);
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
      // Anchored to the end side so it mirrors in Arabic.
      expect(tooltip.className).toMatch(/\bend-0\b/);
      // Tapping pins it open (touch devices).
      fireEvent.click(button);
      expect(button).toHaveAttribute("aria-expanded", "true");
      expect(tooltip.className).toMatch(/visible opacity-100/);
    }
  });

  it("notes that business angels are not capped above 500,000", () => {
    renderIntl(<Simulator />);
    const input = screen.getByLabelText("Amount to simulate") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "750000" } });
    fireEvent.blur(input);
    expect(input.value).toBe("750,000");
    expect(screen.getByText(/Business angels are not capped\./)).toBeInTheDocument();
  });

  it("opens an explainer as an accessible disclosure", () => {
    const events: unknown[] = [];
    const listener = (e: Event) => events.push((e as CustomEvent).detail);
    window.addEventListener(TRACK_EVENT_NAME, listener);
    renderIntl(<Simulator />);
    const button = screen.getAllByRole("button", { name: /What does "Net IRR" mean\?/ })[0];
    expect(button).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(events).toContainEqual({ event: "sim_explainer_open", props: { topic: "net_irr" } });
    window.removeEventListener(TRACK_EVENT_NAME, listener);
  });

  it("never pre-checks the consent box and blocks submit until it is ticked", () => {
    renderIntl(<Simulator />);
    const consent = screen.getByRole("checkbox") as HTMLInputElement;
    expect(consent.checked).toBe(false);
    expect(screen.getByRole("button", { name: "Note my interest" })).toBeDisabled();
  });

  it("splits 100 MAD of rent into labelled parts that include 'You'", () => {
    renderIntl(<Simulator />);
    const section = screen.getByRole("region", { name: "Where your rent goes" });
    const parts = within(section).getByRole("img");
    expect(parts.getAttribute("aria-label")).toMatch(/Reserve and vacancy .*IGUDAR platform fee .*Corporate tax .*Withholding tax .*You /);
    // Logical corners, so the first part is rounded on the start side in both directions.
    const bars = Array.from(parts.children) as HTMLElement[];
    expect(bars[0].className).toMatch(/rounded-s-2xl/);
    expect(bars[bars.length - 1].className).toMatch(/rounded-e-2xl/);
  });

  it("reads in French", () => {
    renderIntl(<Simulator />, { locale: "fr" });
    expect(screen.getByRole("heading", { name: message("fr", "simulator", "compare.title") })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: message("fr", "simulator", "bridge.title") })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: message("fr", "common", "scenarios.pessimistic") })).toBeInTheDocument();
    expect(screen.getAllByText(/1\.122,51 MAD/).length).toBeGreaterThan(0);
  });

  it("reads in Arabic", () => {
    renderIntl(<Simulator />, { locale: "ar" });
    expect(screen.getByRole("heading", { name: message("ar", "simulator", "compare.title") })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: message("ar", "simulator", "bridge.title") })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: message("ar", "common", "scenarios.pessimistic") })).toBeInTheDocument();
    expect(screen.getAllByText(/1\.122,51 درهم/).length).toBeGreaterThan(0);
  });
});

describe("InterestCapture", () => {
  // Only `fetch` is replaced: `vi.unstubAllGlobals()` would also drop the observer stubs from vitest.setup.ts.
  const realFetch = globalThis.fetch;
  afterEach(() => {
    globalThis.fetch = realFetch;
  });

  it.each(["en", "fr", "ar"] as const)("posts the %s locale with the unchanged payload", async (locale) => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    renderIntl(<InterestCapture amountMad={30_000} scenario="base" />, { locale });
    fireEvent.change(screen.getByRole("textbox", { name: message(locale, "simulator", "interest.email") }), {
      target: { value: "aya@example.com" },
    });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: message(locale, "simulator", "interest.submit") }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const body = JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string);
    expect(body).toMatchObject({ email: "aya@example.com", honeypot: "", amountMad: 30_000, scenario: "base", source: "simulator", locale });
    expect(typeof body.consentAt).toBe("string");
    await screen.findByText(message(locale, "simulator", "interest.doneTitle"));
  });

  it("turns an API error code into the visitor's language, and unknown codes into a generic line", async () => {
    const answers = [{ error: "rate_limited" }, { error: "Something the API should never say" }];
    globalThis.fetch = vi.fn().mockImplementation(async () => ({ ok: false, json: async () => answers.shift() })) as unknown as typeof fetch;
    renderIntl(<InterestCapture amountMad={25_000} scenario="base" />, { locale: "fr" });
    fireEvent.change(screen.getByRole("textbox", { name: message("fr", "simulator", "interest.email") }), { target: { value: "aya@example.com" } });
    fireEvent.click(screen.getByRole("checkbox"));
    const submit = screen.getByRole("button", { name: message("fr", "simulator", "interest.submit") });
    fireEvent.click(submit);
    expect(await screen.findByRole("alert")).toHaveTextContent(message("fr", "beta", "errors.rate_limited"));
    fireEvent.click(submit);
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(message("fr", "simulator", "interest.errorGeneric")));
  });
});

describe("pages that show numbers carry the indicative notice", () => {
  it("/simulator", () => {
    renderIntl(<SimulatorPageContent />);
    expect(screen.getByText(INDICATIVE_NOTICE)).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("/calculator", () => {
    renderIntl(<CalculatorPageContent />);
    expect(screen.getByText(INDICATIVE_NOTICE)).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("the home hero widget", () => {
    renderIntl(<HeroSimulator />);
    expect(screen.getByText(INDICATIVE_NOTICE)).toBeInTheDocument();
  });

  it("/simulator and /calculator in Arabic", () => {
    renderIntl(<SimulatorPageContent />, { locale: "ar" });
    expect(screen.getByRole("heading", { level: 1, name: message("ar", "simulator", "page.title") })).toBeInTheDocument();
    expect(screen.getByText(message("ar", "common", "notice.indicative"))).toBeInTheDocument();
  });
});

describe("/calculator", () => {
  it("shows 0.5 % ownership and 200 investors for 25,000 MAD of 5,000,000", () => {
    renderIntl(<CalculatorPageContent />);
    expect(screen.getByText(nbsp("0.500 %"))).toBeInTheDocument();
    expect(screen.getByText("200")).toBeInTheDocument();
    expect((screen.getByLabelText(/Project size/) as HTMLInputElement).value).toBe("5,000,000");
  });

  it("reads a project size typed with spaces or Arabic-Indic digits", async () => {
    renderIntl(<CalculatorPageContent />);
    const project = screen.getByLabelText(/Project size/) as HTMLInputElement;
    fireEvent.change(project, { target: { value: "٢ ٥٠٠ ٠٠٠" } });
    // The count eases to its new value over 200 ms.
    await waitFor(() => expect(screen.getByText("100")).toBeInTheDocument());
    fireEvent.blur(project);
    expect(project.value).toBe("2,500,000");
  });

  it("is only the ownership calculator: no fee grid, early-exit or caps sections", () => {
    renderIntl(<CalculatorPageContent />);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(screen.getByLabelText("Your amount")).toBeInTheDocument();
    for (const gone of [/who pays what/i, /early exit calculator/i, /caps checker/i]) {
      expect(screen.queryByRole("heading", { name: gone })).toBeNull();
    }
    expect(screen.queryByRole("checkbox")).toBeNull();
    expect(screen.queryByText(/to confirm with counsel/)).toBeNull();
  });

  it("reads in French with localised links", () => {
    renderIntl(<CalculatorPageContent />, { locale: "fr" });
    expect(screen.getByRole("heading", { level: 1, name: message("fr", "calculator", "page.title") })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /simulez un rendement/ })).toHaveAttribute("href", "/fr/simulator");
    expect(screen.getByText(/0,500 %/)).toBeInTheDocument();
  });

  it("reads in Arabic", () => {
    renderIntl(<CalculatorPageContent />, { locale: "ar" });
    expect(screen.getByRole("heading", { level: 1, name: message("ar", "calculator", "page.title") })).toBeInTheDocument();
    expect(screen.getByLabelText(message("ar", "calculator", "inputs.amountLabel"))).toBeInTheDocument();
  });
});

describe("/simulator", () => {
  it("no longer shows the cumulative cash chart card", () => {
    renderIntl(<SimulatorPageContent />);
    expect(screen.queryByText(/your cash, year by year/i)).toBeNull();
    expect(screen.getAllByText("Net cash per year").length).toBeGreaterThan(0);
  });
});

describe("WalletIllustration", () => {
  it("is labelled as an illustration and shows the 25,000 MAD Base numbers", () => {
    renderIntl(<WalletIllustration />);
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
