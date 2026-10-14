import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { readFileSync } from "node:fs";
import path from "node:path";
import { WAITLIST_ERROR_CODES } from "@/lib/waitlist-validation";

const sendMock = vi.hoisted(() => vi.fn());
const saveBetaMock = vi.hoisted(() => vi.fn());
const saveLeadMock = vi.hoisted(() => vi.fn());
vi.mock("@/lib/supabase/beta-applications", () => ({
  saveBetaApplication: saveBetaMock,
  BetaStorageNotConfiguredError: class extends Error {},
}));
vi.mock("@/lib/supabase/landing-leads", () => ({
  saveLandingLead: saveLeadMock,
  LeadStorageNotConfiguredError: class extends Error {},
}));

/** The plain waitlist (the modal) now requires the consent timestamp too. */
const CONSENT = new Date().toISOString();
const NO_ATTRIBUTION = { visitorId: null, path: null, utmSource: null, utmMedium: null, utmCampaign: null };
const VISITOR = "5f0c7a52-3c1e-4b8e-9d55-0a4c1e2f7b10";
vi.mock("resend", () => ({
  Resend: class {
    emails = { send: sendMock };
  },
}));

const AUDIENCE = "aud_123";
const BETA = {
  email: "Salma@Example.com ",
  honeypot: "",
  source: "beta",
  firstName: "Salma",
  location: "Paris, France",
  ticketBucket: "25-50k",
  experience: "some",
  consentAt: new Date().toISOString(),
};

type Call = { url: string; init: RequestInit };
let calls: Call[];
let fetchImpl: (url: string, init: RequestInit) => Promise<Response>;

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

async function load() {
  vi.resetModules();
  return import("@/app/api/waitlist/route");
}

let ipCounter = 0;
function req(body: unknown, ip = `10.0.0.${++ipCounter}`) {
  return new NextRequest("http://localhost/api/waitlist", {
    method: "POST",
    headers: { "x-forwarded-for": ip, "content-type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

beforeEach(() => {
  calls = [];
  sendMock.mockReset().mockResolvedValue({ data: { id: "e1" }, error: null });
  saveBetaMock.mockReset().mockResolvedValue(true);
  saveLeadMock.mockReset().mockResolvedValue(true);
  fetchImpl = async () => json({ id: "c1" });
  vi.stubGlobal("fetch", (url: string, init: RequestInit) => {
    calls.push({ url, init });
    return fetchImpl(url, init);
  });
  vi.stubEnv("RESEND_API_KEY", "re_test");
  vi.stubEnv("RESEND_AUDIENCE_ID", AUDIENCE);
  vi.stubEnv("MAIL_FROM", "");
  vi.stubEnv("BETA_NOTIFY_EMAIL", "");
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("POST /api/waitlist, configuration", () => {
  it("saves a waitlist lead and succeeds without RESEND_API_KEY (no email is sent)", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    const { POST } = await load();
    const res = await POST(req({ email: "a@example.com", consentAt: CONSENT }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true, kind: "waitlist" });
    expect(saveLeadMock).toHaveBeenCalledTimes(1);
    expect(calls).toHaveLength(0);
    expect(sendMock).not.toHaveBeenCalled();
  });
});

describe("POST /api/waitlist, lead storage (waitlist modal and simulator interest)", () => {
  it("stores the waitlist modal in landing_leads before any mail, with consent, locale and attribution", async () => {
    saveLeadMock.mockImplementation(async () => {
      expect(calls).toHaveLength(0);
      expect(sendMock).not.toHaveBeenCalled();
      return true;
    });
    const { POST } = await load();
    const res = await POST(
      req({
        email: " A@Example.com ",
        consentAt: CONSENT,
        locale: "fr",
        visitorId: VISITOR.toUpperCase(),
        path: "/fr/faq",
        utmSource: "newsletter",
        utmMedium: "email",
        utmCampaign: "beta-oct",
      }),
    );
    expect(res.status).toBe(200);
    expect(saveLeadMock).toHaveBeenCalledWith("a@example.com", {
      form: "waitlist_modal",
      locale: "fr",
      consentAt: new Date(CONSENT).toISOString(),
      attribution: { visitorId: VISITOR, path: "/fr/faq", utmSource: "newsletter", utmMedium: "email", utmCampaign: "beta-oct" },
      props: {},
    });
    expect(saveBetaMock).not.toHaveBeenCalled();
  });

  it("stores simulator interest with the amount as a bucket and the scenario, never the exact amount", async () => {
    const { POST } = await load();
    const res = await POST(
      req({ email: "b@example.com", amountMad: 30_000, scenario: "base", source: "simulator", consentAt: CONSENT }),
    );
    expect(await res.json()).toEqual({ success: true, kind: "interest" });
    const [, lead] = saveLeadMock.mock.calls[0];
    expect(lead).toMatchObject({ form: "simulator_interest", locale: "en", props: { amount_bucket: "25-45k", scenario: "base" } });
    expect(JSON.stringify(lead)).not.toContain("30000");
  });

  it("drops malformed attribution silently instead of failing the sign-up", async () => {
    const { POST } = await load();
    const res = await POST(
      req({
        email: "a@example.com",
        consentAt: CONSENT,
        visitorId: "not-a-uuid",
        path: "/faq?email=a@example.com",
        utmSource: "x".repeat(101),
        utmCampaign: "a@example.com",
      }),
    );
    expect(res.status).toBe(200);
    expect(saveLeadMock.mock.calls[0][1].attribution).toEqual(NO_ATTRIBUTION);
  });

  it.each([
    ["waitlist", { email: "a@example.com", consentAt: CONSENT }],
    ["simulator interest", { email: "a@example.com", amountMad: 25000, scenario: "base", source: "simulator", consentAt: CONSENT }],
  ])("treats a duplicate %s (same email and form) as success, without overwriting or mailing", async (_n, body) => {
    saveLeadMock.mockResolvedValue(false);
    const { POST } = await load();
    const res = await POST(req(body));
    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);
    expect(calls).toHaveLength(0);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("answers the beta form's not_configured code when storage is not configured, and sends nothing", async () => {
    const { POST } = await load();
    const { LeadStorageNotConfiguredError } = await import("@/lib/supabase/landing-leads");
    saveLeadMock.mockRejectedValue(new LeadStorageNotConfiguredError());
    const res = await POST(req({ email: "a@example.com", consentAt: CONSENT }));
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: "not_configured" });
    expect(calls).toHaveLength(0);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("answers the beta form's application_failed code on a database failure, never losing the lead silently", async () => {
    saveLeadMock.mockRejectedValue(new Error("a@example.com secret database detail"));
    const { POST } = await load();
    const res = await POST(req({ email: "a@example.com", amountMad: 25000, scenario: "base", source: "simulator", consentAt: CONSENT }));
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ error: "application_failed" });
    expect(calls).toHaveLength(0);
    expect(sendMock).not.toHaveBeenCalled();
    expect(JSON.stringify(vi.mocked(console.error).mock.calls)).not.toContain("a@example.com");
  });

  it.each([
    ["missing", {}, "consent_required"],
    ["not a string", { consentAt: 12345 }, "consent_required"],
    ["garbage", { consentAt: "yesterday" }, "consent_invalid"],
    ["in the future", { consentAt: "2999-01-01T00:00:00Z" }, "consent_invalid"],
  ])("requires consent for the waitlist modal (%s)", async (_n, patch, code) => {
    const { POST } = await load();
    const res = await POST(req({ email: "a@example.com", ...patch }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: code });
    expect(saveLeadMock).not.toHaveBeenCalled();
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("still requires consent for simulator interest", async () => {
    const { POST } = await load();
    const res = await POST(req({ email: "a@example.com", amountMad: 25000, scenario: "base", source: "simulator" }));
    expect(await res.json()).toEqual({ error: "consent_required" });
    expect(saveLeadMock).not.toHaveBeenCalled();
  });

  it("rejects an email longer than 254 characters for every form", async () => {
    const { POST } = await load();
    const res = await POST(req({ email: `${"a".repeat(250)}@example.com`, consentAt: CONSENT }));
    expect(await res.json()).toEqual({ error: "invalid_email" });
    expect(saveLeadMock).not.toHaveBeenCalled();
  });
});

describe("POST /api/waitlist, beta storage", () => {
  it("saves normalized email, validated answers, consent and locale before any mail", async () => {
    saveBetaMock.mockImplementation(async () => {
      expect(calls).toHaveLength(0);
      expect(sendMock).not.toHaveBeenCalled();
      return true;
    });
    const { POST } = await load();
    const res = await POST(req({ ...BETA, firstName: "  Salma  ", location: " Paris,   France ", locale: "ary" }));
    expect(res.status).toBe(200);
    expect(saveBetaMock).toHaveBeenCalledWith("salma@example.com", {
      firstName: "Salma", location: "Paris, France", ticketBucket: "25-50k",
      experience: "some", consentAt: new Date(BETA.consentAt).toISOString(), source: "beta",
    }, "ary", NO_ATTRIBUTION);
  });

  it("passes the visit's attribution with a beta application", async () => {
    const { POST } = await load();
    await POST(req({ ...BETA, visitorId: VISITOR, path: "/beta", utmSource: "linkedin" }));
    expect(saveBetaMock.mock.calls[0][3]).toEqual({
      visitorId: VISITOR, path: "/beta", utmSource: "linkedin", utmMedium: null, utmCampaign: null,
    });
  });

  it("saves beta applications without a Resend key", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    const { POST } = await load();
    const res = await POST(req(BETA));
    expect(await res.json()).toEqual({ success: true, kind: "beta" });
    expect(saveBetaMock).toHaveBeenCalledTimes(1);
    expect(calls).toHaveLength(0);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("fails closed with 503 when beta storage is unconfigured", async () => {
    const { POST } = await load();
    const { BetaStorageNotConfiguredError } = await import("@/lib/supabase/beta-applications");
    saveBetaMock.mockRejectedValue(new BetaStorageNotConfiguredError());
    const res = await POST(req(BETA));
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: "not_configured" });
    expect(calls).toHaveLength(0);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("fails with a localized code and sends no email on a database failure", async () => {
    saveBetaMock.mockRejectedValue(new Error("salma@example.com secret database detail"));
    const { POST } = await load();
    const res = await POST(req(BETA));
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ error: "application_failed" });
    expect(calls).toHaveLength(0);
    expect(sendMock).not.toHaveBeenCalled();
    expect(JSON.stringify(vi.mocked(console.error).mock.calls)).not.toContain("salma@example.com");
  });

  it("accepts duplicates without updating answers or resending email", async () => {
    saveBetaMock.mockResolvedValue(false);
    const { POST } = await load();
    const res = await POST(req(BETA));
    expect(await res.json()).toEqual({ success: true, kind: "beta" });
    expect(calls).toHaveLength(0);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("does not write plain waitlist or simulator interest into the beta table", async () => {
    const { POST } = await load();
    await POST(req({ email: "a@example.com", consentAt: CONSENT }));
    await POST(req({ email: "b@example.com", amountMad: 25000, scenario: "base", source: "simulator", consentAt: BETA.consentAt }));
    expect(saveBetaMock).not.toHaveBeenCalled();
    expect(saveLeadMock).toHaveBeenCalledTimes(2);
  });

  it("never writes a beta application into landing_leads", async () => {
    const { POST } = await load();
    await POST(req(BETA));
    expect(saveLeadMock).not.toHaveBeenCalled();
  });
});

describe("POST /api/waitlist, contact upsert", () => {
  it("upserts the contact in the audience with email, first_name and unsubscribed false", async () => {
    const { POST } = await load();
    const res = await POST(req(BETA));
    expect(res.status).toBe(200);
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe(`https://api.resend.com/audiences/${AUDIENCE}/contacts`);
    expect(calls[0].init.method).toBe("POST");
    expect((calls[0].init.headers as Record<string, string>).Authorization).toBe("Bearer re_test");
    expect(JSON.parse(calls[0].init.body as string)).toEqual({
      email: "salma@example.com",
      first_name: "Salma",
      unsubscribed: false,
    });
  });

  it("omits first_name for a plain waitlist signup", async () => {
    const { POST } = await load();
    const res = await POST(req({ email: "a@example.com", consentAt: CONSENT, honeypot: "" }));
    expect(res.status).toBe(200);
    expect(JSON.parse(calls[0].init.body as string)).toEqual({ email: "a@example.com", unsubscribed: false });
  });

  it("finds the audience named IGUDAR waitlist once and caches the id", async () => {
    vi.stubEnv("RESEND_AUDIENCE_ID", "");
    fetchImpl = async (url, init) => {
      if (url.endsWith("/audiences") && init.method === "GET") {
        return json({ data: [{ id: "other", name: "x" }, { id: "found_1", name: "IGUDAR waitlist" }] });
      }
      return json({ id: "c1" });
    };
    const { POST } = await load();
    await POST(req({ email: "a@example.com", consentAt: CONSENT }));
    await POST(req({ email: "b@example.com", consentAt: CONSENT }));
    const lists = calls.filter((c) => c.url.endsWith("/audiences"));
    expect(lists).toHaveLength(1);
    const contacts = calls.filter((c) => c.url.includes("/contacts"));
    expect(contacts.map((c) => c.url)).toEqual([
      "https://api.resend.com/audiences/found_1/contacts",
      "https://api.resend.com/audiences/found_1/contacts",
    ]);
  });

  it("creates the audience when none exists", async () => {
    vi.stubEnv("RESEND_AUDIENCE_ID", "");
    fetchImpl = async (url, init) => {
      if (url.endsWith("/audiences") && init.method === "GET") return json({ data: [] });
      if (url.endsWith("/audiences") && init.method === "POST") return json({ id: "new_1" });
      return json({ id: "c1" });
    };
    const { POST } = await load();
    const res = await POST(req({ email: "a@example.com", consentAt: CONSENT }));
    expect(res.status).toBe(200);
    const create = calls.find((c) => c.url.endsWith("/audiences") && c.init.method === "POST")!;
    expect(JSON.parse(create.init.body as string)).toEqual({ name: "IGUDAR waitlist" });
    expect(calls.at(-1)!.url).toBe("https://api.resend.com/audiences/new_1/contacts");
  });

  it("keeps a stored waitlist lead successful when the audience contact cannot be saved", async () => {
    fetchImpl = async () => json({ message: "boom" }, 500);
    const { POST } = await load();
    const res = await POST(req({ email: "a@example.com", consentAt: CONSENT }));
    expect(res.status).toBe(200);
    expect(saveLeadMock).toHaveBeenCalledTimes(1);
    expect(sendMock).toHaveBeenCalledTimes(1);
  });
});

describe("POST /api/waitlist, emails", () => {
  it("sends the beta answers to the team and a confirmation to the applicant", async () => {
    const { POST } = await load();
    const res = await POST(req(BETA));
    expect(res.status).toBe(200);
    expect(sendMock).toHaveBeenCalledTimes(2);
    const [notify, confirm] = sendMock.mock.calls.map((c) => c[0]);
    expect(notify.from).toBe("IGUDAR <noreply@igudar.tech>");
    expect(notify.to).toEqual(["hello@igudar.tech"]);
    expect(notify.text).toContain("salma@example.com");
    expect(notify.text).toContain("Paris, France");
    expect(notify.text).toContain("Source: beta");
    expect(notify.text).toContain("Experience: some");
    expect(confirm.to).toEqual(["salma@example.com"]);
    expect(confirm.from).toBe("IGUDAR <noreply@igudar.tech>");
    expect(confirm.html).toContain("https://app.igudar.tech/auth/register");
  });

  it("honours MAIL_FROM and BETA_NOTIFY_EMAIL", async () => {
    vi.stubEnv("MAIL_FROM", "Team <team@example.org>");
    vi.stubEnv("BETA_NOTIFY_EMAIL", "founders@example.org");
    const { POST } = await load();
    await POST(req(BETA));
    expect(sendMock.mock.calls[0][0].to).toEqual(["founders@example.org"]);
    expect(sendMock.mock.calls.every((c) => c[0].from === "Team <team@example.org>")).toBe(true);
  });

  it("still succeeds after storage if the team notification cannot be sent", async () => {
    sendMock.mockResolvedValueOnce({ data: null, error: { message: "nope" } });
    const { POST } = await load();
    const res = await POST(req(BETA));
    expect(res.status).toBe(200);
    expect(sendMock).toHaveBeenCalledTimes(2);
  });

  it("keeps a saved beta application successful when the audience is unavailable", async () => {
    fetchImpl = async () => json({ message: "down" }, 500);
    const { POST } = await load();
    const res = await POST(req(BETA));
    expect(await res.json()).toEqual({ success: true, kind: "beta" });
    expect(sendMock).toHaveBeenCalledTimes(2);
  });

  it("catches thrown mail transport errors after saving", async () => {
    sendMock.mockRejectedValue(new Error("transport down"));
    const { POST } = await load();
    expect((await POST(req(BETA))).status).toBe(200);
    expect(saveBetaMock).toHaveBeenCalledTimes(1);
    expect(sendMock).toHaveBeenCalledTimes(2);
  });

  it("still succeeds when only the applicant confirmation fails", async () => {
    sendMock
      .mockResolvedValueOnce({ data: { id: "1" }, error: null })
      .mockResolvedValueOnce({ data: null, error: { message: "bounce" } });
    const { POST } = await load();
    expect((await POST(req(BETA))).status).toBe(200);
  });

  it("sends only a confirmation for a plain waitlist signup", async () => {
    const { POST } = await load();
    await POST(req({ email: "a@example.com", consentAt: CONSENT }));
    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(sendMock.mock.calls[0][0].to).toEqual(["a@example.com"]);
  });

  it("notifies the team of a simulator interest with the amount", async () => {
    const { POST } = await load();
    const res = await POST(
      req({ email: "a@example.com", amountMad: 25000, scenario: "base", source: "simulator", consentAt: new Date().toISOString() }),
    );
    expect(res.status).toBe(200);
    expect(sendMock).toHaveBeenCalledTimes(2);
    expect(sendMock.mock.calls[0][0].text).toContain("Source: simulator");
  });

  it("escapes HTML in the applicant name", async () => {
    const { POST } = await load();
    await POST(req({ ...BETA, firstName: 'Sal"ma&co' }));
    const confirm = sendMock.mock.calls[1][0];
    expect(confirm.html).toContain("Sal&quot;ma&amp;co");
  });
});

describe("POST /api/waitlist, validation and abuse", () => {
  it.each([
    ["missing email", { honeypot: "" }],
    ["malformed email", { email: "not-an-email", consentAt: new Date().toISOString() }],
    ["disposable email", { email: "x@mailinator.com", consentAt: new Date().toISOString() }],
    ["beta without a first name", { ...BETA, firstName: "  " }],
    ["beta with an unknown bucket", { ...BETA, ticketBucket: "1m" }],
    ["beta with a future consent", { ...BETA, consentAt: "2999-01-01T00:00:00Z" }],
    [
      "interest with a bad amount",
      { email: "a@example.com", amountMad: -1, scenario: "base", source: "simulator", consentAt: new Date().toISOString() },
    ],
  ])("rejects %s with 400 and touches nothing", async (_n, body) => {
    const { POST } = await load();
    const res = await POST(req(body));
    expect(res.status).toBe(400);
    expect(WAITLIST_ERROR_CODES).toContain((await res.json()).error);
    expect(calls).toHaveLength(0);
    expect(sendMock).not.toHaveBeenCalled();
    expect(saveBetaMock).not.toHaveBeenCalled();
  });

  it("rejects a body that is not JSON with 400", async () => {
    const { POST } = await load();
    expect((await POST(req("{nope"))).status).toBe(400);
  });

  it("accepts a filled honeypot silently and does nothing", async () => {
    const { POST } = await load();
    const res = await POST(req({ ...BETA, honeypot: "http://spam" }));
    expect(res.status).toBe(200);
    expect(calls).toHaveLength(0);
    expect(sendMock).not.toHaveBeenCalled();
    expect(saveBetaMock).not.toHaveBeenCalled();
  });

  it("rate-limits an IP after 5 requests per minute, and only that IP", async () => {
    const { POST } = await load();
    const statuses: number[] = [];
    for (let i = 0; i < 6; i++) statuses.push((await POST(req({ email: `u${i}@example.com`, consentAt: CONSENT }, "9.9.9.9"))).status);
    expect(statuses).toEqual([200, 200, 200, 200, 200, 429]);
    expect((await POST(req({ email: "z@example.com", consentAt: CONSENT }, "8.8.8.8"))).status).toBe(200);
  });

  it("never writes the IP or the email to the logs", async () => {
    fetchImpl = async () => json({ message: "boom" }, 500);
    const { POST } = await load();
    await POST(req(BETA, "7.7.7.7"));
    const logged = JSON.stringify((console.error as unknown as { mock: { calls: unknown[] } }).mock.calls);
    expect(logged).not.toContain("7.7.7.7");
    expect(logged).not.toContain("salma@example.com");
  });
});

describe("POST /api/waitlist, the visitor's language", () => {
  const ROOT = path.resolve(import.meta.dirname, "..", "..");
  const emails = (locale: string) =>
    JSON.parse(readFileSync(path.join(ROOT, "messages", locale, "emails.json"), "utf8")) as {
      confirmation: { subject: string; title: string };
      beta: { subject: string; whatTitle: string };
    };

  it("sends the confirmation in French with lang=\"fr\" when the body says so", async () => {
    const { POST } = await load();
    const res = await POST(req({ email: "a@example.com", consentAt: CONSENT, locale: "fr" }));
    expect(res.status).toBe(200);
    const confirm = sendMock.mock.calls[0][0];
    expect(confirm.subject).toBe(emails("fr").confirmation.subject);
    expect(confirm.subject).not.toBe(emails("en").confirmation.subject);
    expect(confirm.html).toContain('<html lang="fr" dir="ltr">');
    expect(confirm.html).toContain(emails("fr").confirmation.title.replace(/'/g, "&#39;"));
  });

  it("sends the beta confirmation in Arabic, right to left, while the team notification stays English", async () => {
    const { POST } = await load();
    const res = await POST(req({ ...BETA, locale: "ar" }));
    expect(res.status).toBe(200);
    const [notify, confirm] = sendMock.mock.calls.map((c) => c[0]);
    expect(notify.subject).toBe("Beta application: Salma, Paris, France");
    expect(notify.text).toMatch(/Amount range: 25,000.MAD to 50,000.MAD/);
    expect(confirm.subject).toBe(emails("ar").beta.subject);
    expect(confirm.html).toContain('<html lang="ar" dir="rtl">');
    expect(confirm.html).toContain("text-align:start");
    expect(confirm.html).toContain("padding-right:20px");
    expect(confirm.html).toContain(emails("ar").beta.whatTitle);
    expect(confirm.html).toContain("https://app.igudar.tech/auth/register");
  });

  it("falls back to English for a missing or unknown locale", async () => {
    const { POST } = await load();
    await POST(req({ email: "a@example.com", consentAt: CONSENT }));
    await POST(req({ email: "b@example.com", consentAt: CONSENT, locale: "de" }));
    await POST(req({ email: "c@example.com", consentAt: CONSENT, locale: 42 }));
    for (const call of sendMock.mock.calls) {
      expect(call[0].subject).toBe(emails("en").confirmation.subject);
      expect(call[0].html).toContain('<html lang="en" dir="ltr">');
    }
  });

  it("answers with the kind of sign-up and no English sentence", async () => {
    const { POST } = await load();
    expect(await (await POST(req({ email: "a@example.com", consentAt: CONSENT }))).json()).toEqual({ success: true, kind: "waitlist" });
    expect(await (await POST(req(BETA))).json()).toEqual({ success: true, kind: "beta" });
  });
});
