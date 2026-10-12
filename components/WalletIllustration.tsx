"use client";

import { useTranslations } from "next-intl";

import { LIMITS, simulate } from "@/lib/finance";
import { useFormat, useScenarioLabel } from "@/lib/i18n/use-format";
import { CountUp } from "@/components/CountUp";

/**
 * Static illustration of the platform wallet, built from the engine at the 25,000 MAD
 * Base case. Replaces the old dashboard screenshot. It has no actions on purpose.
 */
export default function WalletIllustration({ className = "" }: { className?: string }) {
  const t = useTranslations("sections.wallet");
  const common = useTranslations("common");
  const { mad } = useFormat();
  const scenarioLabel = useScenarioLabel();
  const sim = simulate({ ticketMad: LIMITS.MIN_TICKET_MAD, scenario: "base" });
  const scenario = scenarioLabel("base");

  const tiles = [
    { id: "committed", value: sim.input.ticketMad, received: false },
    { id: "escrow", value: 0, received: false },
    { id: "invested", value: sim.input.ticketMad, received: false },
    { id: "received", value: sim.netCashYear1Mad, received: true },
  ] as const;

  return (
    <figure className={`rounded-3xl border border-border bg-card p-5 sm:p-6 ${className}`}>
      <figcaption className="mb-5 flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-bold text-foreground">{t("heading")}</span>
        <span className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
          {t("badge")}
        </span>
      </figcaption>
      <dl className="grid grid-cols-2 gap-3">
        {tiles.map((tile) => (
          <div key={tile.id} className="rounded-2xl bg-background p-4">
            <dt className="text-xs font-semibold text-muted-foreground">{t(`tiles.${tile.id}.label`)}</dt>
            <dd
              className={`financial-number mt-1 text-xl font-bold tracking-tight sm:text-2xl ${
                tile.received ? "text-success" : "text-foreground"
              }`}
            >
              {tile.value > 0 ? (
                <span data-counted="">
                  <CountUp value={tile.value} format={(n) => mad(n)} />
                </span>
              ) : (
                mad(tile.value)
              )}
            </dd>
            <dd className="mt-1 text-xs leading-snug text-muted-foreground">{t(`tiles.${tile.id}.note`, { scenario })}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        {t("footnote", {
          amount: mad(LIMITS.MIN_TICKET_MAD, { decimals: 0 }),
          scenario,
          notice: common("notice.netIndicative"),
        })}
      </p>
    </figure>
  );
}
