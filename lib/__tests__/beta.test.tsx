import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { TRACK_EVENT_NAME } from "@/lib/analytics";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/beta",
}));
vi.mock("@/components/Navbar", () => ({ default: () => <nav data-testid="navbar" /> }));
vi.mock("@/components/SiteFooter", () => ({ default: () => <footer data-testid="footer" /> }));

import { BETA_SUCCESS_MESSAGE, BetaApplicationForm } from "@/components/beta/BetaApplicationForm";
import BetaPage from "@/app/beta/page";

class IO {
  constructor(private cb: IntersectionObserverCallback) {}
  observe(el: Element) {
    this.cb([{ isIntersecting: true, target: el } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
  }
  unobserve() {}
  disconnect() {}
}
vi.stubGlobal("IntersectionObserver", IO);

afterEach(() => {
  vi.restoreAllMocks();
});

function fill() {
  fireEvent.change(screen.getByLabelText("First name"), { target: { value: "Salma" } });
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "salma@example.com" } });
  fireEvent.change(screen.getByLabelText("City and country"), { target: { value: "Paris, France" } });
  fireEvent.change(screen.getByLabelText(/realistically consider/), { target: { value: "25-50k" } });
  fireEvent.change(screen.getByLabelText(/experience with property/), { target: { value: "some" } });
}

const submit = () => screen.getByRole("button", { name: "Apply for the beta" });
const consent = () => screen.getByRole("checkbox");

describe("BetaApplicationForm", () => {
  it("never pre-checks consent, and groups the fields", () => {
    render(<BetaApplicationForm />);
    expect(consent()).not.toBeChecked();
    expect(screen.getByRole("group", { name: "About you" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Your interest" })).toBeInTheDocument();
  });

  it("shows an inline error per missing field, sends nothing, and clears an error once the field is fixed", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(<BetaApplicationForm />);
    fireEvent.click(submit());
    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByText("Please tell us your first name.")).toBeInTheDocument();
    expect(screen.getByText("Please enter a valid email address.")).toBeInTheDocument();
    expect(screen.getByText("Please tell us your city and country.")).toBeInTheDocument();
    expect(screen.getByText("Please choose an amount range.")).toBeInTheDocument();
    expect(screen.getByText("Please choose your experience level.")).toBeInTheDocument();
    expect(screen.getByText("Please tick the box to agree before applying.")).toBeInTheDocument();
    expect(screen.getByLabelText("First name")).toHaveAttribute("aria-invalid", "true");
    fireEvent.change(screen.getByLabelText("First name"), { target: { value: "Salma" } });
    expect(screen.queryByText("Please tell us your first name.")).toBeNull();
    expect(screen.getByLabelText("First name")).not.toHaveAttribute("aria-invalid", "true");
  });

  it("rejects a malformed email and a blank city inline", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(<BetaApplicationForm />);
    fill();
    fireEvent.click(consent());
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "salma@" } });
    fireEvent.change(screen.getByLabelText("City and country"), { target: { value: "   " } });
    fireEvent.click(submit());
    expect(screen.getByText("Please enter a valid email address.")).toBeInTheDocument();
    expect(screen.getByText("Please tell us your city and country.")).toBeInTheDocument();
    expect(screen.queryByText(/tick the box/)).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("offers the amount buckets starting at the 25,000 MAD minimum", () => {
    render(<BetaApplicationForm />);
    const select = screen.getByLabelText(/realistically consider/);
    expect(select).toHaveTextContent("25,000 MAD to 50,000 MAD");
    expect(select).toHaveTextContent("Not sure yet");
    expect(select).not.toHaveTextContent(/\b1,?000 MAD/);
  });

  it("posts the beta payload with source 'beta' and shows the success state", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true }) });
    vi.stubGlobal("fetch", fetchMock);
    const events: unknown[] = [];
    const listener = (e: Event) => events.push((e as CustomEvent).detail);
    window.addEventListener(TRACK_EVENT_NAME, listener);

    render(<BetaApplicationForm />);
    fill();
    fireEvent.click(consent());
    fireEvent.click(submit());

    await waitFor(() => expect(screen.getByText(BETA_SUCCESS_MESSAGE)).toBeInTheDocument());
    expect(screen.getByText(/once approved, create your account here/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Create your account" })).toHaveAttribute(
      "href",
      "https://app.igudar.tech/auth/register",
    );
    expect(BETA_SUCCESS_MESSAGE).toBe("Thanks — a founder reviews every application by hand. You'll hear from us by email.");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/waitlist");
    const body = JSON.parse(init.body);
    expect(body).toMatchObject({
      email: "salma@example.com",
      source: "beta",
      firstName: "Salma",
      location: "Paris, France",
      ticketBucket: "25-50k",
      experience: "some",
      honeypot: "",
    });
    expect(Number.isNaN(new Date(body.consentAt).getTime())).toBe(false);
    // Analytics never carry the email or the name.
    expect(JSON.stringify(events)).not.toContain("salma");
    expect(events).toEqual([{ event: "beta_apply", props: { ticket_bucket: "25-50k", experience: "some" } }]);
    window.removeEventListener(TRACK_EVENT_NAME, listener);
  });

  it("shows the server error and keeps the form", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, json: async () => ({ error: "Please provide a valid email address." }) }),
    );
    render(<BetaApplicationForm />);
    fill();
    fireEvent.click(consent());
    fireEvent.click(submit());
    expect(await screen.findByRole("alert")).toHaveTextContent("Please provide a valid email address.");
    expect(submit()).toBeEnabled();
  });

  it("shows the not-configured sentence on a 503", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 503, json: async () => ({ error: "Sign-up is not configured yet." }) }),
    );
    render(<BetaApplicationForm />);
    fill();
    fireEvent.click(consent());
    fireEvent.click(submit());
    expect(await screen.findByRole("alert")).toHaveTextContent("Sign-up is not configured yet.");
    expect(submit()).toBeEnabled();
  });

  it("explains a network failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    render(<BetaApplicationForm />);
    fill();
    fireEvent.click(consent());
    fireEvent.click(submit());
    expect(await screen.findByRole("alert")).toHaveTextContent("We could not reach the server");
  });
});

describe("beta page", () => {
  it("has the title, the honest framing, the demo CTA and the notice", () => {
    render(<BetaPage />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Try IGUDAR with demo money.");
    expect(screen.getByText(/up to a year of activity in about two weeks/)).toBeInTheDocument();
    expect(screen.getByText(/No identity documents are stored/)).toBeInTheDocument();
    expect(screen.getByText(/CNDP/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Beta access" })).toHaveAttribute(
      "href",
      "https://app.igudar.tech/auth/register",
    );
    const steps = screen.getByRole("list", { name: "How it works" });
    expect(steps).toHaveTextContent("Apply");
    expect(steps).toHaveTextContent("A founder approves by hand");
    expect(steps).toHaveTextContent("You get the email with your access");
    expect(document.querySelectorAll("[data-zellige-band]").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "8");
    expect(screen.getByRole("note", { name: "Important notice" })).toBeInTheDocument();
  });
});
