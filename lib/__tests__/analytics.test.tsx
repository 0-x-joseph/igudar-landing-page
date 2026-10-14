import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render } from "@testing-library/react";

type Analytics = typeof import("@/lib/analytics");

const pathnameRef = vi.hoisted(() => ({ current: "/" }));
vi.mock("@/i18n/navigation", () => ({ usePathname: () => pathnameRef.current }));

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const PII_KEYS = ["email", "name", "first_name", "location", "amount", "amount_mad", "ip", "user_agent"];

let beacon: ReturnType<typeof vi.fn>;
let fetchMock: ReturnType<typeof vi.fn>;
let a: Analytics;

async function fresh(): Promise<Analytics> {
  vi.resetModules();
  a = await import("@/lib/analytics");
  return a;
}

/** Every batch sent so far, decoded. */
async function sent(): Promise<Array<{ events: Array<Record<string, unknown>> }>> {
  const beaconBodies = await Promise.all(beacon.mock.calls.map(([, blob]) => (blob as Blob).text()));
  const fetchBodies = fetchMock.mock.calls.map(([, init]) => (init as RequestInit).body as string);
  return [...beaconBodies, ...fetchBodies].map((b) => JSON.parse(b));
}
const sentEvents = async () => (await sent()).flatMap((b) => b.events);

function setNavigator(key: string, value: unknown) {
  Object.defineProperty(window.navigator, key, { value, configurable: true, writable: true });
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
  window.localStorage.clear();
  window.sessionStorage.clear();
  window.history.pushState({}, "", "/");
  document.documentElement.lang = "en";
  Object.defineProperty(document, "referrer", { value: "", configurable: true });
  beacon = vi.fn().mockReturnValue(true);
  setNavigator("sendBeacon", beacon);
  setNavigator("doNotTrack", null);
  setNavigator("globalPrivacyControl", undefined);
  fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
  vi.stubGlobal("fetch", fetchMock);
  vi.spyOn(console, "debug").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => {
  a?.stopAnalytics();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("track(), the public API", () => {
  it("still dispatches the igudar:track CustomEvent with the event and props", async () => {
    await fresh();
    const seen: unknown[] = [];
    const listener = (e: Event) => seen.push((e as CustomEvent).detail);
    window.addEventListener(a.TRACK_EVENT_NAME, listener);
    a.track("calc_view", { topic: "fees" });
    window.removeEventListener(a.TRACK_EVENT_NAME, listener);
    expect(seen).toEqual([{ event: "calc_view", props: { topic: "fees" } }]);
  });
});

describe("the sender: batching and flushing", () => {
  it("waits 5 s, then sends one batch to /api/events with sendBeacon as text/plain", async () => {
    await fresh();
    a.startAnalytics();
    a.track("page_view");
    a.track("cta_click", { cta: "hero_waitlist" });
    a.track("sim_view");
    vi.advanceTimersByTime(4999);
    expect(beacon).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(beacon).toHaveBeenCalledTimes(1);
    const [url, blob] = beacon.mock.calls[0];
    expect(url).toBe("/api/events");
    expect((blob as Blob).type).toContain("text/plain");
    expect((await sentEvents()).map((e) => e.event)).toEqual(["page_view", "cta_click", "sim_view"]);
  });

  it("sends at most 20 events per request, immediately when 20 are waiting", async () => {
    await fresh();
    a.startAnalytics();
    for (let i = 0; i < 25; i++) a.track("sim_amount_change", { bucket: "25-45k" });
    expect(beacon).toHaveBeenCalledTimes(1);
    expect((await sent())[0].events).toHaveLength(20);
    vi.advanceTimersByTime(5000);
    expect(beacon).toHaveBeenCalledTimes(2);
    expect((await sent())[1].events).toHaveLength(5);
  });

  it("keeps events tracked before startAnalytics and sends them once it starts", async () => {
    await fresh();
    a.track("sim_view");
    vi.advanceTimersByTime(10_000);
    expect(beacon).not.toHaveBeenCalled();
    a.startAnalytics();
    vi.advanceTimersByTime(5000);
    expect((await sentEvents()).map((e) => e.event)).toEqual(["sim_view"]);
  });

  it("flushes on pagehide without waiting for the timer", async () => {
    await fresh();
    a.startAnalytics();
    a.track("page_view");
    window.dispatchEvent(new Event("pagehide"));
    expect(beacon).toHaveBeenCalledTimes(1);
  });

  it("flushes when the tab becomes hidden, not when it becomes visible", async () => {
    await fresh();
    a.startAnalytics();
    a.track("page_view");
    Object.defineProperty(document, "visibilityState", { value: "visible", configurable: true });
    document.dispatchEvent(new Event("visibilitychange"));
    expect(beacon).not.toHaveBeenCalled();
    Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true });
    document.dispatchEvent(new Event("visibilitychange"));
    expect(beacon).toHaveBeenCalledTimes(1);
  });

  it("falls back to fetch keepalive when sendBeacon refuses or is missing", async () => {
    beacon.mockReturnValue(false);
    await fresh();
    a.startAnalytics();
    a.track("page_view");
    a.flushAnalytics();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/events");
    expect(init).toMatchObject({ method: "POST", keepalive: true });

    setNavigator("sendBeacon", undefined);
    a.track("page_view");
    a.flushAnalytics();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("never throws when the network fails", async () => {
    setNavigator("sendBeacon", undefined);
    fetchMock.mockRejectedValue(new Error("offline"));
    await fresh();
    a.startAnalytics();
    a.track("page_view");
    expect(() => a.flushAnalytics()).not.toThrow();
  });

  it("keeps every request under 16 KB", async () => {
    await fresh();
    a.startAnalytics();
    const props = Object.fromEntries(Array.from({ length: 12 }, (_, i) => [`k${i}`, "x".repeat(100)]));
    for (let i = 0; i < 19; i++) a.track("sim_view", props);
    a.flushAnalytics();
    const bodies = await Promise.all(beacon.mock.calls.map(([, blob]) => (blob as Blob).text()));
    expect(bodies.length).toBeGreaterThan(1);
    for (const body of bodies) expect(new TextEncoder().encode(body).length).toBeLessThanOrEqual(16 * 1024);
    expect((await sentEvents())).toHaveLength(19);
  });
});

describe("the sender: what an event carries", () => {
  it("adds a stable visitor id, a session id, the path without query string, the locale and the referring host", async () => {
    window.history.pushState({}, "", "/fr/simulator?email=salma%40example.com&utm_source=newsletter");
    document.documentElement.lang = "fr";
    Object.defineProperty(document, "referrer", { value: "https://www.google.com/search?q=igudar", configurable: true });
    await fresh();
    a.startAnalytics();
    a.track("page_view");
    a.track("form_view", { form: "simulator_interest" });
    a.flushAnalytics();
    const [first, second] = await sentEvents();
    expect(first.visitor_id).toMatch(UUID);
    expect(first.session_id).toMatch(UUID);
    expect(first.visitor_id).toBe(window.localStorage.getItem("igudar_vid"));
    expect(first.session_id).toBe(window.sessionStorage.getItem("igudar_sid"));
    expect(second.visitor_id).toBe(first.visitor_id);
    expect(first).toMatchObject({ path: "/fr/simulator", locale: "fr", referrer_host: "www.google.com", form: null, props: {} });
    expect(second).toMatchObject({ event: "form_view", form: "simulator_interest", props: {} });
    expect(JSON.stringify(await sent())).not.toContain("salma");
  });

  it("omits the referrer when it is this site", async () => {
    Object.defineProperty(document, "referrer", { value: `${window.location.origin}/faq`, configurable: true });
    await fresh();
    a.startAnalytics();
    a.track("page_view");
    a.flushAnalytics();
    expect((await sentEvents())[0].referrer_host).toBeNull();
  });

  it("keeps the visitor id across sessions and renews the session id", async () => {
    await fresh();
    a.startAnalytics();
    a.track("page_view");
    a.flushAnalytics();
    window.sessionStorage.clear();
    a.track("page_view");
    a.flushAnalytics();
    const [one, two] = await sentEvents();
    expect(two.visitor_id).toBe(one.visitor_id);
    expect(two.session_id).not.toBe(one.session_id);
  });

  it("captures the UTM values of the session's first page once, and keeps them for the session", async () => {
    window.history.pushState({}, "", "/?utm_source=newsletter&utm_medium=email&utm_campaign=beta-oct");
    await fresh();
    a.startAnalytics();
    a.track("page_view");
    window.history.pushState({}, "", "/pricing?utm_source=other&utm_medium=cpc&utm_campaign=x");
    a.track("page_view");
    window.history.pushState({}, "", "/faq");
    a.track("page_view");
    a.flushAnalytics();
    for (const e of await sentEvents()) {
      expect(e).toMatchObject({ utm_source: "newsletter", utm_medium: "email", utm_campaign: "beta-oct" });
    }
    expect(JSON.parse(window.sessionStorage.getItem("igudar_utm")!)).toEqual({
      utm_source: "newsletter", utm_medium: "email", utm_campaign: "beta-oct",
    });
  });

  it("does not take UTM values from a later page when the first page had none", async () => {
    await fresh();
    a.startAnalytics();
    a.track("page_view");
    window.history.pushState({}, "", "/pricing?utm_source=late");
    a.track("page_view");
    a.flushAnalytics();
    for (const e of await sentEvents()) expect(e.utm_source).toBeNull();
  });

  it.each([
    ["an email prop", { email: "salma@example.com" }],
    ["a name prop", { first_name: "Salma" }],
    ["a location prop", { location: "Paris" }],
    ["an exact amount", { amount_mad: 30000 }],
    ["a value that looks like an email", { cta: "salma@example.com" }],
  ])("never sends an event with %s", async (_n, props) => {
    await fresh();
    a.startAnalytics();
    a.track("cta_click", props);
    a.track("page_view");
    a.flushAnalytics();
    const events = await sentEvents();
    expect(events.map((e) => e.event)).toEqual(["page_view"]);
    for (const e of events) for (const key of PII_KEYS) expect(Object.keys(e.props as object)).not.toContain(key);
    expect(JSON.stringify(await sent())).not.toMatch(/salma|Paris|30000/);
  });
});

describe("the sender: Do Not Track and Global Privacy Control", () => {
  it.each([
    ["Do Not Track", () => setNavigator("doNotTrack", "1")],
    ["Global Privacy Control", () => setNavigator("globalPrivacyControl", true)],
  ])("sends nothing and stores no identifier with %s", async (_n, enable) => {
    enable();
    window.history.pushState({}, "", "/?utm_source=newsletter");
    await fresh();
    a.startAnalytics();
    a.track("page_view");
    a.flushAnalytics();
    window.dispatchEvent(new Event("pagehide"));
    vi.advanceTimersByTime(10_000);
    expect(beacon).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(window.localStorage.getItem("igudar_vid")).toBeNull();
    expect(window.sessionStorage.getItem("igudar_sid")).toBeNull();
    expect(window.sessionStorage.getItem("igudar_utm")).toBeNull();
    expect(a.trackingAllowed()).toBe(false);
    // A form still gets its page, but no visitor id or campaign.
    expect(a.formAttribution()).toEqual({ path: "/" });
  });

  it("gives a form the visitor id, page and UTM values otherwise", async () => {
    window.history.pushState({}, "", "/beta?utm_source=newsletter");
    await fresh();
    const attribution = a.formAttribution();
    expect(attribution).toEqual({ path: "/beta", visitorId: window.localStorage.getItem("igudar_vid"), utmSource: "newsletter" });
  });
});

describe("AnalyticsTracker", () => {
  async function mountTracker() {
    await fresh();
    const { AnalyticsTracker } = await import("@/components/analytics/AnalyticsTracker");
    const seen: Array<{ event: string; props: Record<string, unknown> }> = [];
    const listener = (e: Event) => seen.push((e as CustomEvent).detail);
    window.addEventListener(a.TRACK_EVENT_NAME, listener);
    return { AnalyticsTracker, seen, cleanup: () => window.removeEventListener(a.TRACK_EVENT_NAME, listener) };
  }

  it("records a page_view on mount and on every route change, once per change", async () => {
    const { AnalyticsTracker, seen, cleanup } = await mountTracker();
    pathnameRef.current = "/";
    const view = render(<AnalyticsTracker />);
    pathnameRef.current = "/simulator";
    view.rerender(<AnalyticsTracker />);
    view.rerender(<AnalyticsTracker />);
    pathnameRef.current = "/faq";
    view.rerender(<AnalyticsTracker />);
    expect(seen.filter((e) => e.event === "page_view")).toHaveLength(3);
    // It also starts the sender.
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect((await sentEvents()).map((e) => e.event)).toEqual(["page_view", "page_view", "page_view"]);
    cleanup();
  });

  it("records cta_click with the stable id of a [data-track] element, and ignores other clicks", async () => {
    const { AnalyticsTracker, seen, cleanup } = await mountTracker();
    const view = render(
      <div>
        <AnalyticsTracker />
        <a href="#x" data-track="hero_waitlist">
          <span>Join</span>
        </a>
        <button type="button" data-track="Not A Valid Id!">x</button>
        <button type="button">plain</button>
      </div>,
    );
    fireEvent.click(view.getByText("Join"));
    fireEvent.click(view.getByText("x"));
    fireEvent.click(view.getByText("plain"));
    expect(seen.filter((e) => e.event === "cta_click")).toEqual([{ event: "cta_click", props: { cta: "hero_waitlist" } }]);
    cleanup();
  });
});
