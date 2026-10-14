import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Attribution, LandingEventRow } from "@/lib/acquisition";
import type { BetaApplication } from "@/lib/waitlist-validation";

vi.mock("server-only", () => ({}));
import { LeadStorageNotConfiguredError, saveLandingLead, type LandingLead } from "@/lib/supabase/landing-leads";
import { insertLandingEvents } from "@/lib/supabase/landing-events";
import { saveBetaApplication } from "@/lib/supabase/beta-applications";

const VISITOR = "5f0c7a52-3c1e-4b8e-9d55-0a4c1e2f7b10";
const ATTRIBUTION: Attribution = { visitorId: VISITOR, path: "/fr/simulator", utmSource: "newsletter", utmMedium: null, utmCampaign: null };
const lead: LandingLead = {
  form: "simulator_interest",
  locale: "fr",
  consentAt: "2026-10-14T10:00:00.000Z",
  attribution: ATTRIBUTION,
  props: { amount_bucket: "50-95k", scenario: "base" },
};
const event: LandingEventRow = {
  visitor_id: VISITOR, session_id: "0b8a3c2d-1e4f-4a6b-8c9d-0e1f2a3b4c5d", event: "page_view", form: null, path: "/",
  locale: "en", referrer_host: null, utm_source: null, utm_medium: null, utm_campaign: null, props: {},
};

const fetchMock = vi.fn();
const created = (body: unknown) =>
  new Response(JSON.stringify(body), { status: 201, headers: { "Content-Type": "application/json" } });

beforeEach(() => {
  vi.stubEnv("SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "sb_secret_test_only");
  fetchMock.mockReset().mockImplementation(async () => created([{ id: "new-id" }]));
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("landing_leads persistence (actual Supabase client, mocked HTTP)", () => {
  it("inserts with conflict-ignore on (email, form) and the server credentials", async () => {
    expect(await saveLandingLead(" Salma@Example.com ", lead)).toBe(true);
    const [input, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const url = new URL(input);
    expect(url.pathname).toBe("/rest/v1/landing_leads");
    expect(url.searchParams.get("on_conflict")).toBe("email,form");
    expect(url.searchParams.get("select")).toBe("id");
    const headers = new Headers(init.headers);
    expect(headers.get("apikey")).toBe("sb_secret_test_only");
    expect(headers.get("Prefer")).toContain("resolution=ignore-duplicates");
    expect(JSON.parse(init.body as string)).toEqual({
      email: "salma@example.com", form: "simulator_interest", locale: "fr", consent_at: "2026-10-14T10:00:00.000Z",
      path: "/fr/simulator", visitor_id: VISITOR, utm_source: "newsletter", utm_medium: null, utm_campaign: null,
      props: { amount_bucket: "50-95k", scenario: "base" },
    });
  });

  it("returns false for a duplicate (same email and form) instead of overwriting it", async () => {
    fetchMock.mockResolvedValue(created([]));
    expect(await saveLandingLead("salma@example.com", lead)).toBe(false);
    expect(new Headers((fetchMock.mock.calls[0][1] as RequestInit).headers).get("Prefer")).not.toContain("merge-duplicates");
  });

  it.each(["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"])("fails before network access without %s", async (key) => {
    vi.stubEnv(key, "");
    await expect(saveLandingLead("salma@example.com", lead)).rejects.toBeInstanceOf(LeadStorageNotConfiguredError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("redacts database errors (for example the table missing before the migration)", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ code: "PGRST205", message: "salma@example.com detail" }), {
      status: 404, headers: { "Content-Type": "application/json" },
    }));
    await expect(saveLandingLead("salma@example.com", lead)).rejects.toThrow("Lead could not be stored.");
  });
});

describe("landing_events persistence (actual Supabase client, mocked HTTP)", () => {
  it("inserts every row in one request", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 201 }));
    expect(await insertLandingEvents([event, { ...event, event: "cta_click", props: { cta: "hero_waitlist" } }])).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [input, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(new URL(input).pathname).toBe("/rest/v1/landing_events");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toHaveLength(2);
  });

  it("stores nothing and makes no request when storage is not configured", async () => {
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
    expect(await insertLandingEvents([event])).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("makes no request for an empty batch", async () => {
    expect(await insertLandingEvents([])).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("throws a redacted error on a database failure", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ message: `bad ${VISITOR}` }), {
      status: 400, headers: { "Content-Type": "application/json" },
    }));
    await expect(insertLandingEvents([event])).rejects.toThrow("Landing events could not be stored.");
  });
});

describe("beta_applications attribution columns", () => {
  const beta: BetaApplication = {
    firstName: "Salma", location: "Paris, France", ticketBucket: "25-50k",
    experience: "some", consentAt: "2026-10-14T10:00:00.000Z", source: "beta",
  };

  it("adds the attribution values that are present", async () => {
    await saveBetaApplication("salma@example.com", beta, "en", ATTRIBUTION);
    const body = JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string);
    expect(body).toMatchObject({ visitor_id: VISITOR, path: "/fr/simulator", utm_source: "newsletter" });
    expect(body).not.toHaveProperty("utm_medium");
    expect(body).not.toHaveProperty("utm_campaign");
  });
});
