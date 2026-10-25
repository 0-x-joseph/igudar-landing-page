"use client";

import { useTranslations } from "next-intl";
import { ArrowRight, CalendarClock, Ticket, BadgePercent, type LucideIcon } from "lucide-react";
import { Link } from "@/i18n/navigation";
import AnimatedSection from "@/components/AnimatedSection";
import { MadCount } from "@/components/MadCount";
import { Hover } from "@/components/motion";
import { ReactiveGlow } from "@/components/brand";
import { FEE_GRID, LIMITS } from "@/lib/finance";
import { useFormat } from "@/lib/i18n/use-format";

// Three facts read straight from the fee grid and the legal constants. No investor counts, no track record.
// The words live in home.facts.items.<id>; the figures are computed here.
const factIcons: { id: "ticket" | "entry" | "exit"; icon: LucideIcon }[] = [
  { id: "ticket", icon: Ticket },
  { id: "entry", icon: BadgePercent },
  { id: "exit", icon: CalendarClock },
];

export default function FactsSection() {
  const t = useTranslations("home.facts");
  const { mad, percent } = useFormat();

  const figures: Record<(typeof factIcons)[number]["id"], { figure?: string; count?: number; note: string }> = {
    ticket: {
      count: LIMITS.MIN_TICKET_MAD,
      note: t("items.ticket.note", { step: mad(LIMITS.TICKET_STEP_MAD, { decimals: 0 }) }),
    },
    entry: {
      figure: percent(FEE_GRID.D1_STRUCTURING_HT, 1),
      note: t("items.entry.note"),
    },
    exit: {
      figure: t("items.exit.figure", { months: LIMITS.EXIT_WINDOW_MONTHS }),
      note: t("items.exit.note", { years: LIMITS.EXIT_LOCK_YEARS }),
    },
  };

  return (
    <section aria-labelledby="facts-title" className="group relative isolate overflow-hidden bg-surface-mist px-5 py-24 sm:px-6 lg:py-32">
      <ReactiveGlow className="inset-0" />
      <div className="relative mx-auto max-w-6xl">
        <AnimatedSection>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold text-primary">{t("eyebrow")}</p>
            <h2
              id="facts-title"
              className="mt-3 font-display text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl"
            >
              {t("title")}
            </h2>
          </div>
        </AnimatedSection>

        <ul className="mt-16 grid gap-4 md:grid-cols-3 md:gap-6">
          {factIcons.map((f, i) => {
            const data = figures[f.id];
            return (
              <li key={f.id} className="h-full">
                <AnimatedSection delay={i * 80} className="h-full">
                  <Hover className="h-full">
                  <div
                    data-fact-card=""
                    className="flex h-full flex-col items-center rounded-3xl border border-primary/15 bg-card p-8 text-center shadow-[0_1px_0_rgb(93_24_233/0.06)]"
                  >
                    <span
                      data-fact-icon=""
                      className="flex size-12 items-center justify-center rounded-2xl bg-accent text-primary"
                    >
                      <f.icon className="size-6" strokeWidth={1.7} aria-hidden="true" />
                    </span>
                    <p
                      data-fact-figure=""
                      className="financial-number mt-6 text-4xl font-bold tracking-tight text-primary md:text-3xl lg:text-[2.5rem]"
                    >
                      {data.count !== undefined ? <MadCount value={data.count} /> : data.figure}
                    </p>
                    <p className="mt-3 text-base font-semibold text-foreground">{t(`items.${f.id}.label`)}</p>
                    <p className="mt-1 max-w-xs text-sm leading-relaxed text-muted-foreground">{data.note}</p>
                  </div>
                  </Hover>
                </AnimatedSection>
              </li>
            );
          })}
        </ul>

        <div className="mt-14 text-center">
          <Link
            href="/pricing"
            className="inline-flex min-h-12 items-center gap-2 text-base font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {t("cta")}
            <ArrowRight className="size-4 rtl:-scale-x-100" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
