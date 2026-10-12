import { useTranslations } from "next-intl";
import AnimatedSection from "@/components/AnimatedSection";
import { Hover } from "@/components/motion";
import { ReactiveGlow } from "@/components/brand";

// Copy lives in home.painPoints.cards.<id>; the order stays here.
const transparencyCards = ["access", "ownership", "visibility"] as const;

export default function PainPointsSection() {
  const t = useTranslations("home.painPoints");

  return (
    <section className="group relative isolate overflow-hidden bg-background px-5 py-24 sm:px-6 lg:py-32">
      <ReactiveGlow className="inset-0" />
      <div className="relative mx-auto max-w-6xl">
        <AnimatedSection>
          <h2 className="mx-auto max-w-3xl text-center font-display text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {t.rich("title", { em: (chunks) => <span className="italic text-primary">{chunks}</span> })}
          </h2>
        </AnimatedSection>

        <ul className="mt-16 grid gap-4 md:grid-cols-3">
          {transparencyCards.map((id, index) => (
            <li key={id}>
              <AnimatedSection delay={index * 80} className="h-full">
                <Hover className="h-full">
                <article className="flex h-full flex-col rounded-3xl border border-border bg-card p-6 sm:p-8">
                  <p className="text-sm font-semibold text-primary">{t(`cards.${id}.eyebrow`)}</p>
                  <h3 className="mt-4 font-display text-2xl font-semibold leading-snug tracking-tight text-foreground">
                    {t(`cards.${id}.title`)}
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{t(`cards.${id}.body`)}</p>
                  <p className="mt-auto border-t border-border pt-5 text-sm font-semibold text-foreground">
                    {t(`cards.${id}.stat`)}
                  </p>
                </article>
                </Hover>
              </AnimatedSection>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
