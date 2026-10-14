/**
 * First-party, anonymous analytics for the landing site.
 *
 * `track(event, props)` dispatches the event on `window` as `igudar:track` (so any provider can
 * listen) and queues it for `/api/events`. The queue is flushed at most 5 s after an event, when
 * 20 events are waiting, and when the page is hidden or left (pagehide / visibilitychange), with
 * navigator.sendBeacon and a fetch keepalive fallback. Sending starts once `startAnalytics()` runs
 * (the AnalyticsTracker in the locale layout); events tracked earlier wait in the queue.
 *
 * Privacy: with Do Not Track or Global Privacy Control on, nothing is sent and no identifier is
 * stored. Events carry a random visitor id (localStorage `igudar_vid`), a random tab-session id
 * (sessionStorage `igudar_sid`), the pathname (never the query string), the locale, the referring
 * site's host and the UTM values of the session's first page (sessionStorage `igudar_utm`). Props
 * must never carry personal data: no email, name or location text, no exact amount (use a bucket).
 * An event whose props break the rules in `lib/acquisition.ts` is not sent.
 */
import {
  ACQ_LIMITS,
  cleanHost,
  cleanPath,
  cleanProps,
  cleanUtm,
  cleanUuid,
  isEventForm,
  isLocaleCode,
  type EventForm,
  type LandingEvent,
} from "@/lib/acquisition";
import { DEFAULT_LOCALE, type Locale } from "@/i18n/routing";

export type AnalyticsEvent = LandingEvent;
export type AnalyticsProps = Record<string, string | number | boolean>;

export const TRACK_EVENT_NAME = "igudar:track";
export const EVENTS_ENDPOINT = "/api/events";
export const VISITOR_KEY = "igudar_vid";
export const SESSION_KEY = "igudar_sid";
export const UTM_KEY = "igudar_utm";
export const FLUSH_INTERVAL_MS = 5000;

/** Events kept while sending has not started or is paused; the oldest are dropped beyond this. */
const MAX_QUEUE = 100;
/** Stay under the route's 16 KB request limit. */
const MAX_BODY_BYTES = ACQ_LIMITS.REQUEST_BYTES - 1024;

interface QueuedEvent {
  visitor_id: string;
  session_id: string;
  event: LandingEvent;
  form: EventForm | null;
  path: string;
  locale: Locale;
  referrer_host: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  props: AnalyticsProps;
}

interface Utm {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
}

const state: {
  queue: QueuedEvent[];
  started: boolean;
  timer: ReturnType<typeof setTimeout> | null;
  memory: Record<string, string>;
} = { queue: [], started: false, timer: null, memory: {} };

/** False when the visitor asked not to be tracked (Do Not Track or Global Privacy Control). */
export function trackingAllowed(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean; msDoNotTrack?: string | null };
  const win = window as Window & { doNotTrack?: string | null };
  if (nav.globalPrivacyControl === true) return false;
  const dnt = nav.doNotTrack ?? win.doNotTrack ?? nav.msDoNotTrack;
  return !(dnt === "1" || dnt === "yes");
}

function randomUuid(): string {
  const c = globalThis.crypto;
  if (typeof c?.randomUUID === "function") return c.randomUUID();
  // Older browsers and non-secure contexts: an RFC 4122 v4 id from getRandomValues.
  const b = new Uint8Array(16);
  c.getRandomValues(b);
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

/** A stable random id in storage; kept in memory when storage is blocked (private mode, policies). */
function storedId(kind: "local" | "session", key: string): string {
  try {
    const storage = kind === "local" ? window.localStorage : window.sessionStorage;
    const existing = cleanUuid(storage.getItem(key));
    if (existing) return existing;
    const id = randomUuid();
    storage.setItem(key, id);
    return id;
  } catch {
    state.memory[key] ??= randomUuid();
    return state.memory[key];
  }
}

/** The UTM values of the session's first page, captured once and reused for the whole session. */
function sessionUtm(): Utm {
  const read = (raw: string | null): Utm | null => {
    if (!raw) return null;
    try {
      const v = JSON.parse(raw) as Record<string, unknown>;
      return { utm_source: cleanUtm(v.utm_source), utm_medium: cleanUtm(v.utm_medium), utm_campaign: cleanUtm(v.utm_campaign) };
    } catch {
      return null;
    }
  };
  let raw: string | null = null;
  try {
    raw = window.sessionStorage.getItem(UTM_KEY);
  } catch {
    raw = state.memory[UTM_KEY] ?? null;
  }
  const existing = read(raw);
  if (existing) return existing;

  const params = new URLSearchParams(window.location.search);
  const utm: Utm = {
    utm_source: cleanUtm(params.get("utm_source")),
    utm_medium: cleanUtm(params.get("utm_medium")),
    utm_campaign: cleanUtm(params.get("utm_campaign")),
  };
  const serialized = JSON.stringify(utm);
  try {
    window.sessionStorage.setItem(UTM_KEY, serialized);
  } catch {
    state.memory[UTM_KEY] = serialized;
  }
  return utm;
}

/** The locale of the route: `<html lang>` as set by the locale layout, else the path prefix. */
function currentLocale(): Locale {
  const lang = document.documentElement.lang;
  if (isLocaleCode(lang)) return lang;
  const first = window.location.pathname.split("/")[1];
  return isLocaleCode(first) ? first : DEFAULT_LOCALE;
}

/** The referring site's host, only when it is another site. */
function referrerHost(): string | null {
  if (!document.referrer) return null;
  try {
    const host = new URL(document.referrer).host;
    return host && host !== window.location.host ? cleanHost(host) : null;
  } catch {
    return null;
  }
}

function currentPath(): string {
  return cleanPath(window.location.pathname.slice(0, ACQ_LIMITS.PATH)) ?? "/";
}

function send(body: string): void {
  try {
    if (typeof navigator.sendBeacon === "function") {
      const blob = new Blob([body], { type: "text/plain;charset=UTF-8" });
      if (navigator.sendBeacon(EVENTS_ENDPOINT, blob)) return;
    }
  } catch {
    // Fall through to fetch.
  }
  try {
    void fetch(EVENTS_ENDPOINT, {
      method: "POST",
      body,
      keepalive: true,
      credentials: "same-origin",
      headers: { "Content-Type": "text/plain;charset=UTF-8" },
    }).catch(() => {});
  } catch {
    // Analytics never breaks the page.
  }
}

/** Sends everything queued, in batches of at most 20 events and under 16 KB each. */
export function flushAnalytics(): void {
  if (state.timer !== null) {
    clearTimeout(state.timer);
    state.timer = null;
  }
  if (typeof window === "undefined") return;
  while (state.queue.length > 0) {
    const batch: QueuedEvent[] = [];
    let body = "";
    while (state.queue.length > 0 && batch.length < ACQ_LIMITS.BATCH) {
      const next = JSON.stringify({ events: [...batch, state.queue[0]] });
      if (new TextEncoder().encode(next).length > MAX_BODY_BYTES) break;
      batch.push(state.queue.shift()!);
      body = next;
    }
    // A single event too large to send on its own is dropped (props are capped, so this is defensive).
    if (batch.length === 0) {
      state.queue.shift();
      continue;
    }
    send(body);
  }
}

function schedule(): void {
  if (!state.started || state.timer !== null || state.queue.length === 0) return;
  state.timer = setTimeout(() => {
    state.timer = null;
    flushAnalytics();
  }, FLUSH_INTERVAL_MS);
}

function enqueue(event: AnalyticsEvent, props: AnalyticsProps): void {
  if (!trackingAllowed()) return;
  const { form, ...rest } = props;
  const clean = cleanProps(rest);
  if (!clean) {
    if (process.env.NODE_ENV !== "production") console.warn("[igudar:track] dropped: props break the privacy rules", event);
    return;
  }
  state.queue.push({
    visitor_id: storedId("local", VISITOR_KEY),
    session_id: storedId("session", SESSION_KEY),
    event,
    form: isEventForm(form) ? form : null,
    path: currentPath(),
    locale: currentLocale(),
    referrer_host: referrerHost(),
    ...sessionUtm(),
    props: clean,
  });
  if (state.queue.length > MAX_QUEUE) state.queue.splice(0, state.queue.length - MAX_QUEUE);
  if (state.started && state.queue.length >= ACQ_LIMITS.BATCH) flushAnalytics();
  else schedule();
}

/**
 * Records an event. `props.form` (one of the contract's form names) becomes the event's form
 * column; every other prop must be a bucket or a stable id, never personal data.
 */
export function track(event: AnalyticsEvent, props: AnalyticsProps = {}): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(TRACK_EVENT_NAME, { detail: { event, props } }));
  if (process.env.NODE_ENV !== "production") {
    console.debug("[igudar:track]", event, props);
  }
  try {
    enqueue(event, props);
  } catch {
    // Analytics never breaks the page.
  }
}

const onPageHide = () => flushAnalytics();
const onVisibility = () => {
  if (document.visibilityState === "hidden") flushAnalytics();
};

/** Starts sending (idempotent). Returns a function that stops it; queued events are kept. */
export function startAnalytics(): () => void {
  if (typeof window === "undefined") return () => {};
  if (!state.started) {
    state.started = true;
    window.addEventListener("pagehide", onPageHide);
    document.addEventListener("visibilitychange", onVisibility);
    schedule();
  }
  return stopAnalytics;
}

export function stopAnalytics(): void {
  if (typeof window === "undefined") return;
  state.started = false;
  if (state.timer !== null) {
    clearTimeout(state.timer);
    state.timer = null;
  }
  window.removeEventListener("pagehide", onPageHide);
  document.removeEventListener("visibilitychange", onVisibility);
}

/**
 * Context sent with a form submission so a lead can be matched to its visit: the page, and,
 * unless the visitor opted out (DNT / GPC), the visitor id and the session's UTM values.
 */
export function formAttribution(): {
  path?: string;
  visitorId?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
} {
  if (typeof window === "undefined") return {};
  const path = currentPath();
  if (!trackingAllowed()) return { path };
  try {
    const utm = sessionUtm();
    return {
      path,
      visitorId: storedId("local", VISITOR_KEY),
      ...(utm.utm_source ? { utmSource: utm.utm_source } : {}),
      ...(utm.utm_medium ? { utmMedium: utm.utm_medium } : {}),
      ...(utm.utm_campaign ? { utmCampaign: utm.utm_campaign } : {}),
    };
  } catch {
    return { path };
  }
}
