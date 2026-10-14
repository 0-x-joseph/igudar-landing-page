"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { EventForm } from "@/lib/acquisition";
import { track } from "@/lib/analytics";
import { isWaitlistErrorCode } from "@/lib/waitlist-validation";

export interface FormTracking<T extends HTMLElement> {
  /** Callback ref for an inline form, so `form_view` fires when it scrolls into view. */
  observe: (el: T | null) => void;
  /** Put on the form's `onFocus` (it bubbles): the first focus records `form_start`. */
  onFocus: () => void;
  /** The server said ok. */
  submitted: () => void;
  /** The server's stable error code, or "network"; anything else is recorded as "unknown". */
  failed: (code: unknown) => void;
}

/**
 * Funnel events for one form: `form_view` (the modal opens, or an inline form scrolls into view),
 * `form_start` (first field focused), `form_submit` (the server said ok) and `form_error` with the
 * server's stable error code. Never a field value.
 *
 * Pass `open` for a modal; leave it out for an inline form and pass `observe` as the form's ref.
 */
export function useFormTracking<T extends HTMLElement = HTMLElement>(form: EventForm, open?: boolean): FormTracking<T> {
  const [el, setEl] = useState<T | null>(null);
  const viewed = useRef(false);
  const started = useRef(false);

  useEffect(() => {
    if (open === undefined) return;
    if (!open) {
      viewed.current = false;
      started.current = false;
    } else if (!viewed.current) {
      viewed.current = true;
      track("form_view", { form });
    }
  }, [form, open]);

  useEffect(() => {
    if (open !== undefined || !el || viewed.current) return;
    const seen = () => {
      if (viewed.current) return;
      viewed.current = true;
      track("form_view", { form });
    };
    if (typeof IntersectionObserver === "undefined") {
      seen();
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          seen();
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [form, open, el]);

  const onFocus = useCallback(() => {
    if (started.current) return;
    started.current = true;
    track("form_start", { form });
  }, [form]);

  const submitted = useCallback(() => track("form_submit", { form }), [form]);

  const failed = useCallback(
    (code: unknown) =>
      track("form_error", { form, code: code === "network" || isWaitlistErrorCode(code) ? code : "unknown" }),
    [form],
  );

  return { observe: setEl, onFocus, submitted, failed };
}
