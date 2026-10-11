import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { INDICATIVE_NOTICE } from "@/lib/finance";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/",
}));
vi.mock("next/font/google", () => ({
  Public_Sans: () => ({ variable: "" }),
  Fraunces: () => ({ variable: "" }),
}));
vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

import SiteFooter from "@/components/SiteFooter";
import LandingHero from "@/components/LandingHero";
import FinalCtaSection from "@/components/FinalCtaSection";
import Navbar from "@/components/Navbar";
import FAQ from "@/app/faq/page";
import { metadata } from "@/app/layout";

class IO {
  constructor(private cb: IntersectionObserverCallback) {}
  observe(el: Element) {
    this.cb([{ isIntersecting: true, target: el } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
  }
  unobserve() {}
  disconnect() {}
}
vi.stubGlobal("IntersectionObserver", IO);

describe("footer", () => {
  it("always carries the exact pre-licence sentence", () => {
    render(<SiteFooter />);
    expect(screen.getByText(INDICATIVE_NOTICE)).toBeInTheDocument();
    expect(INDICATIVE_NOTICE).toContain("no investment is collected before the AMMC licence (Loi 15-18)");
  });

  it("has no Sharia link and links to the beta", () => {
    render(<SiteFooter />);
    expect(screen.queryByText(/sharia/i)).toBeNull();
    expect(screen.getByRole("link", { name: "Beta" })).toHaveAttribute("href", "/beta");
  });
});

describe("hero", () => {
  it("promises no return and uses the allowed CTAs", () => {
    render(<LandingHero />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Real property. Real rent. Clear rules.");
    expect(screen.getByRole("link", { name: "Access the demo" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Join the waitlist" })).toBeInTheDocument();
    expect(screen.queryByText(/wealth/i)).toBeNull();
    expect(screen.queryByText(/MVP/)).toBeNull();
  });
});

describe("final CTA and navbar", () => {
  it("offers 'Apply for the beta' and 'Simulate'", () => {
    render(<FinalCtaSection />);
    expect(screen.getByRole("link", { name: "Apply for the beta" })).toHaveAttribute("href", "/beta");
    expect(screen.getByRole("link", { name: "Simulate" })).toHaveAttribute("href", "/simulator");
  });

  it("has a Beta link", () => {
    render(<Navbar />);
    expect(screen.getAllByRole("link", { name: "Beta" })[0]).toHaveAttribute("href", "/beta");
  });
});

describe("metadata", () => {
  it("states the real minimum and no promise", () => {
    const text = `${metadata.title} ${metadata.description}`;
    expect(text).toContain("25,000");
    expect(text).not.toMatch(/sharia|halal|smartest|1,000 MAD/i);
    expect(metadata.openGraph?.title).toBe(metadata.title);
  });
});

describe("FAQ", () => {
  it("answers the Sharia question honestly and never claims certification", () => {
    render(<FAQ />);
    const question = screen.getByRole("heading", { name: "Is IGUDAR Sharia-compliant?" });
    question.closest("button")!.click();
    const body = document.body.textContent ?? "";
    expect(body).toContain("Sharia board review in progress");
    expect(body).not.toMatch(/certified|halal|100% Sharia/i);
    expect(body).not.toMatch(/Mudarabah|Musharakah|Ijara/);
  });

  it("states the 25,000 MAD minimum and keeps the notice", () => {
    render(<FAQ />);
    expect(screen.getByText(/Shares start from 25,000 MAD/)).toBeInTheDocument();
    expect(screen.getAllByText(INDICATIVE_NOTICE).length).toBeGreaterThan(0);
  });
});
