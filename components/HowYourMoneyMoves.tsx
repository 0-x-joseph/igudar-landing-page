import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { LIMITS } from "@/lib/finance";
import { Link } from "@/i18n/navigation";
import MoneyFlowDiagram from "@/components/MoneyFlowDiagram";
import { ReactiveGlow } from "@/components/brand";

const linkClass =
  "inline-flex min-h-12 items-center gap-2 text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

/** The four moments of a project, in order. The words live in `sections.moneyMoves.timeline.<id>`. */
const timeline = [
  { id: "commit", values: { days: LIMITS.COOLING_OFF_DAYS } },
  { id: "close", values: {} },
  { id: "windows", values: { years: LIMITS.EXIT_LOCK_YEARS, months: LIMITS.EXIT_WINDOW_MONTHS } },
  { id: "sale", values: { years: LIMITS.HOLD_YEARS } },
] as const;

const links = [
  { id: "grid", href: "/pricing" },
  { id: "calculator", href: "/calculator" },
  { id: "simulator", href: "/simulator" },
] as const;

/** "How your money moves": escrow diagram, timeline and the public fee grid. */
export default function HowYourMoneyMoves() {
  const t = useTranslations("sections.moneyMoves");
  return (
    <section id="how-your-money-moves" className="group relative isolate scroll-mt-28 overflow-hidden bg-background pb-24 pt-12 lg:pb-32 lg:pt-16">
      <ReactiveGlow className="inset-0" />
      <div className="relative mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold text-primary">{t("eyebrow")}</p>
          <h2 className="font-display text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {t("title")}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{t("intro")}</p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-4 sm:p-8">
          <MoneyFlowDiagram />
        </div>

        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {timeline.map((step) => (
            <li key={step.id} className="rounded-2xl border border-border bg-card p-5">
              <p className="text-sm font-bold text-foreground">{t(`timeline.${step.id}.when`, step.values)}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t(`timeline.${step.id}.what`, step.values)}</p>
            </li>
          ))}
        </ol>

        <div className="mt-20 rounded-3xl border border-border bg-card p-6 sm:p-10">
          <h3 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{t("fees.title")}</h3>
          <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">{t("fees.body")}</p>
          <div className="mt-6 flex flex-col gap-1 sm:flex-row sm:gap-8">
            {links.map((link) => (
              <Link key={link.id} href={link.href} className={linkClass}>
                {t(`fees.${link.id}`)}
                <ArrowRight className="size-4 rtl:-scale-x-100" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
