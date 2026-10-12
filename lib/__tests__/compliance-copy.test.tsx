import { describe, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import { INDICATIVE_NOTICE, LIMITS } from "@/lib/finance";
import { formatMadIn } from "@/lib/i18n/format";
import { pageMetadata } from "@/lib/i18n/metadata";
import { messagesFor, renderIntl } from "@/lib/__tests__/helpers/intl";

vi.mock(import("next/navigation"), async (importOriginal) => {
  const actual = await importOriginal();
  const router = { push: vi.fn(), replace: vi.fn(), prefetch: vi.fn(), back: vi.fn(), forward: vi.fn(), refresh: vi.fn() };
  const mocked = {
    ...actual,
    useRouter: () => router,
    usePathname: () => "/",
    useParams: () => ({ locale: "en" }),
  };
  return mocked as unknown as typeof actual;
});
vi.mock("next/font/google", () => ({
  Public_Sans: () => ({ variable: "" }),
  Fraunces: () => ({ variable: "" }),
  Noto_Sans_Arabic: () => ({ variable: "" }),
}));
vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

import SiteFooter from "@/components/SiteFooter";
import LandingHero from "@/components/LandingHero";
import FinalCtaSection from "@/components/FinalCtaSection";
import Navbar from "@/components/Navbar";
import FaqPageContent from "@/components/faq/FaqPageContent";

class IO {
  constructor(private cb: IntersectionObserverCallback) {}
  observe(el: Element) {
    this.cb([{ isIntersecting: true, target: el } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
  }
  unobserve() {}
  disconnect() {}
}
vi.stubGlobal("IntersectionObserver", IO);

const en = messagesFor("en");

describe("footer", () => {
  it("always carries the exact pre-licence sentence", () => {
    renderIntl(<SiteFooter />);
    expect(screen.getByText(INDICATIVE_NOTICE)).toBeInTheDocument();
    expect(INDICATIVE_NOTICE).toContain("no investment is collected before the AMMC licence (Loi 15-18)");
    expect((en.common as { notice: { indicative: string } }).notice.indicative).toBe(INDICATIVE_NOTICE);
  });

  it("has no Sharia link and links to the beta", () => {
    renderIntl(<SiteFooter />);
    expect(screen.queryByText(/sharia/i)).toBeNull();
    expect(screen.getByRole("link", { name: "Beta" })).toHaveAttribute("href", "/beta");
  });
});

describe("hero", () => {
  it("promises no return and uses the allowed CTAs", () => {
    renderIntl(<LandingHero />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Real property. Real rent. Clear rules.");
    expect(screen.getByRole("link", { name: "Beta access" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Join the waitlist" })).toBeInTheDocument();
    expect(screen.queryByText(/wealth/i)).toBeNull();
    expect(screen.queryByText(/MVP/)).toBeNull();
  });
});

describe("final CTA and navbar", () => {
  it("offers only 'Apply for beta' and 'Join the waitlist'", () => {
    renderIntl(<FinalCtaSection />);
    expect(screen.getByRole("link", { name: "Apply for beta" })).toHaveAttribute(
      "href",
      "https://app.igudar.tech/auth/register",
    );
    expect(screen.getByRole("button", { name: "Join the waitlist" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Simulate" })).toBeNull();
  });

  it("has a Beta link", () => {
    renderIntl(<Navbar />);
    expect(screen.getAllByRole("link", { name: "Beta" })[0]).toHaveAttribute("href", "/beta");
  });
});

describe("metadata", () => {
  it("states the real minimum and no promise", () => {
    // The home title and description, filled the way app/[locale]/layout.tsx fills them.
    const meta = en.meta as { home: { title: string; description: string } };
    const title = meta.home.title;
    expect(meta.home.description).toContain("{min}");
    const description = meta.home.description.replace("{min}", formatMadIn("en", LIMITS.MIN_TICKET_MAD, { decimals: 0 }));
    const text = `${title} ${description}`;
    expect(text).toContain("25,000");
    expect(text).not.toMatch(/sharia|halal|smartest|1,000 MAD/i);
    const metadata = pageMetadata("en", "/", title, description);
    expect(metadata.openGraph?.title).toBe(title);
  });
});

describe("FAQ", () => {
  type FaqMessages = { items: Record<string, { q: string; a: string }>; pillars: { minimum: { desc: string } } };
  const faq = en.faq as FaqMessages;

  it("answers the Sharia question honestly and never claims certification", () => {
    renderIntl(<FaqPageContent />);
    const question = screen.getByRole("button", { name: "Is IGUDAR Sharia-compliant?" });
    fireEvent.click(question);
    const body = document.body.textContent ?? "";
    expect(body).toContain("Sharia board review in progress");
    expect(body).not.toMatch(/certified|halal|100% Sharia/i);
    expect(body).not.toMatch(/Mudarabah|Musharakah|Ijara/);
    // The copy itself, as shipped in the message file.
    expect(faq.items.participatory.q).toBe("Is IGUDAR Sharia-compliant?");
    expect(faq.items.participatory.a).toContain("Sharia board review in progress");
    expect(faq.items.participatory.a).not.toMatch(/certified|halal|100% Sharia/i);
  });

  it("states the 25,000 MAD minimum and keeps the notice", () => {
    renderIntl(<FaqPageContent />);
    expect(faq.pillars.minimum.desc).toBe("Shares start from {min} per project, and every fee is published in full.");
    expect(screen.getByText(/Shares start from 25,000 MAD/)).toBeInTheDocument();
    expect(screen.getAllByText(INDICATIVE_NOTICE).length).toBeGreaterThan(0);
  });
});
