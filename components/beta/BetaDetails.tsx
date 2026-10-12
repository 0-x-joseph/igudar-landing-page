import { useLocale, useTranslations } from "next-intl";
import { Clock, Database, FlaskConical, Wallet } from "lucide-react";
import { LIMITS } from "@/lib/finance";
import { formatMadIn } from "@/lib/i18n/format";
import { DEFAULT_LOCALE, isLocale } from "@/i18n/routing";
import AnimatedSection from "@/components/AnimatedSection";

/** Order and icons of the facts; the words live in `beta.details.what.facts.<id>`. */
const FACTS = [
  { id: "closed", icon: FlaskConical },
  { id: "demo", icon: Wallet },
  { id: "clock", icon: Clock },
] as const;

/** Order of the steps; the words live in `beta.details.do.steps.<id>`. */
const STEP_IDS = ["explore", "simulate", "receive", "feedback"] as const;

export default function BetaDetails() {
  const t = useTranslations("beta.details");
  const raw = useLocale();
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const minTicket = formatMadIn(locale, LIMITS.MIN_TICKET_MAD, { decimals: 0 });
  const em = (chunks: React.ReactNode) => <span className="italic text-primary">{chunks}</span>;

  return (
    <>
      <section id="what" className="scroll-mt-28 px-5 py-20 sm:px-6 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <AnimatedSection>
            <h2 className="max-w-3xl font-display text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
              {t.rich("what.title", { em })}
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">{t("what.lede")}</p>
          </AnimatedSection>
          <ul className="mt-12 grid gap-4 md:grid-cols-3">
            {FACTS.map(({ id, icon: Icon }, i) => (
              <li key={id}>
                <AnimatedSection delay={i * 80} className="h-full">
                  <div className="h-full rounded-3xl border border-border bg-card p-6 sm:p-8">
                    <span className="flex size-11 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                      <Icon className="size-5" strokeWidth={1.7} aria-hidden="true" />
                    </span>
                    <h3 className="mt-6 text-lg font-semibold text-foreground">{t(`what.facts.${id}.title`)}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t(`what.facts.${id}.body`)}</p>
                  </div>
                </AnimatedSection>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="who" className="scroll-mt-28 px-5 pb-20 sm:px-6 lg:pb-28">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:gap-16">
          <AnimatedSection>
            <h2 className="font-display text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
              {t.rich("who.title", { em })}
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{t("who.lede")}</p>

            <h3 className="mt-10 flex items-center gap-3 text-lg font-semibold text-foreground">
              <Database className="size-5 text-primary" strokeWidth={1.7} aria-hidden="true" />
              {t("who.dataTitle")}
            </h3>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">{t("who.dataBody")}</p>
          </AnimatedSection>

          <AnimatedSection delay={100}>
            <h2 className="font-display text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
              {t.rich("do.title", { em })}
            </h2>
            <ol className="mt-8 space-y-6">
              {STEP_IDS.map((id, i) => (
                <li key={id} className="flex gap-4">
                  <span
                    aria-hidden="true"
                    className="financial-number flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-card text-sm font-semibold text-primary"
                  >
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">{t(`do.steps.${id}.title`)}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {id === "simulate" ? t("do.steps.simulate.body", { amount: minTicket }) : t(`do.steps.${id}.body`)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
