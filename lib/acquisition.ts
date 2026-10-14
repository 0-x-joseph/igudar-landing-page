/**
 * The acquisition-analytics contract shared with the app repo, which owns the schema
 * (migration `20261014000400_acquisition_analytics.sql` in 0-x-joseph/igudar). Every list
 * and limit here mirrors a CHECK constraint there; change both together or inserts fail.
 *
 * Isomorphic and pure: the browser sender and the server routes use the same rules, so a
 * value the browser would send is a value the server accepts, and nothing personal passes.
 */
import { LOCALES, type Locale } from "@/i18n/routing";

export const LANDING_EVENTS = [
  "page_view",
  "cta_click",
  "form_view",
  "form_start",
  "form_submit",
  "form_error",
  "sim_view",
  "sim_amount_change",
  "sim_scenario_change",
  "sim_explainer_open",
  "calc_view",
  "interest_submit",
  "beta_apply",
  "language_change",
] as const;
export type LandingEvent = (typeof LANDING_EVENTS)[number];

/** Forms that can appear on an event (`landing_events.form`). */
export const EVENT_FORMS = ["waitlist_modal", "simulator_interest", "beta_application"] as const;
export type EventForm = (typeof EVENT_FORMS)[number];

/** Forms stored in `landing_leads` (beta applications have their own table). */
export const LEAD_FORMS = ["waitlist_modal", "simulator_interest"] as const;
export type LeadForm = (typeof LEAD_FORMS)[number];

export const ACQ_LIMITS = {
  PATH: 200,
  REFERRER_HOST: 120,
  UTM: 100,
  PROPS_BYTES: 2000,
  /** Events per request to /api/events. */
  BATCH: 20,
  /** Bytes per request to /api/events. */
  REQUEST_BYTES: 16 * 1024,
  PROP_KEYS: 12,
  PROP_STRING: 100,
} as const;

/**
 * Keys that could carry personal data or an exact amount. An event carrying one is never sent
 * (browser) and never stored (server); amounts travel as buckets only.
 */
export const FORBIDDEN_PROP_KEYS = [
  "email",
  "name",
  "first_name",
  "last_name",
  "full_name",
  "phone",
  "location",
  "city",
  "address",
  "amount",
  "amount_mad",
  "ticket",
  "query",
  "search",
  "url",
  "href",
  "referrer",
  "ip",
  "user_agent",
] as const;

export type PropValue = string | number | boolean;
export type EventProps = Record<string, PropValue>;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PROP_KEY_RE = /^[a-z][a-z0-9_]{0,39}$/;
// Control characters, whitespace runs and anything that could start a query string or fragment.
const CONTROL_RE = /[\u0000-\u001f\u007f]/;
const HOST_RE = /^(?=.{1,120}$)[a-z0-9-]+(\.[a-z0-9-]+)*(:\d{1,5})?$/;

const byteLength = (s: string) => new TextEncoder().encode(s).length;

export function isLandingEvent(v: unknown): v is LandingEvent {
  return typeof v === "string" && (LANDING_EVENTS as readonly string[]).includes(v);
}
export function isEventForm(v: unknown): v is EventForm {
  return typeof v === "string" && (EVENT_FORMS as readonly string[]).includes(v);
}
export function isLocaleCode(v: unknown): v is Locale {
  return typeof v === "string" && (LOCALES as readonly string[]).includes(v);
}

/** A UUID, lower-cased, or null. */
export function cleanUuid(v: unknown): string | null {
  return typeof v === "string" && UUID_RE.test(v) ? v.toLowerCase() : null;
}

/** A pathname only: starts with "/", no query string or fragment, no control characters, at most 200 chars. */
export function cleanPath(v: unknown): string | null {
  if (typeof v !== "string") return null;
  if (!v.startsWith("/") || v.length > ACQ_LIMITS.PATH || /[?#\s]/.test(v) || CONTROL_RE.test(v)) return null;
  return v;
}

/** A bare host name (optionally with a port), lower-cased, at most 120 chars. */
export function cleanHost(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const host = v.toLowerCase();
  return HOST_RE.test(host) ? host : null;
}

/** A UTM value: a short single-line string with no "@" (an email is never a campaign), or null. */
export function cleanUtm(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  if (s === "" || s.length > ACQ_LIMITS.UTM || CONTROL_RE.test(s) || s.includes("@")) return null;
  return s;
}

/**
 * Validates event props. Returns null (the event must be dropped) when a key is malformed or
 * forbidden, a value is not a short string / finite number / boolean, a string looks like an
 * email, or the whole object exceeds the 2000-byte database limit.
 */
export function cleanProps(v: unknown): EventProps | null {
  if (v === undefined || v === null) return {};
  if (typeof v !== "object" || Array.isArray(v)) return null;
  const entries = Object.entries(v as Record<string, unknown>);
  if (entries.length > ACQ_LIMITS.PROP_KEYS) return null;
  const out: EventProps = {};
  for (const [key, value] of entries) {
    if (!PROP_KEY_RE.test(key) || (FORBIDDEN_PROP_KEYS as readonly string[]).includes(key)) return null;
    if (typeof value === "string") {
      if (value.length > ACQ_LIMITS.PROP_STRING || CONTROL_RE.test(value) || value.includes("@")) return null;
    } else if (typeof value === "number") {
      if (!Number.isFinite(value)) return null;
    } else if (typeof value !== "boolean") {
      return null;
    }
    out[key] = value;
  }
  return byteLength(JSON.stringify(out)) <= ACQ_LIMITS.PROPS_BYTES ? out : null;
}

/** Visitor context sent with a form submission. Every field is optional and dropped when invalid. */
export interface Attribution {
  visitorId: string | null;
  path: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
}

export function parseAttribution(body: Record<string, unknown>): Attribution {
  return {
    visitorId: cleanUuid(body.visitorId),
    path: cleanPath(body.path),
    utmSource: cleanUtm(body.utmSource),
    utmMedium: cleanUtm(body.utmMedium),
    utmCampaign: cleanUtm(body.utmCampaign),
  };
}

/** One row for `public.landing_events`, as validated by the server. */
export interface LandingEventRow {
  visitor_id: string;
  session_id: string;
  event: LandingEvent;
  form: EventForm | null;
  path: string;
  locale: Locale | null;
  referrer_host: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  props: EventProps;
}

const optional = <T>(v: unknown, clean: (x: unknown) => T | null): { ok: boolean; value: T | null } => {
  if (v === undefined || v === null) return { ok: true, value: null };
  const value = clean(v);
  return { ok: value !== null, value };
};

/**
 * Strictly validates one event from the browser. Any invalid field drops the whole event
 * (null) rather than storing a partial or coerced row. Unknown extra fields are ignored.
 */
export function parseLandingEvent(raw: unknown): LandingEventRow | null {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return null;
  const e = raw as Record<string, unknown>;
  if (!isLandingEvent(e.event)) return null;
  const visitor = cleanUuid(e.visitor_id);
  const session = cleanUuid(e.session_id);
  const path = cleanPath(e.path);
  if (!visitor || !session || !path) return null;

  const form = optional(e.form, (x) => (isEventForm(x) ? x : null));
  const locale = optional(e.locale, (x) => (isLocaleCode(x) ? x : null));
  const referrer = optional(e.referrer_host, cleanHost);
  const utmSource = optional(e.utm_source, cleanUtm);
  const utmMedium = optional(e.utm_medium, cleanUtm);
  const utmCampaign = optional(e.utm_campaign, cleanUtm);
  if (![form, locale, referrer, utmSource, utmMedium, utmCampaign].every((f) => f.ok)) return null;
  const props = cleanProps(e.props);
  if (!props) return null;

  return {
    visitor_id: visitor,
    session_id: session,
    event: e.event,
    form: form.value,
    path,
    locale: locale.value,
    referrer_host: referrer.value,
    utm_source: utmSource.value,
    utm_medium: utmMedium.value,
    utm_campaign: utmCampaign.value,
    props,
  };
}

/**
 * The validated rows of a raw /api/events body (JSON or the beacon's text/plain), or [] when the
 * body is unusable: over 16 KB, not JSON, not `{ events: [...] }`, or more than 20 events (an
 * oversize batch is refused whole; the browser never sends one). Invalid events are dropped.
 */
export function parseEventsBody(text: string): LandingEventRow[] {
  if (byteLength(text) > ACQ_LIMITS.REQUEST_BYTES) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return [];
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return [];
  const events = (parsed as { events?: unknown }).events;
  if (!Array.isArray(events) || events.length === 0 || events.length > ACQ_LIMITS.BATCH) return [];
  return events.map(parseLandingEvent).filter((e): e is LandingEventRow => e !== null);
}
