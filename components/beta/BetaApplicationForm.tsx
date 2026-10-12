"use client";

import { useId, useState, type FormEvent, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CheckCircle2 } from "lucide-react";
import { track } from "@/lib/analytics";
import { LIMITS } from "@/lib/finance";
import { useFormat } from "@/lib/i18n/use-format";
import {
  BETA_EXPERIENCE_LEVELS,
  BETA_TICKET_BUCKETS,
  isWaitlistErrorCode,
  type BetaTicketBucket,
} from "@/lib/waitlist-validation";

type Status = "idle" | "sending" | "done" | "error";
type Field = "firstName" | "email" | "location" | "ticketBucket" | "experience" | "consent";
type Errors = Partial<Record<Field, string>>;

export const REGISTER_URL = "https://app.igudar.tech/auth/register";

const FIELD_ORDER: Field[] = ["firstName", "email", "location", "ticketBucket", "experience", "consent"];

/** Bucket boundaries in MAD. The first starts at the minimum ticket, read from the constants. */
const BUCKET_BOUNDS: Record<Exclude<BetaTicketBucket, "250k-plus" | "not-sure">, [number, number]> = {
  "25-50k": [LIMITS.MIN_TICKET_MAD, 50_000],
  "50-100k": [50_000, 100_000],
  "100-250k": [100_000, 250_000],
};
const TOP_BUCKET_FLOOR_MAD = 250_000;

const fieldClass =
  "h-12 w-full rounded-2xl border border-border bg-background px-4 text-base text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-[invalid=true]:border-destructive";
const labelClass = "mb-1.5 block text-sm font-semibold text-foreground";
const legendClass = "mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground";

/**
 * Closed-beta application. Posts to /api/waitlist with `source: "beta"`. Consent is never
 * pre-checked and its timestamp is taken when the applicant submits.
 */
export function BetaApplicationForm() {
  const t = useTranslations("beta");
  const locale = useLocale();
  const { mad, number } = useFormat();
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
  const fieldErrorText = (f: Field) => t(`form.errors.${f}`);

  /** "25,000 MAD to 50,000 MAD", "50,000 to 100,000 MAD", "More than 250,000 MAD", in the visitor's language. */
  const bucketLabel = (b: BetaTicketBucket): string => {
    if (b === "not-sure") return t("form.buckets.not-sure");
    if (b === "250k-plus") return t("form.buckets.250k-plus", { amount: mad(TOP_BUCKET_FLOOR_MAD, { decimals: 0 }) });
    const [from, to] = BUCKET_BOUNDS[b];
    // The first bucket spells the currency twice, because the minimum ticket stands on its own.
    const fromText = b === "25-50k" ? mad(from, { decimals: 0 }) : number(from);
    return t(`form.buckets.${b}`, { from: fromText, to: mad(to, { decimals: 0 }) });
  };

  const set = (f: keyof typeof values, v: string) => {
    setValues((prev) => ({ ...prev, [f]: v }));
    if (errors[f]) setErrors((prev) => ({ ...prev, [f]: undefined }));
  };

  const validate = (): Errors => {
    const e: Errors = {};
    if (values.firstName.trim() === "") e.firstName = fieldErrorText("firstName");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) e.email = fieldErrorText("email");
    if (values.location.trim() === "") e.location = fieldErrorText("location");
    if (values.ticketBucket === "") e.ticketBucket = fieldErrorText("ticketBucket");
    if (values.experience === "") e.experience = fieldErrorText("experience");
    if (!consent) e.consent = fieldErrorText("consent");
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
          locale,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setStatus("error");
        setMessage(isWaitlistErrorCode(data.error) ? t(`errors.${data.error}`) : t("form.genericError"));
        return;
      }
      track("beta_apply", { ticket_bucket: values.ticketBucket, experience: values.experience });
      setStatus("done");
    } catch {
      setStatus("error");
      setMessage(t("form.networkError"));
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
          {t("form.success.title")}
        </p>
        <h3 className="mt-6 text-sm font-semibold text-foreground">{t("form.success.nextTitle")}</h3>
        <ol className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
          <li>{t("form.success.steps.read")}</li>
          <li>{t("form.success.steps.email")}</li>
          <li>{t("form.success.steps.create")}</li>
        </ol>
        <a
          href={REGISTER_URL}
          className="mt-6 inline-flex min-h-12 items-center justify-center rounded-2xl bg-primary px-8 text-base font-semibold text-primary-foreground transition-colors hover:bg-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {t("form.success.cta")}
        </a>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{t("form.success.note")}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      aria-label={t("form.ariaLabel")}
      className="relative space-y-8 rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-8"
    >
      <fieldset className="min-w-0">
        <legend className={legendClass}>{t("form.legends.about")}</legend>
        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor={fid("firstName")} className={labelClass}>
                {t("form.fields.firstName")}
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
                {t("form.fields.email")}
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
              {t("form.fields.location")}
            </label>
            <input
              id={fid("location")}
              required
              autoComplete="off"
              maxLength={80}
              placeholder={t("form.fields.locationPlaceholder")}
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
        <legend className={legendClass}>{t("form.legends.interest")}</legend>
        <div className="space-y-5">
          <div>
            <label htmlFor={fid("ticketBucket")} className={labelClass}>
              {t("form.fields.ticketBucket")}
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
              <option value="">{t("form.fields.ticketPlaceholder")}</option>
              {BETA_TICKET_BUCKETS.map((b) => (
                <option key={b} value={b}>
                  {bucketLabel(b)}
                </option>
              ))}
            </select>
            {fieldError("ticketBucket")}
            <p id={`${id}-amount-hint`} className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              {t("form.fields.ticketHint")}
            </p>
          </div>

          <div>
            <label htmlFor={fid("experience")} className={labelClass}>
              {t("form.fields.experience")}
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
              <option value="">{t("form.fields.experiencePlaceholder")}</option>
              {BETA_EXPERIENCE_LEVELS.map((x) => (
                <option key={x} value={x}>
                  {t(`form.experience.${x}`)}
                </option>
              ))}
            </select>
            {fieldError("experience")}
          </div>
        </div>
      </fieldset>

      {/* Honeypot: hidden from people, filled by bots. */}
      <div className="absolute -start-[9999px]" aria-hidden="true">
        <label htmlFor={`${id}-website`}>{t("form.fields.website")}</label>
        <input
          id={`${id}-website`}
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <fieldset className="min-w-0">
        <legend className="sr-only">{t("form.legends.consent")}</legend>
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
          <span>{t("form.consent")}</span>
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
          {status === "sending" ? t("form.sending") : t("form.submit")}
        </button>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{t("form.next")}</p>
      </div>
    </form>
  );
}
