import { setRequestLocale } from "next-intl/server";
import Navbar from "@/components/Navbar";
import LandingHero from "@/components/LandingHero";
import { HeroSimulator } from "@/components/simulator/HeroSimulator";
import PainPointsSection from "@/components/PainPointsSection";
import BackedBySection from "@/components/BackedBySection";
import HowItWorksSection from "@/components/HowItWorksSection";
import HowYourMoneyMoves from "@/components/HowYourMoneyMoves";
import FeaturesSection from "@/components/FeaturesSection";
import FactsSection from "@/components/FactsSection";
import FinalCtaSection from "@/components/FinalCtaSection";
import SiteFooter from "@/components/SiteFooter";
import { ZelligeBand } from "@/components/brand";

type Params = { params: Promise<{ locale: string }> };

/** One-row zellige divider between the major sections: static, faded at both ends. */
function Divider() {
  return <ZelligeBand className="mx-auto max-w-4xl" />;
}

export default async function LandingPage({ params }: Params) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-screen w-full overflow-x-clip bg-background text-foreground">
      <Navbar />
      <main>
        <LandingHero />
        <HeroSimulator />
        <Divider />
        <PainPointsSection />
        <BackedBySection />
        <Divider />
        {/* The igudar story, then the escrow money flow: one continuous section flow. */}
        <HowItWorksSection />
        <HowYourMoneyMoves />
        <Divider />
        <FeaturesSection />
        <FactsSection />
        <Divider />
        <FinalCtaSection />
      </main>
      <SiteFooter />
    </div>
  );
}
