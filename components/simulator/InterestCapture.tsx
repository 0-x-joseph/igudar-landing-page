"use client";

import { useId, useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CheckCircle2 } from "lucide-react";
import { type ScenarioKey } from "@/lib/finance";
import { useFormat, useScenarioLabel } from "@/lib/i18n/use-format";
import { ticketBucket } from "@/lib/simulator";
import { isWaitlistErrorCode } from "@/lib/waitlist-validation";
import { formAttribution, track } from "@/lib/analytics";
import { useFormTracking } from "@/components/analytics/useFormTracking";

type Status = "idle" | "sending" | "done" | "error";

/**
 * Optional, non-binding interest capture (Gate 2 validation). Consent is never
 * pre-checked and its timestamp is taken when the visitor submits. The visitor's
 * language travels with the request so the confirmation email matches it.
 */
export function InterestCapture({ amountMad, scenario }: { amountMad: number; scenario: ScenarioKey }) {
  const t = useTranslations("simulator.interest");
  const tErrors = useTranslations("beta.errors");
  const locale = useLocale();
  const scenarioLabel = useScenarioLabel();
  const { mad } = useFormat();
  const id = useId();
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const { observe: observeForm, onFocus: onFormFocus, submitted: formSubmitted, failed: formFailed } =
    useFormTracking<HTMLFormElement>("simulator_interest");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!consent || status === "sending") return;
    setStatus("sending");
    setMessage("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          honeypot: website,
          amountMad,
          scenario,
          consentAt: new Date().toISOString(),
          source: "simulator",
          locale,
          ...formAttribution(),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: unknown };
      if (!res.ok) {
        formFailed(data.error);
        // The API answers with a code, never a sentence; the words come from the visitor's language.
        setStatus("error");
        setMessage(isWaitlistErrorCode(data.error) ? tErrors(data.error) : t("errorGeneric"));
        return;
      }
      formSubmitted();
      track("interest_submit", { amount_bucket: ticketBucket(amountMad), scenario });
      setStatus("done");
    } catch {
      formFailed("network");
      setStatus("error");
      setMessage(t("errorNetwork"));
    }
  };

  if (status === "done") {
    return (
      <section className="rounded-3xl border border-border bg-card p-6" aria-live="polite">
        <p className="flex items-center gap-2 text-base font-semibold text-foreground">
          <CheckCircle2 className="size-5 text-success" aria-hidden="true" />
          {t("doneTitle")}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">{t("doneBody")}</p>
      </section>
    );
  }

  return (
    <section aria-labelledby={`${id}-title`} className="rounded-3xl border border-border bg-card p-5 sm:p-6">
      <h2 id={`${id}-title`} className="text-lg font-bold text-foreground">
        {t("title")}
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
        {t.rich("intro", {
          amount: mad(amountMad, { decimals: 0 }),
          scenario: scenarioLabel(scenario),
          strong: (chunks) => <span className="financial-number font-semibold text-foreground">{chunks}</span>,
        })}
      </p>
      <form ref={observeForm} onSubmit={onSubmit} onFocus={onFormFocus} className="mt-4 space-y-4" noValidate>
        <div>
          <label htmlFor={`${id}-email`} className="mb-1.5 block text-sm font-semibold text-foreground">
            {t("email")}
          </label>
          <input
            id={`${id}-email`}
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-base text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          />
        </div>
        {/* Honeypot: hidden from people, filled by bots. */}
        <div className="absolute -start-[9999px]" aria-hidden="true">
          <label htmlFor={`${id}-website`}>{t("website")}</label>
          <input id={`${id}-website`} tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </div>
        <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-muted-foreground">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1 size-5 shrink-0 accent-primary"
          />
          <span>{t("consent")}</span>
        </label>
        {status === "error" && (
          <p role="alert" className="text-sm font-medium text-destructive">
            {message}
          </p>
        )}
        <button
          type="submit"
          disabled={!consent || email.trim() === "" || status === "sending"}
          className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-primary px-6 text-base font-semibold text-primary-foreground transition-colors hover:bg-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === "sending" ? t("sending") : t("submit")}
        </button>
      </form>
    </section>
  );
}
