/**
 * Tiny analytics hook: events are dispatched on `window` as `igudar:track` so any
 * provider can listen later. Props must never carry personal data (no email,
 * no exact amount: use ticketBucket).
 */
export type AnalyticsEvent =
  | "sim_view"
  | "sim_amount_change"
  | "sim_scenario_change"
  | "sim_explainer_open"
  | "calc_view"
  | "interest_submit"
  | "beta_apply";

export type AnalyticsProps = Record<string, string | number | boolean>;

export const TRACK_EVENT_NAME = "igudar:track";

export function track(event: AnalyticsEvent, props: AnalyticsProps = {}): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(TRACK_EVENT_NAME, { detail: { event, props } }));
  if (process.env.NODE_ENV !== "production") {
    console.debug("[igudar:track]", event, props);
  }
}
