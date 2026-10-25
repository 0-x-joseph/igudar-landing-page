"use client";

import { useTranslations } from "next-intl";
import { ArrowRight, Check } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { FEE_GRID, TAX, simulate } from "@/lib/finance";
import { useFormat } from "@/lib/i18n/use-format";
import { ReactiveGlow, ZelligeBand } from "@/components/brand";
import AnimatedSection from "@/components/AnimatedSection";
import PlanCards from "@/components/pricing/PlanCards";
import { Reveal } from "@/components/motion";
import { IndicativeNotice } from "@/components/simulator/IndicativeNotice";
import PricingTable, { EXAMPLE_TICKET_MAD } from "@/components/pricing/PricingTable";

const linkClass =
  "inline-flex min-h-12 items-center gap-2 text-base font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

/** Who bears each fee. Rates read from the grid; D1 is the only fee the investor pays directly. */
const NOT_PAID = [
  { id: "entry", rate: FEE_GRID.D1_STRUCTURING_HT, decimals: 1 },
  { id: "company", rate: FEE_GRID.D2_PLATFORM_HT, decimals: 2 },
  { id: "syndication", rate: FEE_GRID.S1_SYNDICATION, decimals: 1 },
] as const;

export default function PricingPageContent() {
  const t = useTranslations("pricing");
  const f = useFormat();
  const entryFee = simulate({ ticketMad: EXAMPLE_TICKET_MAD, scenario: "base" });
  return (
    <>
      <section className="group relative isolate overflow-hidden px-5 pb-12 pt-36 sm:px-6 lg:pb-16 lg:pt-44">
        <ReactiveGlow className="inset-x-0 top-0 -z-10 h-full" />
        <div className="mx-auto max-w-4xl text-center">
          <Reveal on="mount">
            <p className="text-sm font-semibold text-primary">{t("hero.eyebrow")}</p>
            <h1 className="mt-3 font-display text-5xl font-semibold leading-[1.02] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              {t("hero.title")}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              {t("hero.lead", {
                rate: f.percent(FEE_GRID.D1_STRUCTURING_HT, 1),
                fee: f.mad(entryFee.entryFeeMad, { decimals: 0 }),
                ticket: f.mad(EXAMPLE_TICKET_MAD, { decimals: 0 }),
              })}
            </p>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">{t("hero.beta")}</p>
          </Reveal>
        </div>
      </section>

      <section aria-label={t("plans.sectionLabel")} className="px-5 pb-20 sm:px-6 lg:pb-28">
        <div className="mx-auto max-w-6xl">
          <PlanCards />
        </div>
      </section>

      <ZelligeBand className="mx-auto max-w-4xl" />

      <section aria-labelledby="fee-grid-title" className="px-5 py-20 sm:px-6 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <h2
            id="fee-grid-title"
            className="mb-10 max-w-2xl font-display text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl"
          >
            {t("table.title")}
          </h2>
          <PricingTable />
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {t("table.note", { ticket: f.mad(EXAMPLE_TICKET_MAD, { decimals: 0 }), tva: f.percent(TAX.TVA_ON_FEES, 0) })}
          </p>
        </div>
      </section>

      <ZelligeBand className="mx-auto max-w-4xl" />

      <section aria-labelledby="not-paid-title" className="px-5 py-20 sm:px-6 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <AnimatedSection>
            <h2
              id="not-paid-title"
              className="max-w-2xl font-display text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl"
            >
              {t("notPaid.title")}
            </h2>
          </AnimatedSection>
          <ul className="mt-12 grid gap-4 md:grid-cols-3">
            {NOT_PAID.map((item) => (
              <li key={item.id} className="rounded-3xl border border-border bg-card p-6 sm:p-8">
                <span className="flex size-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <Check className="size-5" strokeWidth={2} aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-foreground">{t(`notPaid.items.${item.id}.title`)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {t(`notPaid.items.${item.id}.text`, {
                    rate: f.percent(item.rate, item.decimals),
                    fee: f.mad(entryFee.entryFeeMad, { decimals: 0 }),
                    ticket: f.mad(EXAMPLE_TICKET_MAD, { decimals: 0 }),
                    exit: f.percent(FEE_GRID.D3_EXIT_HT, 1),
                    performance: f.percent(FEE_GRID.D5_PERFORMANCE, 0),
                    hurdle: f.percent(FEE_GRID.D5_HURDLE, 0),
                    tva: f.percent(TAX.TVA_ON_FEES, 0),
                  })}
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-6 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {t("notPaid.footnote", { transfer: f.percent(FEE_GRID.D4_TRANSFER_HT, 0) })}
          </p>
        </div>
      </section>

      <section className="px-5 pb-24 sm:px-6 lg:pb-32">
        <div className="mx-auto max-w-4xl space-y-8 text-center">
          <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">
            {t("cta.title")}
          </h2>
          <div className="flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-8">
            <Link href="/calculator" data-track="pricing_calculator" className={linkClass}>
              {t("cta.calculator")}
              <ArrowRight className="size-4 rtl:-scale-x-100" aria-hidden="true" />
            </Link>
            <Link href="/faq" data-track="pricing_faq" className={linkClass}>
              {t("cta.faq")}
              <ArrowRight className="size-4 rtl:-scale-x-100" aria-hidden="true" />
            </Link>
          </div>
          <IndicativeNotice className="text-start" />
        </div>
      </section>
    </>
  );
}
