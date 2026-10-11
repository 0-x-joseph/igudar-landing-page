import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import AnimatedSection from "@/components/AnimatedSection";
import BetaHero from "@/components/beta/BetaHero";
import BetaDetails from "@/components/beta/BetaDetails";
import BetaAccess from "@/components/beta/BetaAccess";
import { BetaApplicationForm } from "@/components/beta/BetaApplicationForm";
import { IndicativeNotice } from "@/components/simulator/IndicativeNotice";
import { ZelligeBand } from "@/components/brand";

export const metadata: Metadata = {
  title: "Closed beta | IGUDAR",
  description:
    "A closed test of the IGUDAR platform with about 50 people, using demo money only. Apply for the beta and tell us what works.",
};

export default function BetaPage() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-background text-foreground">
      <Navbar />
      <main>
        <BetaHero />
        <ZelligeBand className="mx-auto max-w-4xl" />
        <BetaDetails />
        <ZelligeBand className="mx-auto max-w-4xl" />

        <section id="apply" className="scroll-mt-28 px-5 py-20 sm:px-6 lg:py-28">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
            <AnimatedSection>
              <h2 className="font-display text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
                Apply for the <span className="italic text-primary">beta</span>
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
                We ask a few questions so we can choose a mix of people and learn from each of them. It takes about a
                minute. A founder reads every answer.
              </p>
            </AnimatedSection>
            <AnimatedSection delay={100}>
              <BetaApplicationForm />
            </AnimatedSection>
          </div>
        </section>

        <ZelligeBand className="mx-auto max-w-4xl" />
        <BetaAccess />

        <section className="px-5 pb-16 sm:px-6">
          <div className="mx-auto max-w-3xl">
            <IndicativeNotice />
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
