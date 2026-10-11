"use client";

import { useId, useState, type FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";
import { formatMad, scenarioLabel, type ScenarioKey } from "@/lib/finance";
import { ticketBucket } from "@/lib/simulator";
import { track } from "@/lib/analytics";

type Status = "idle" | "sending" | "done" | "error";

/**
 * Optional, non-binding interest capture (Gate 2 validation). Consent is never
 * pre-checked and its timestamp is taken when the visitor submits.
 */
export function InterestCapture({ amountMad, scenario }: { amountMad: number; scenario: ScenarioKey }) {
  const id = useId();
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

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
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      track("interest_submit", { amount_bucket: ticketBucket(amountMad), scenario });
      setStatus("done");
    } catch {
      setStatus("error");
      setMessage("We could not reach the server. Please try again.");
    }
  };

  if (status === "done") {
    return (
      <section className="rounded-3xl border border-border bg-card p-6" aria-live="polite">
        <p className="flex items-center gap-2 text-base font-semibold text-foreground">
          <CheckCircle2 className="size-5 text-success" aria-hidden="true" />
          Thank you. We noted your interest, with no commitment.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">Check your inbox for a confirmation. No money has been collected.</p>
      </section>
    );
  }

  return (
    <section aria-labelledby={`${id}-title`} className="rounded-3xl border border-border bg-card p-5 sm:p-6">
      <h2 id={`${id}-title`} className="text-lg font-bold text-foreground">
        Interested at this amount?
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
        Leave your email. It is non-binding and no money is collected. We will note{" "}
        <span className="financial-number font-semibold text-foreground">{formatMad(amountMad, { decimals: 0 })}</span>{" "}
        and the {scenarioLabel(scenario)} scenario you looked at.
      </p>
      <form onSubmit={onSubmit} className="mt-4 space-y-4" noValidate>
        <div>
          <label htmlFor={`${id}-email`} className="mb-1.5 block text-sm font-semibold text-foreground">
            Email
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
        <div className="absolute -left-[9999px]" aria-hidden="true">
          <label htmlFor={`${id}-website`}>Website</label>
          <input id={`${id}-website`} tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </div>
        <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-muted-foreground">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1 size-5 shrink-0 accent-primary"
          />
          <span>
            I agree that IGUDAR may store this email, the amount and the scenario to contact me about this
            non-binding interest.
          </span>
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
          {status === "sending" ? "Sending…" : "Note my interest"}
        </button>
      </form>
    </section>
  );
}
