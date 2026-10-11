"use client";

import { useId, useState, type FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";
import { track } from "@/lib/analytics";
import {
  BETA_EXPERIENCE_LABELS,
  BETA_EXPERIENCE_LEVELS,
  BETA_TICKET_BUCKETS,
  BETA_TICKET_BUCKET_LABELS,
} from "@/lib/waitlist-validation";

type Status = "idle" | "sending" | "done" | "error";

export const BETA_SUCCESS_MESSAGE = "Thanks — a founder reviews every application by hand. You'll hear from us by email.";

const fieldClass =
  "h-12 w-full rounded-2xl border border-border bg-background px-4 text-base text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
const labelClass = "mb-1.5 block text-sm font-semibold text-foreground";

/**
 * Closed-beta application. Posts to /api/waitlist with `source: "beta"`. Consent is never
 * pre-checked and its timestamp is taken when the applicant submits.
 */
export function BetaApplicationForm() {
  const id = useId();
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [ticketBucket, setTicketBucket] = useState("");
  const [experience, setExperience] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const complete =
    firstName.trim() !== "" &&
    email.trim() !== "" &&
    location.trim() !== "" &&
    ticketBucket !== "" &&
    experience !== "" &&
    consent;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!complete || status === "sending") return;
    setStatus("sending");
    setMessage("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          honeypot: website,
          source: "beta",
          firstName: firstName.trim(),
          location: location.trim(),
          ticketBucket,
          experience,
          consentAt: new Date().toISOString(),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      track("beta_apply", { ticket_bucket: ticketBucket, experience });
      setStatus("done");
    } catch {
      setStatus("error");
      setMessage("We could not reach the server. Please try again.");
    }
  };

  if (status === "done") {
    return (
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8" role="status" aria-live="polite">
        <p className="flex items-start gap-3 text-lg font-semibold leading-snug text-foreground">
          <CheckCircle2 className="mt-0.5 size-6 shrink-0 text-success" aria-hidden="true" />
          {BETA_SUCCESS_MESSAGE}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Nothing more to do for now. No money is collected, and nothing is committed.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      aria-label="Apply for the beta"
      className="relative space-y-5 rounded-3xl border border-border bg-card p-5 sm:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={`${id}-name`} className={labelClass}>
            First name
          </label>
          <input
            id={`${id}-name`}
            required
            autoComplete="given-name"
            maxLength={60}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor={`${id}-email`} className={labelClass}>
            Email
          </label>
          <input
            id={`${id}-email`}
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={fieldClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor={`${id}-location`} className={labelClass}>
          City and country
        </label>
        <input
          id={`${id}-location`}
          required
          autoComplete="off"
          maxLength={80}
          placeholder="Casablanca, Morocco"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor={`${id}-amount`} className={labelClass}>
          What would you realistically consider, per property?
        </label>
        <select
          id={`${id}-amount`}
          required
          value={ticketBucket}
          onChange={(e) => setTicketBucket(e.target.value)}
          aria-describedby={`${id}-amount-hint`}
          className={fieldClass}
        >
          <option value="">Choose a range</option>
          {BETA_TICKET_BUCKETS.map((b) => (
            <option key={b} value={b}>
              {BETA_TICKET_BUCKET_LABELS[b]}
            </option>
          ))}
        </select>
        <p id={`${id}-amount-hint`} className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
          This only helps us understand the range. The beta uses demo money.
        </p>
      </div>

      <div>
        <label htmlFor={`${id}-experience`} className={labelClass}>
          Your experience with property or savings products
        </label>
        <select
          id={`${id}-experience`}
          required
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
          className={fieldClass}
        >
          <option value="">Choose one</option>
          {BETA_EXPERIENCE_LEVELS.map((x) => (
            <option key={x} value={x}>
              {BETA_EXPERIENCE_LABELS[x]}
            </option>
          ))}
        </select>
      </div>

      {/* Honeypot: hidden from people, filled by bots. */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor={`${id}-website`}>Website</label>
        <input
          id={`${id}-website`}
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-muted-foreground">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-1 size-5 shrink-0 accent-primary"
        />
        <span>
          I agree that IGUDAR may store these answers and my email to review my application and contact me about the
          closed beta. I understand the beta uses demo money.
        </span>
      </label>

      {status === "error" && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {message}
        </p>
      )}

      <div>
        <button
          type="submit"
          disabled={!complete || status === "sending"}
          className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-primary px-8 text-base font-semibold text-primary-foreground transition-colors hover:bg-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {status === "sending" ? "Sending…" : "Apply for the beta"}
        </button>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Next: a founder reads your application by hand and writes to you by email.
        </p>
      </div>
    </form>
  );
}
