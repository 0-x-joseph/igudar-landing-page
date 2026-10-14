import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import type { BetaApplication } from "@/lib/waitlist-validation";

vi.mock("server-only", () => ({}));
import { BetaStorageNotConfiguredError, saveBetaApplication } from "@/lib/supabase/beta-applications";

const beta: BetaApplication = {
  firstName: "Salma", location: "Paris, France", ticketBucket: "25-50k",
  experience: "some", consentAt: "2026-10-14T10:00:00.000Z", source: "beta",
};
const fetchMock = vi.fn();
beforeEach(() => {
  vi.stubEnv("SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "sb_secret_test_only");
  fetchMock.mockReset().mockImplementation(async () => new Response(JSON.stringify([{ id: "new-id" }]), {
    status: 201, headers: { "Content-Type": "application/json" },
  }));
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("server-only beta persistence (actual Supabase client, mocked HTTP)", () => {
  it("inserts all validated fields with conflict-ignore and server credentials", async () => {
    expect(await saveBetaApplication(" Salma@Example.com ", beta, "fr")).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [input, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const url = new URL(input);
    expect(url.pathname).toBe("/rest/v1/beta_applications");
    expect(url.searchParams.get("on_conflict")).toBe("email");
    expect(url.searchParams.get("select")).toBe("id");
    expect(init.method).toBe("POST");
    const headers = new Headers(init.headers);
    expect(headers.get("apikey")).toBe("sb_secret_test_only");
    expect(headers.get("Prefer")).toContain("resolution=ignore-duplicates");
    expect(JSON.parse(init.body as string)).toEqual({
      email: "salma@example.com", first_name: beta.firstName, location: beta.location,
      ticket_bucket: beta.ticketBucket, experience: beta.experience, consent_at: beta.consentAt,
      locale: "fr", source: "beta",
    });
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it("returns false for a duplicate instead of overwriting it", async () => {
    fetchMock.mockResolvedValue(new Response("[]", { status: 201, headers: { "Content-Type": "application/json" } }));
    expect(await saveBetaApplication("salma@example.com", beta, "en")).toBe(false);
  });

  it.each(["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"])("fails before network access without %s", async (key) => {
    vi.stubEnv(key, "");
    await expect(saveBetaApplication("salma@example.com", beta, "en")).rejects.toBeInstanceOf(BetaStorageNotConfiguredError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("redacts database errors (including absent table) rather than treating them as success", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ code: "PGRST205", message: "salma@example.com private detail" }), {
      status: 404, headers: { "Content-Type": "application/json" },
    }));
    await expect(saveBetaApplication("salma@example.com", beta, "ar")).rejects.toThrow("Beta application could not be stored.");
  });

  it.each(["null", "{}"])("rejects unexpected response %s instead of reporting a saved application", async (body) => {
    fetchMock.mockResolvedValue(new Response(body, { status: 201, headers: { "Content-Type": "application/json" } }));
    await expect(saveBetaApplication("salma@example.com", beta, "en")).rejects.toThrow("Beta application could not be stored.");
  });
});

describe("checked-in beta migration", () => {
  it("keeps application data private and enforces field constraints", () => {
    const sql = readFileSync(path.resolve(import.meta.dirname, "../../supabase/migrations/20261014000000_beta_applications.sql"), "utf8");
    expect(sql).toContain("enable row level security");
    expect(sql).toContain("from public, anon, authenticated, service_role");
    expect(sql).toContain("grant select, insert");
    expect(sql).not.toMatch(/create policy/i);
    expect(sql).toContain("email text not null unique");
    expect(sql).toContain("consent_at timestamptz not null,");
    expect(sql).toContain("between 1 and 60");
    expect(sql).toContain("between 1 and 80");
    expect(sql).toContain("'25-50k', '50-100k', '100-250k', '250k-plus', 'not-sure'");
    expect(sql).toContain("'new', 'some', 'experienced'");
    expect(sql).toContain("'en', 'fr', 'ar', 'ary'");
  });
});
