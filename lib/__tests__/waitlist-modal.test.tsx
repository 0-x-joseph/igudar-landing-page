import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import WaitlistModal from "@/components/WaitlistModal";
import { TRACK_EVENT_NAME } from "@/lib/analytics";
import { LOCALES, type Locale } from "@/i18n/routing";
import { messagesFor, renderIntl } from "./helpers/intl";

type BetaMessages = {
  form: { consent: string };
  waitlist: { modal: { submit: string; emailLabel: string } };
  errors: Record<string, string>;
};
const beta = (locale: Locale) => messagesFor(locale).beta as unknown as BetaMessages;
type Simulator = { interest: { consent: string } };

let events: Array<{ event: string; props: Record<string, unknown> }>;
const listener = (e: Event) => events.push((e as CustomEvent).detail);

beforeEach(() => {
  events = [];
  window.addEventListener(TRACK_EVENT_NAME, listener);
  vi.spyOn(console, "debug").mockImplementation(() => {});
});
afterEach(() => {
  window.removeEventListener(TRACK_EVENT_NAME, listener);
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("WaitlistModal consent box", () => {
  it.each(LOCALES)("shows the beta form's consent wording, unticked, in %s", (locale) => {
    const text = beta(locale).form.consent;
    expect(text.trim().length).toBeGreaterThan(20);
    renderIntl(<WaitlistModal isOpen onClose={() => {}} />, { locale });
    const box = screen.getByRole("checkbox", { name: text });
    expect(box).not.toBeChecked();
  });

  it("reuses the existing beta.form.consent key (no new legal copy), not the simulator's amount-specific one", () => {
    for (const locale of LOCALES) {
      const sim = (messagesFor(locale).simulator as unknown as Simulator).interest.consent;
      expect(beta(locale).form.consent).not.toBe(sim);
      expect(beta(locale).waitlist.modal).not.toHaveProperty("consent");
    }
  });

  it("keeps submit disabled until there is an email and the box is ticked", () => {
    renderIntl(<WaitlistModal isOpen onClose={() => {}} />);
    const submit = screen.getByRole("button", { name: beta("en").waitlist.modal.submit });
    expect(submit).toBeDisabled();
    fireEvent.change(screen.getByLabelText(beta("en").waitlist.modal.emailLabel), { target: { value: "a@example.com" } });
    expect(submit).toBeDisabled();
    fireEvent.click(screen.getByRole("checkbox"));
    expect(submit).toBeEnabled();
  });

  it("sends the consent timestamp, the locale and the page, never a name, and records the funnel", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true }) });
    vi.stubGlobal("fetch", fetchMock);
    renderIntl(<WaitlistModal isOpen onClose={() => {}} />, { locale: "ar" });
    const email = screen.getByLabelText(beta("ar").waitlist.modal.emailLabel);
    fireEvent.focus(email);
    fireEvent.change(email, { target: { value: "a@example.com" } });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: beta("ar").waitlist.modal.submit }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/waitlist");
    const body = JSON.parse(init.body);
    expect(body).toMatchObject({ email: "a@example.com", honeypot: "", locale: "ar", path: "/" });
    expect(Number.isNaN(new Date(body.consentAt).getTime())).toBe(false);
    await waitFor(() => expect(events.map((e) => e.event)).toContain("form_submit"));
    expect(events).toEqual([
      { event: "form_view", props: { form: "waitlist_modal" } },
      { event: "form_start", props: { form: "waitlist_modal" } },
      { event: "form_submit", props: { form: "waitlist_modal" } },
    ]);
    expect(JSON.stringify(events)).not.toContain("example.com");
  });

  it("shows the server's localized error and records form_error with its code only", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, json: async () => ({ error: "application_failed" }) }));
    renderIntl(<WaitlistModal isOpen onClose={() => {}} />, { locale: "fr" });
    fireEvent.change(screen.getByLabelText(beta("fr").waitlist.modal.emailLabel), { target: { value: "a@example.com" } });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: beta("fr").waitlist.modal.submit }));
    await screen.findByText(beta("fr").errors.application_failed);
    expect(events.at(-1)).toEqual({ event: "form_error", props: { form: "waitlist_modal", code: "application_failed" } });
  });

  it("records form_view when it opens, not while it is closed", () => {
    const view = renderIntl(<WaitlistModal isOpen={false} onClose={() => {}} />);
    expect(events).toEqual([]);
    view.rerender(<WaitlistModal isOpen onClose={() => {}} />);
    expect(events).toEqual([{ event: "form_view", props: { form: "waitlist_modal" } }]);
  });
});
