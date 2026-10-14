import { afterEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { readFileSync } from "node:fs";
import path from "node:path";
import { messagesFor, renderIntl } from "@/lib/__tests__/helpers/intl";

const mockPath = vi.hoisted(() => ({ current: "/" }));
const scrollSpy = vi.hoisted(() => vi.fn());
const reduced = vi.hoisted(() => ({ on: false }));

// framer caches the media query once per page, so the test flips this flag instead of matchMedia.
vi.mock("framer-motion", async (importOriginal) => ({
  ...(await importOriginal<typeof import("framer-motion")>()),
  useReducedMotion: () => reduced.on,
}));

// ScrollToTop reads next/navigation directly.
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => mockPath.current,
  useParams: () => ({}),
  redirect: vi.fn(),
  permanentRedirect: vi.fn(),
}));
vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

import { CountUp } from "@/components/CountUp";
import ScrollToTop from "@/components/ScrollToTop";
import BackedBySection from "@/components/BackedBySection";
import FactsSection from "@/components/FactsSection";
import FinalCtaSection from "@/components/FinalCtaSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import LandingHero from "@/components/LandingHero";
import Navbar from "@/components/Navbar";
import PainPointsSection from "@/components/PainPointsSection";
import SiteFooter from "@/components/SiteFooter";
import { HeroSimulator } from "@/components/simulator/HeroSimulator";
import { BuildingSketch, ZELLIGE_CORNER_CLASS } from "@/components/brand";

const REGISTER = "https://app.igudar.tech/auth/register";
const root = path.resolve(__dirname, "../..");
const read = (p: string) => readFileSync(path.join(root, p), "utf8");

class IntersectingIO {
  constructor(private cb: IntersectionObserverCallback) {}
  observe(el: Element) {
    this.cb([{ isIntersecting: true, target: el } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
  }
  unobserve() {}
  disconnect() {}
}

function mockReducedMotion(reduce: boolean) {
  reduced.on = reduce;
}

class QuietIO {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

const RAF_ONLY = { toFake: ["requestAnimationFrame" as const, "cancelAnimationFrame" as const, "performance" as const] };

afterEach(() => {
  vi.useRealTimers();
  vi.stubGlobal("IntersectionObserver", QuietIO);
  mockReducedMotion(false);
  mockPath.current = "/";
});

describe("edit 1 + 3: hero", () => {
  it("offers Beta access to the register link, keeps the prototype wording, drops the yield sentence", () => {
    renderIntl(<LandingHero />);
    expect(screen.getByRole("link", { name: "Beta access" })).toHaveAttribute("href", REGISTER);
    expect(screen.queryByRole("link", { name: "Access the demo" })).toBeNull();
    expect(screen.getByRole("link", { name: "Join the waitlist" })).toBeInTheDocument();
    expect(screen.getByText(/prototype/i)).toBeInTheDocument();
    expect(screen.queryByText(/indicative net cash yield/i)).toBeNull();
  });

  it("reads the headline and the minimum ticket from the engine, in English", () => {
    renderIntl(<LandingHero />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Real property. Real rent. Clear rules.");
    expect(screen.getByText(/from 25,000 MAD\./)).toBeInTheDocument();
  });
});

describe("edit 2: navbar", () => {
  it("has a primary Beta access button next to Join the waitlist, and both in the mobile menu", () => {
    renderIntl(<Navbar />);
    const beta = screen.getAllByRole("link", { name: "Beta access" });
    expect(beta).toHaveLength(1);
    expect(beta[0]).toHaveAttribute("href", REGISTER);
    expect(beta[0].className).toContain("bg-primary");
    expect(screen.getAllByRole("button", { name: "Join the waitlist" })).toHaveLength(1);

    fireEvent.click(screen.getByRole("button", { name: "Toggle menu" }));
    expect(screen.getAllByRole("link", { name: "Beta access" })).toHaveLength(2);
    expect(screen.getAllByRole("button", { name: "Join the waitlist" })).toHaveLength(2);
  });

  it("carries a language switcher in the desktop bar and in the mobile menu, and locale-aware page links", () => {
    const { container } = renderIntl(<Navbar />);
    expect(container.querySelectorAll("[data-language-switcher]")).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "Toggle menu" }));
    expect(container.querySelectorAll("[data-language-switcher]")).toHaveLength(2);
    expect(screen.getAllByRole("link", { name: "Pricing" })[0]).toHaveAttribute("href", "/pricing");
    expect(screen.getByRole("link", { name: "Apply for the beta →" })).toHaveAttribute("href", "/beta");
  });

  it("prefixes page links with the locale when the page is read in French", () => {
    renderIntl(<Navbar />, { locale: "fr" });
    const nav = messagesFor("fr").common.nav as Record<string, string>;
    expect(screen.getAllByRole("link", { name: nav.pricing })[0]).toHaveAttribute("href", "/fr/pricing");
  });
});

describe("edit 4: simulator card", () => {
  it("is wider at lg, with four results each with a picto, tabular figures and a pessimistic value beside base", () => {
    const { container } = renderIntl(<HeroSimulator />);
    expect(container.querySelector("section > div")!.className).toContain("lg:max-w-6xl");
    const tiles = container.querySelectorAll("[data-result-tile]");
    expect(tiles).toHaveLength(4);
    for (const t of Array.from(tiles)) {
      const picto = t.querySelector("[data-picto]")!;
      expect(picto).toHaveAttribute("aria-hidden", "true");
      expect(picto.querySelector("svg")).not.toBeNull();
      expect(t.querySelector(".financial-number")).not.toBeNull();
      expect(t.querySelector(".text-2xl")).toBeNull();
    }
    expect(screen.getByText("Net cash per year")).toBeInTheDocument();
    expect(screen.getByText(/Net profit over 5 years/)).toBeInTheDocument();
    expect(screen.getByText("Net IRR")).toBeInTheDocument();
    expect(screen.getByText("Platform fee per year")).toBeInTheDocument();
    expect(container.querySelectorAll("[data-pessimistic]").length).toBeGreaterThanOrEqual(3);
    expect(screen.getAllByText(/net · indicative · not guaranteed/).length).toBeGreaterThan(0);
  });
});

describe("CountUp", () => {
  const fmt = (n: number) => `${Math.round(n)} u`;

  it("counts up from zero once in view and ends on the exact value", () => {
    vi.useFakeTimers(RAF_ONLY);
    vi.stubGlobal("IntersectionObserver", IntersectingIO);
    const { container } = renderIntl(<CountUp value={1000} format={fmt} />);
    act(() => {
      vi.advanceTimersByTime(120);
    });
    const mid = parseInt(container.textContent!, 10);
    expect(mid).toBeGreaterThan(0);
    expect(mid).toBeLessThan(1000);
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(container.textContent).toBe("1000 u");
  });

  it("shows the final value at once under prefers-reduced-motion", () => {
    vi.useFakeTimers(RAF_ONLY);
    mockReducedMotion(true);
    vi.stubGlobal("IntersectionObserver", IntersectingIO);
    const { container } = renderIntl(<CountUp value={1000} format={fmt} />);
    expect(container.textContent).toBe("1000 u");
    act(() => {
      vi.advanceTimersByTime(120);
    });
    expect(container.textContent).toBe("1000 u");
  });

  it("renders the final value when it never scrolls into view (no flash of zero)", () => {
    const { container } = renderIntl(<CountUp value={42} format={fmt} />);
    expect(container.textContent).toBe("42 u");
  });
});

describe("edit 5: zellige and building sketches", () => {
  it("zellige corner texture sits at the top of the light range (7 %)", () => {
    expect(ZELLIGE_CORNER_CLASS).toContain("opacity-[0.07]");
  });

  it.each(["agadir", "arch", "riad"] as const)("BuildingSketch %s is decorative line art", (variant) => {
    const { container } = render(<BuildingSketch variant={variant} />);
    const svg = container.querySelector("svg")!;
    const wrapper = container.firstElementChild as HTMLElement;
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("focusable", "false");
    expect(wrapper.className).toContain("pointer-events-none");
    expect(wrapper).toHaveAttribute("data-building-sketch", variant);
    expect(svg.querySelector("text")).toBeNull();
    expect(svg.querySelector("image")).toBeNull();
    const widths = Array.from(svg.querySelectorAll("[stroke-width]")).map((e) => Number(e.getAttribute("stroke-width")));
    expect(Math.min(...widths)).toBeGreaterThanOrEqual(1);
    expect(Math.max(...widths)).toBeLessThanOrEqual(1.25);
    expect(svg.querySelector("[stroke='currentColor']")).not.toBeNull();
    expect(svg.querySelector("linearGradient")).not.toBeNull();
    expect(wrapper.className).toMatch(/opacity-\[0\.1[0-4]?\]/);
  });

  it("gives two sketches on one page distinct gradient ids", () => {
    const { container } = renderIntl(
      <>
        <BuildingSketch variant="agadir" />
        <BuildingSketch variant="agadir" />
      </>,
    );
    const ids = Array.from(container.querySelectorAll("linearGradient")).map((g) => g.id);
    expect(new Set(ids).size).toBe(2);
  });

  it("appears in the hero, how it works and the final CTA", () => {
    for (const el of [<LandingHero key="a" />, <HowItWorksSection key="b" />, <FinalCtaSection key="c" />]) {
      const { container, unmount } = renderIntl(el);
      expect(container.querySelectorAll("[data-building-sketch]").length).toBeGreaterThanOrEqual(1);
      unmount();
    }
  });
});

describe("edit 6: partners marquee", () => {
  it("renders every logo on a white plate inside a labelled region, duplicated for a seamless loop", () => {
    const { container } = renderIntl(<BackedBySection />);
    expect(screen.getByRole("region", { name: /partner logos/i })).toBeInTheDocument();
    const live = container.querySelectorAll("[data-marquee-set='a'] img");
    const dup = container.querySelectorAll("[data-marquee-set='b'] img");
    expect(live).toHaveLength(6);
    expect(dup).toHaveLength(6);
    for (const img of Array.from(dup)) expect(img).toHaveAttribute("alt", "");
    expect(container.querySelector("[data-marquee-set='b']")).toHaveAttribute("aria-hidden", "true");
    for (const img of Array.from(live)) {
      expect(img.className).toContain("object-contain");
      expect(img.parentElement!.className).toContain("bg-white");
      expect(img).toHaveAttribute("loading", "eager");
    }
    expect(screen.getByAltText("UM6P").className).toContain("mix-blend-multiply");
    expect(screen.getByAltText("Explorer").className).toContain("mix-blend-multiply");
    expect(screen.getByAltText("Programme partner logo").className).toContain("brightness-0");
    expect(screen.getByAltText("UM6P Launchpad").className).toContain("brightness-0");
    expect(container.querySelector("[data-marquee-track]")!.className).toContain("marquee-track");
  });

  it("has no pause button and keeps the visual loop LTR in every locale", () => {
    const { container } = renderIntl(<BackedBySection />);
    const track = container.querySelector("[data-marquee-track]")!;
    expect(track).not.toHaveAttribute("data-paused");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: /partner logos/i })).toHaveAttribute("dir", "ltr");
    expect(screen.getByRole("region", { name: /partner logos/i })).toHaveAttribute("tabindex", "0");
  });

  it("adds no logo beyond the six real ones", () => {
    const src = read("components/BackedBySection.tsx");
    expect(src).toContain("Only programmes and partners that are real");
    expect((src.match(/src: "\/images\//g) ?? []).length).toBe(6);
  });

  it("css: keyframes, pause on hover, static and single-set under reduced motion", () => {
    const css = read("app/globals.css");
    expect(css).toContain("@keyframes marquee");
    expect(css).toMatch(/\.marquee-window:hover \.marquee-track[^{]*\{[^}]*animation-play-state:\s*paused/);
    expect(css).toMatch(/\.marquee-track\s*\{[^}]*min-width:\s*200%/);
    const reduced = css.slice(css.indexOf("prefers-reduced-motion: reduce"));
    expect(reduced).toContain(".marquee-track");
    expect(reduced).toContain("[data-marquee-set='b']");
  });
});

describe("edit 7: facts in violet cards", () => {
  it("renders three cards with a violet icon and violet figure on the mist surface", () => {
    const { container } = renderIntl(<FactsSection />);
    const cards = container.querySelectorAll("[data-fact-card]");
    expect(cards).toHaveLength(3);
    for (const c of Array.from(cards)) {
      expect(c.className).toContain("bg-card");
      expect(c.querySelector("[data-fact-icon]")!.className).toContain("text-primary");
      expect(c.querySelector("[data-fact-figure]")!.className).toContain("text-primary");
    }
    expect(container.querySelector("section")!.className).toContain("bg-surface-mist");
    expect(container.querySelector("section")!.className).not.toContain("bg-surface-clay");
  });

  it("reads the figures from the fee grid, with the words from the English file", () => {
    renderIntl(<FactsSection />);
    expect(screen.getByText("25,000 MAD")).toBeInTheDocument();
    expect(screen.getByText("Per project, in steps of 5,000 MAD.")).toBeInTheDocument();
    expect(screen.getByText("Every 6 months")).toBeInTheDocument();
    expect(screen.getByText("Open after 1 year of holding.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "See who pays what, when" })).toHaveAttribute("href", "/pricing");
  });
});

describe("edit 8: final CTA", () => {
  it("has exactly two controls: Apply for beta (register) and Join the waitlist (modal)", () => {
    const { container } = renderIntl(<FinalCtaSection />);
    const section = container.querySelector("section")!;
    const controls = within(section).queryAllByRole("link").concat(within(section).queryAllByRole("button"));
    expect(controls).toHaveLength(2);
    expect(within(section).getByRole("link", { name: "Apply for beta" })).toHaveAttribute("href", REGISTER);
    expect(within(section).queryByRole("link", { name: /simulate/i })).toBeNull();
    expect(within(section).queryByRole("textbox")).toBeNull();
    fireEvent.click(within(section).getByRole("button", { name: "Join the waitlist" }));
    expect(screen.getByRole("heading", { name: "Join the Waitlist" })).toBeInTheDocument();
  });
});

describe("edit 9: navigation scroll", () => {
  it("scrolls to the top instantly when the pathname changes", () => {
    const spy = vi.spyOn(window, "scrollTo").mockImplementation(scrollSpy);
    mockPath.current = "/";
    const { rerender } = renderIntl(<ScrollToTop />);
    scrollSpy.mockClear();
    mockPath.current = "/faq";
    rerender(<ScrollToTop />);
    expect(scrollSpy).toHaveBeenCalledWith({ top: 0, left: 0, behavior: "instant" });
    spy.mockRestore();
  });

  it("is mounted in the locale layout, which opts in to Next's scroll-behavior handling", () => {
    const layout = read("app/[locale]/layout.tsx");
    expect(layout).toContain('data-scroll-behavior="smooth"');
    expect(layout).toContain("<ScrollToTop");
  });

  it("css has no unconditional smooth scroll on html", () => {
    const css = read("app/globals.css");
    expect(css).not.toMatch(/^html\s*\{[^}]*scroll-behavior:\s*smooth/m);
  });
});

describe("pain points", () => {
  it("renders the three cards from the English file, in order", () => {
    renderIntl(<PainPointsSection />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("We built something different.");
    const titles = screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent);
    expect(titles).toEqual([
      "Every opportunity starts with the facts.",
      "Investors can understand what they own.",
      "The platform keeps reporting after investment.",
    ]);
  });
});

describe("footer", () => {
  it("carries the pre-licence notice from common and locale-aware links", () => {
    renderIntl(<SiteFooter />);
    const common = messagesFor("en").common as { notice: { indicative: string } };
    expect(screen.getByRole("note")).toHaveTextContent(common.notice.indicative);
    expect(screen.getByRole("link", { name: "Beta" })).toHaveAttribute("href", "/beta");
    expect(screen.getByRole("link", { name: "FAQ" })).toHaveAttribute("href", "/faq");
  });
});

describe("home shell in French and Arabic", () => {
  const plain = (s: string) => s.replace(/<\/?em>/g, "");

  it("renders the French copy with French number grouping", () => {
    const home = messagesFor("fr").home as { hero: { title: string; note: string }; facts: { title: string } };
    renderIntl(<LandingHero />, { locale: "fr" });
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(plain(home.hero.title));
    expect(screen.getByText(home.hero.note)).toBeInTheDocument();
    expect(screen.getByText(/25[   .]000 MAD/)).toBeInTheDocument();
    renderIntl(<FactsSection />, { locale: "fr" });
    expect(screen.getByRole("heading", { name: home.facts.title })).toBeInTheDocument();
  });

  it("renders the Arabic copy with the dirham word from the formatter", () => {
    const home = messagesFor("ar").home as { hero: { title: string; note: string }; facts: { title: string } };
    const common = messagesFor("ar").common as { cta: { betaAccess: string } };
    renderIntl(<LandingHero />, { locale: "ar" });
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(plain(home.hero.title));
    expect(screen.getByText(home.hero.note)).toBeInTheDocument();
    expect(screen.getByText(/25[   .,]000 درهم/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: common.cta.betaAccess })).toHaveAttribute("href", REGISTER);
    renderIntl(<FactsSection />, { locale: "ar" });
    expect(screen.getByRole("heading", { name: home.facts.title })).toBeInTheDocument();
  });
});
