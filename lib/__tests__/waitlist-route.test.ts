import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const sendMock = vi.hoisted(() => vi.fn());
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
  it("returns 503 with the not-configured sentence when RESEND_API_KEY is unset", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    const { POST } = await load();
    const res = await POST(req(BETA));
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: "Sign-up is not configured yet." });
    expect(calls).toHaveLength(0);
    expect(sendMock).not.toHaveBeenCalled();
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
    const res = await POST(req({ email: "a@example.com", honeypot: "" }));
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
    await POST(req({ email: "a@example.com" }));
    await POST(req({ email: "b@example.com" }));
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
    const res = await POST(req({ email: "a@example.com" }));
    expect(res.status).toBe(200);
    const create = calls.find((c) => c.url.endsWith("/audiences") && c.init.method === "POST")!;
    expect(JSON.parse(create.init.body as string)).toEqual({ name: "IGUDAR waitlist" });
    expect(calls.at(-1)!.url).toBe("https://api.resend.com/audiences/new_1/contacts");
  });

  it("answers 502 and sends no email when the contact cannot be saved", async () => {
    fetchImpl = async () => json({ message: "boom" }, 500);
    const { POST } = await load();
    const res = await POST(req(BETA));
    expect(res.status).toBe(502);
    expect((await res.json()).error).toMatch(/could not save/i);
    expect(sendMock).not.toHaveBeenCalled();
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

  it("fails with 502 if the team notification of a beta application cannot be sent", async () => {
    sendMock.mockResolvedValueOnce({ data: null, error: { message: "nope" } });
    const { POST } = await load();
    const res = await POST(req(BETA));
    expect(res.status).toBe(502);
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
    await POST(req({ email: "a@example.com" }));
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
    ["malformed email", { email: "not-an-email" }],
    ["disposable email", { email: "x@mailinator.com" }],
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
    expect(typeof (await res.json()).error).toBe("string");
    expect(calls).toHaveLength(0);
    expect(sendMock).not.toHaveBeenCalled();
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
  });

  it("rate-limits an IP after 5 requests per minute, and only that IP", async () => {
    const { POST } = await load();
    const statuses: number[] = [];
    for (let i = 0; i < 6; i++) statuses.push((await POST(req({ email: `u${i}@example.com` }, "9.9.9.9"))).status);
    expect(statuses).toEqual([200, 200, 200, 200, 200, 429]);
    expect((await POST(req({ email: "z@example.com" }, "8.8.8.8"))).status).toBe(200);
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
