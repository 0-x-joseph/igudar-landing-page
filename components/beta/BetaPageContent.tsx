import { useTranslations } from "next-intl";
import { Reveal } from "@/components/beta/Reveal";
import BetaHero from "@/components/beta/BetaHero";
import BetaDetails from "@/components/beta/BetaDetails";
import BetaAccess from "@/components/beta/BetaAccess";
import { BetaApplicationForm } from "@/components/beta/BetaApplicationForm";
import { IndicativeNotice } from "@/components/simulator/IndicativeNotice";
import { ZelligeBand } from "@/components/brand";

/** Everything inside `<main>` on /beta, so tests can render it without a request context. */
export default function BetaPageContent() {
  const t = useTranslations("beta.apply");
  return (
    <>
      <BetaHero />
      <ZelligeBand className="mx-auto max-w-4xl" />
      <BetaDetails />
      <ZelligeBand className="mx-auto max-w-4xl" />

      <section id="apply" className="scroll-mt-28 px-5 py-20 sm:px-6 lg:py-28">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
          <Reveal>
            <h2 className="font-display text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
              {t.rich("title", { em: (chunks) => <span className="italic text-primary">{chunks}</span> })}
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{t("lede")}</p>
          </Reveal>
          <Reveal delay={0.1}>
            <BetaApplicationForm />
          </Reveal>
        </div>
      </section>

      <ZelligeBand className="mx-auto max-w-4xl" />
      <BetaAccess />

      <section className="px-5 pb-16 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <IndicativeNotice />
        </div>
      </section>
    </>
  );
}
