import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { LANDING_EVENTS, parseLandingEvent } from "@/lib/acquisition";

const insertMock = vi.hoisted(() => vi.fn());
vi.mock("@/lib/supabase/landing-events", () => ({ insertLandingEvents: insertMock }));

const VISITOR = "5f0c7a52-3c1e-4b8e-9d55-0a4c1e2f7b10";
const SESSION = "0b8a3c2d-1e4f-4a6b-8c9d-0e1f2a3b4c5d";

const valid = (patch: Record<string, unknown> = {}) => ({
  event: "page_view",
  visitor_id: VISITOR,
  session_id: SESSION,
  path: "/fr/simulator",
  locale: "fr",
  referrer_host: "www.google.com",
  utm_source: "newsletter",
  utm_medium: "email",
  utm_campaign: "beta-oct",
  form: null,
  props: {},
  ...patch,
});

async function load() {
  vi.resetModules();
  return import("@/app/api/events/route");
}

let ipCounter = 0;
function req(body: unknown, { ip = `10.1.0.${++ipCounter}`, type = "application/json", headers = {} as Record<string, string> } = {}) {
  return new NextRequest("http://localhost/api/events", {
    method: "POST",
    headers: { "x-forwarded-for": ip, "content-type": type, ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

/** Rows handed to the insert across all calls. */
const inserted = () => insertMock.mock.calls.flatMap((c) => c[0] as unknown[]);

beforeEach(() => {
  insertMock.mockReset().mockResolvedValue(true);
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  vi.restoreAllMocks();
});

describe("POST /api/events, the happy path", () => {
  it("stores a valid batch in one insert and answers 204 with no body", async () => {
    const { POST } = await load();
    const res = await POST(req({ events: [valid(), valid({ event: "cta_click", props: { cta: "hero_waitlist" } })] }));
    expect(res.status).toBe(204);
    expect(await res.text()).toBe("");
    expect(insertMock).toHaveBeenCalledTimes(1);
    expect(inserted()).toEqual([
      {
        visitor_id: VISITOR, session_id: SESSION, event: "page_view", form: null, path: "/fr/simulator", locale: "fr",
        referrer_host: "www.google.com", utm_source: "newsletter", utm_medium: "email", utm_campaign: "beta-oct", props: {},
      },
      expect.objectContaining({ event: "cta_click", props: { cta: "hero_waitlist" } }),
    ]);
  });

  it("accepts the text/plain body navigator.sendBeacon sends", async () => {
    const { POST } = await load();
    await POST(req({ events: [valid()] }, { type: "text/plain;charset=UTF-8" }));
    expect(inserted()).toHaveLength(1);
  });

  it("accepts every event name in the contract", async () => {
    const { POST } = await load();
    await POST(req({ events: LANDING_EVENTS.slice(0, 20).map((event) => valid({ event })) }));
    expect(inserted()).toHaveLength(LANDING_EVENTS.length);
  });

  it("accepts optional fields as null or absent, and the three form names", async () => {
    const { POST } = await load();
    const minimal = { event: "form_view", visitor_id: VISITOR, session_id: SESSION, path: "/" };
    await POST(req({ events: [minimal, ...["waitlist_modal", "simulator_interest", "beta_application"].map((form) => valid({ event: "form_view", form }))] }));
    expect(inserted()).toHaveLength(4);
    expect(inserted()[0]).toMatchObject({ form: null, locale: null, referrer_host: null, utm_source: null, props: {} });
  });

  it("lower-cases ids and hosts", async () => {
    const { POST } = await load();
    await POST(req({ events: [valid({ visitor_id: VISITOR.toUpperCase(), referrer_host: "WWW.Google.COM" })] }));
    expect(inserted()[0]).toMatchObject({ visitor_id: VISITOR, referrer_host: "www.google.com" });
  });
});

describe("POST /api/events, strict validation (invalid events are dropped, valid ones kept)", () => {
  it.each([
    ["unknown event name", { event: "purchase" }],
    ["event name with different case", { event: "PAGE_VIEW" }],
    ["missing visitor id", { visitor_id: undefined }],
    ["visitor id not a uuid", { visitor_id: "abc" }],
    ["session id not a uuid", { session_id: "123e4567-e89b-12d3-a456-42661417400" }],
    ["missing path", { path: undefined }],
    ["path without a leading slash", { path: "fr/simulator" }],
    ["path with a query string", { path: "/simulator?email=a@b.co" }],
    ["path with a fragment", { path: "/faq#x" }],
    ["path over 200 characters", { path: `/${"a".repeat(200)}` }],
    ["path with a space", { path: "/a b" }],
    ["unknown locale", { locale: "de" }],
    ["unknown form", { form: "contact" }],
    ["referrer that is a URL, not a host", { referrer_host: "https://google.com/search?q=x" }],
    ["referrer host over 120 characters", { referrer_host: `${"a".repeat(117)}.com` }],
    ["utm_source over 100 characters", { utm_source: "x".repeat(101) }],
    ["utm_medium with an email", { utm_medium: "a@example.com" }],
    ["utm_campaign with a newline", { utm_campaign: "a\nb" }],
    ["utm not a string", { utm_source: 5 }],
    ["props that are an array", { props: [] }],
    ["props that are a string", { props: "x" }],
    ["a prop named email", { props: { email: "x" } }],
    ["a prop named first_name", { props: { first_name: "Salma" } }],
    ["a prop named location", { props: { location: "Paris" } }],
    ["a prop named amount", { props: { amount: 30000 } }],
    ["a prop value that looks like an email", { props: { cta: "a@example.com" } }],
    ["a nested prop", { props: { nested: { a: 1 } } }],
    ["a prop key with capitals", { props: { amountMad: 1 } }],
    ["a prop string over 100 characters", { props: { topic: "x".repeat(101) } }],
    ["a non-finite number", { props: { n: Number.POSITIVE_INFINITY } }],
    ["more than 12 props", { props: Object.fromEntries(Array.from({ length: 13 }, (_, i) => [`k${i}`, i])) }],
  ])("drops an event with %s", async (_n, patch) => {
    const { POST } = await load();
    const res = await POST(req({ events: [valid(patch), valid()] }));
    expect(res.status).toBe(204);
    expect(inserted()).toHaveLength(1);
    expect(inserted()[0]).toMatchObject({ path: "/fr/simulator", event: "page_view" });
  });

  it("drops props over the 2000-byte database limit", () => {
    const props = Object.fromEntries(Array.from({ length: 12 }, (_, i) => [`k${i}`, "é".repeat(100)]));
    expect(parseLandingEvent(valid({ props }))).toBeNull();
  });

  it("ignores unknown extra fields rather than storing them", async () => {
    const { POST } = await load();
    await POST(req({ events: [valid({ ip: "1.2.3.4", user_agent: "Mozilla", email: "a@example.com" })] }));
    const row = inserted()[0] as Record<string, unknown>;
    expect(Object.keys(row).sort()).toEqual(
      ["event", "form", "locale", "path", "props", "referrer_host", "session_id", "utm_campaign", "utm_medium", "utm_source", "visitor_id"],
    );
    expect(JSON.stringify(row)).not.toMatch(/1\.2\.3\.4|Mozilla|example\.com/);
  });
});

describe("POST /api/events, request limits", () => {
  it("refuses a batch of more than 20 events whole", async () => {
    const { POST } = await load();
    expect((await POST(req({ events: Array.from({ length: 21 }, () => valid()) }))).status).toBe(204);
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("accepts exactly 20 events", async () => {
    const { POST } = await load();
    await POST(req({ events: Array.from({ length: 20 }, () => valid()) }));
    expect(inserted()).toHaveLength(20);
  });

  it("refuses a body over 16 KB", async () => {
    const { POST } = await load();
    const body = JSON.stringify({ events: [valid()], pad: "x".repeat(16 * 1024) });
    expect((await POST(req(body))).status).toBe(204);
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("refuses a request whose declared length is over 16 KB without reading it", async () => {
    const { POST } = await load();
    await POST(req({ events: [valid()] }, { headers: { "content-length": String(16 * 1024 + 1) } }));
    expect(insertMock).not.toHaveBeenCalled();
  });

  it.each([
    ["not JSON", "{nope"],
    ["an array", "[]"],
    ["no events key", "{}"],
    ["events not an array", '{"events":{}}'],
    ["an empty batch", '{"events":[]}'],
  ])("answers 204 and stores nothing for %s", async (_n, body) => {
    const { POST } = await load();
    expect((await POST(req(body))).status).toBe(204);
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("does not call the database when every event is invalid", async () => {
    const { POST } = await load();
    await POST(req({ events: [valid({ event: "nope" })] }));
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("rate-limits an IP after 30 requests per minute, silently, and only that IP", async () => {
    const { POST } = await load();
    const statuses: number[] = [];
    for (let i = 0; i < 31; i++) statuses.push((await POST(req({ events: [valid()] }, { ip: "9.9.9.9" }))).status);
    expect(new Set(statuses)).toEqual(new Set([204]));
    expect(insertMock).toHaveBeenCalledTimes(30);
    await POST(req({ events: [valid()] }, { ip: "8.8.8.8" }));
    expect(insertMock).toHaveBeenCalledTimes(31);
  });
});

describe("POST /api/events, never blocks and never leaks", () => {
  it("answers 204 when storage is not configured (the insert stores nothing)", async () => {
    insertMock.mockResolvedValue(false);
    const { POST } = await load();
    expect((await POST(req({ events: [valid()] }))).status).toBe(204);
  });

  it("answers 204 on a database failure and logs nothing personal", async () => {
    insertMock.mockRejectedValue(new Error(`detail ${VISITOR} 7.7.7.7`));
    const { POST } = await load();
    expect((await POST(req({ events: [valid()] }, { ip: "7.7.7.7" }))).status).toBe(204);
    const logged = JSON.stringify(vi.mocked(console.error).mock.calls);
    expect(logged).not.toContain("7.7.7.7");
    expect(logged).not.toContain(VISITOR);
  });

  it("does not apply Do Not Track server-side: the browser sends nothing then, so the route has nothing to filter", async () => {
    const { POST } = await load();
    await POST(req({ events: [valid()] }, { headers: { dnt: "1", "sec-gpc": "1" } }));
    expect(inserted()).toHaveLength(1);
  });
});
