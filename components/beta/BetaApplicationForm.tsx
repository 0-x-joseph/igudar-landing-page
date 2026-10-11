"use client";

import { useId, useState, type FormEvent, type ReactNode } from "react";
import { CheckCircle2 } from "lucide-react";
import { track } from "@/lib/analytics";
import {
  BETA_EXPERIENCE_LABELS,
  BETA_EXPERIENCE_LEVELS,
  BETA_TICKET_BUCKETS,
  BETA_TICKET_BUCKET_LABELS,
} from "@/lib/waitlist-validation";

type Status = "idle" | "sending" | "done" | "error";
type Field = "firstName" | "email" | "location" | "ticketBucket" | "experience" | "consent";
type Errors = Partial<Record<Field, string>>;

export const BETA_SUCCESS_MESSAGE = "Thanks — a founder reviews every application by hand. You'll hear from us by email.";
export const REGISTER_URL = "https://app.igudar.tech/auth/register";

const ERROR_TEXT: Record<Field, string> = {
  firstName: "Please tell us your first name.",
  email: "Please enter a valid email address.",
  location: "Please tell us your city and country.",
  ticketBucket: "Please choose an amount range.",
  experience: "Please choose your experience level.",
  consent: "Please tick the box to agree before applying.",
};

const FIELD_ORDER: Field[] = ["firstName", "email", "location", "ticketBucket", "experience", "consent"];

const fieldClass =
  "h-12 w-full rounded-2xl border border-border bg-background px-4 text-base text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-[invalid=true]:border-destructive";
const labelClass = "mb-1.5 block text-sm font-semibold text-foreground";
const legendClass = "mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground";

/**
 * Closed-beta application. Posts to /api/waitlist with `source: "beta"`. Consent is never
 * pre-checked and its timestamp is taken when the applicant submits.
 */
export function BetaApplicationForm() {
  const id = useId();
  const [values, setValues] = useState({
    firstName: "",
    email: "",
    location: "",
    ticketBucket: "",
    experience: "",
  });
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const fid = (f: Field) => `${id}-${f}`;
  const errId = (f: Field) => `${id}-${f}-error`;

  const set = (f: keyof typeof values, v: string) => {
    setValues((prev) => ({ ...prev, [f]: v }));
    if (errors[f]) setErrors((prev) => ({ ...prev, [f]: undefined }));
  };

  const validate = (): Errors => {
    const e: Errors = {};
    if (values.firstName.trim() === "") e.firstName = ERROR_TEXT.firstName;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) e.email = ERROR_TEXT.email;
    if (values.location.trim() === "") e.location = ERROR_TEXT.location;
    if (values.ticketBucket === "") e.ticketBucket = ERROR_TEXT.ticketBucket;
    if (values.experience === "") e.experience = ERROR_TEXT.experience;
    if (!consent) e.consent = ERROR_TEXT.consent;
    return e;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === "sending") return;
    const found = validate();
    setErrors(found);
    const first = FIELD_ORDER.find((f) => found[f]);
    if (first) {
      setStatus("idle");
      setMessage("");
      document.getElementById(fid(first))?.focus();
      return;
    }
    setStatus("sending");
    setMessage("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: values.email.trim(),
          honeypot: website,
          source: "beta",
          firstName: values.firstName.trim(),
          location: values.location.trim(),
          ticketBucket: values.ticketBucket,
          experience: values.experience,
          consentAt: new Date().toISOString(),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      track("beta_apply", { ticket_bucket: values.ticketBucket, experience: values.experience });
      setStatus("done");
    } catch {
      setStatus("error");
      setMessage("We could not reach the server. Please try again.");
    }
  };

  const describe = (f: Field, extra?: string) =>
    [errors[f] ? errId(f) : null, extra].filter(Boolean).join(" ") || undefined;
  const fieldError = (f: Field): ReactNode =>
    errors[f] ? (
      <p id={errId(f)} className="mt-1.5 text-sm font-medium text-destructive">
        {errors[f]}
      </p>
    ) : null;

  if (status === "done") {
    return (
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8" role="status" aria-live="polite">
        <p className="flex items-start gap-3 text-lg font-semibold leading-snug text-foreground">
          <CheckCircle2 className="mt-0.5 size-6 shrink-0 text-success" aria-hidden="true" />
          {BETA_SUCCESS_MESSAGE}
        </p>
        <h3 className="mt-6 text-sm font-semibold text-foreground">What happens next</h3>
        <ol className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
          <li>1. A founder reads your application by hand.</li>
          <li>2. You get an email with your access.</li>
          <li>3. Once approved, create your account here.</li>
        </ol>
        <a
          href={REGISTER_URL}
          className="mt-6 inline-flex min-h-12 items-center justify-center rounded-2xl bg-primary px-8 text-base font-semibold text-primary-foreground transition-colors hover:bg-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Create your account
        </a>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          No money is collected, and nothing is committed.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      aria-label="Apply for the beta"
      className="relative space-y-8 rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-8"
    >
      <fieldset className="min-w-0">
        <legend className={legendClass}>About you</legend>
        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor={fid("firstName")} className={labelClass}>
                First name
              </label>
              <input
                id={fid("firstName")}
                required
                autoComplete="given-name"
                maxLength={60}
                value={values.firstName}
                onChange={(e) => set("firstName", e.target.value)}
                aria-invalid={errors.firstName ? true : undefined}
                aria-describedby={describe("firstName")}
                className={fieldClass}
              />
              {fieldError("firstName")}
            </div>
            <div>
              <label htmlFor={fid("email")} className={labelClass}>
                Email
              </label>
              <input
                id={fid("email")}
                type="email"
                required
                autoComplete="email"
                value={values.email}
                onChange={(e) => set("email", e.target.value)}
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={describe("email")}
                className={fieldClass}
              />
              {fieldError("email")}
            </div>
          </div>
          <div>
            <label htmlFor={fid("location")} className={labelClass}>
              City and country
            </label>
            <input
              id={fid("location")}
              required
              autoComplete="off"
              maxLength={80}
              placeholder="Casablanca, Morocco"
              value={values.location}
              onChange={(e) => set("location", e.target.value)}
              aria-invalid={errors.location ? true : undefined}
              aria-describedby={describe("location")}
              className={fieldClass}
            />
            {fieldError("location")}
          </div>
        </div>
      </fieldset>

      <fieldset className="min-w-0">
        <legend className={legendClass}>Your interest</legend>
        <div className="space-y-5">
          <div>
            <label htmlFor={fid("ticketBucket")} className={labelClass}>
              What would you realistically consider, per property?
            </label>
            <select
              id={fid("ticketBucket")}
              required
              value={values.ticketBucket}
              onChange={(e) => set("ticketBucket", e.target.value)}
              aria-invalid={errors.ticketBucket ? true : undefined}
              aria-describedby={describe("ticketBucket", `${id}-amount-hint`)}
              className={fieldClass}
            >
              <option value="">Choose a range</option>
              {BETA_TICKET_BUCKETS.map((b) => (
                <option key={b} value={b}>
                  {BETA_TICKET_BUCKET_LABELS[b]}
                </option>
              ))}
            </select>
            {fieldError("ticketBucket")}
            <p id={`${id}-amount-hint`} className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              This only helps us understand the range. The beta uses demo money.
            </p>
          </div>

          <div>
            <label htmlFor={fid("experience")} className={labelClass}>
              Your experience with property or savings products
            </label>
            <select
              id={fid("experience")}
              required
              value={values.experience}
              onChange={(e) => set("experience", e.target.value)}
              aria-invalid={errors.experience ? true : undefined}
              aria-describedby={describe("experience")}
              className={fieldClass}
            >
              <option value="">Choose one</option>
              {BETA_EXPERIENCE_LEVELS.map((x) => (
                <option key={x} value={x}>
                  {BETA_EXPERIENCE_LABELS[x]}
                </option>
              ))}
            </select>
            {fieldError("experience")}
          </div>
        </div>
      </fieldset>

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

      <fieldset className="min-w-0">
        <legend className="sr-only">Consent</legend>
        <label className="flex min-h-11 cursor-pointer items-start gap-3 text-sm leading-relaxed text-muted-foreground">
          <input
            id={fid("consent")}
            type="checkbox"
            checked={consent}
            onChange={(e) => {
              setConsent(e.target.checked);
              if (errors.consent) setErrors((prev) => ({ ...prev, consent: undefined }));
            }}
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={describe("consent")}
            className="mt-0.5 size-6 shrink-0 accent-primary"
          />
          <span>
            I agree that IGUDAR may store these answers and my email to review my application and contact me about the
            closed beta. I understand the beta uses demo money.
          </span>
        </label>
        {fieldError("consent")}
      </fieldset>

      {status === "error" && (
        <p role="alert" className="rounded-2xl bg-muted px-4 py-3 text-sm font-medium text-destructive">
          {message}
        </p>
      )}

      <div>
        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-primary px-8 text-base font-semibold text-primary-foreground transition-colors hover:bg-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
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
