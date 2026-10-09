import Navbar from '@/components/Navbar';
import LandingHero from '@/components/LandingHero';
import { HeroSimulator } from '@/components/simulator/HeroSimulator';
import PainPointsSection from '@/components/PainPointsSection';
import BackedBySection from '@/components/BackedBySection';
import HowItWorksSection from '@/components/HowItWorksSection';
import HowYourMoneyMoves from '@/components/HowYourMoneyMoves';
import FeaturesSection from '@/components/FeaturesSection';
import StatsSection from '@/components/StatsSection';
import FinalCtaSection from '@/components/FinalCtaSection';
import SiteFooter from '@/components/SiteFooter';

export default function LandingPage() {
  return (
    <div className="min-h-screen w-full bg-muted/50 text-foreground overflow-x-hidden">
      <Navbar />
      <LandingHero />
      <HeroSimulator />
      <PainPointsSection />
      <BackedBySection />
      <HowItWorksSection />
      <HowYourMoneyMoves />
      <FeaturesSection />
      <StatsSection />
      <FinalCtaSection />
      <SiteFooter />
    </div>
  );
}
