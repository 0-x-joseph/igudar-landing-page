import { useTranslations } from "next-intl";
import AnimatedSection from "@/components/AnimatedSection";
import PropertyDossier from "@/components/dossier/PropertyDossier";

export default function FeaturesSection() {
  const t = useTranslations("sections.features");
  return (
    <section id="ai-powered" className="scroll-mt-28 bg-surface-sand px-5 py-24 sm:px-6 lg:py-32">
      <div className="mx-auto max-w-6xl">
        <AnimatedSection>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold text-primary">{t("eyebrow")}</p>
            <h2 className="mt-3 font-display text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {t("title")}
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{t("intro")}</p>
          </div>
        </AnimatedSection>

        <div className="mt-16">
          <PropertyDossier />
        </div>
      </div>
    </section>
  );
}
