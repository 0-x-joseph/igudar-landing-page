import { useLocale, useTranslations } from "next-intl";
import { LIMITS } from "@/lib/finance";
import { formatMadIn } from "@/lib/i18n/format";
import { DEFAULT_LOCALE, isLocale } from "@/i18n/routing";
import { ReactiveGlow, RosetteProgress } from "@/components/brand";
import { Reveal } from "./Reveal";

const ctaPrimary =
  "inline-flex min-h-12 items-center justify-center rounded-2xl bg-primary px-8 text-base font-semibold text-primary-foreground transition-colors duration-200 ease-out hover:bg-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
const ctaTertiary =
  "inline-flex min-h-12 items-center justify-center px-2 text-base font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

/** Order of the three steps; the words live in `beta.hero.steps.<id>`. */
const STEP_IDS = ["apply", "approve", "access"] as const;

export default function BetaHero() {
  const t = useTranslations("beta.hero");
  const raw = useLocale();
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const minTicket = formatMadIn(locale, LIMITS.MIN_TICKET_MAD, { decimals: 0 });
  const em = (chunks: React.ReactNode) => <span className="italic text-primary">{chunks}</span>;

  return (
    <section className="group relative isolate overflow-hidden px-5 pb-16 pt-36 sm:px-6 sm:pt-44 lg:pb-24">
      <ReactiveGlow className="inset-x-0 top-0 -z-10 h-full" />
      <div className="mx-auto max-w-6xl">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)] lg:gap-16">
          <Reveal on="mount">
            <p className="text-sm font-semibold text-primary">{t("eyebrow")}</p>
            <h1 className="mt-3 font-display text-[clamp(2.75rem,7vw,5rem)] font-semibold leading-[1.02] tracking-tight text-foreground">
              {t.rich("title", { em })}
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              {t("lede", { amount: minTicket })}
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <a href="#apply" className={ctaPrimary}>
                {t("ctaPrimary")}
              </a>
              <a href="#what" className={ctaTertiary}>
                {t("ctaSecondary")}
              </a>
            </div>
          </Reveal>

          <Reveal on="mount" delay={0.15}>
            <div className="mx-auto flex w-full max-w-xs justify-center rounded-3xl border border-border bg-card p-8 lg:max-w-none">
              <RosetteProgress
                steps={8}
                completed={8}
                size={176}
                label={t("rosetteLabel")}
                className="text-center text-sm font-medium text-foreground"
              />
            </div>
          </Reveal>
        </div>

        <Reveal on="mount" delay={0.3}>
          <ol aria-label={t("stepsLabel")} className="mt-14 grid gap-3 md:grid-cols-3 md:gap-4">
            {STEP_IDS.map((id, i) => (
              <li key={id} className="flex items-start gap-4 rounded-2xl border border-border bg-card/80 p-4 sm:p-5">
                <span
                  aria-hidden="true"
                  className="financial-number flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-base font-semibold text-accent-foreground"
                >
                  {i + 1}
                </span>
                <div>
                  <p className="text-base font-semibold leading-snug text-foreground">{t(`steps.${id}.title`)}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t(`steps.${id}.body`)}</p>
                </div>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
