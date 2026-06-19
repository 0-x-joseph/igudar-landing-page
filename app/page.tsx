import Navbar from '@/components/Navbar';
import LandingHero from '@/components/LandingHero';
import PainPointsSection from '@/components/PainPointsSection';
import BackedBySection from '@/components/BackedBySection';
import HowItWorksSection from '@/components/HowItWorksSection';
import FeaturesSection from '@/components/FeaturesSection';
import StatsSection from '@/components/StatsSection';
import FinalCtaSection from '@/components/FinalCtaSection';
import SiteFooter from '@/components/SiteFooter';

export default function LandingPage() {
  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 overflow-x-hidden">
      <Navbar />
      <LandingHero />
      <PainPointsSection />
      <BackedBySection />
      <HowItWorksSection />
      <FeaturesSection />
      <StatsSection />
      <FinalCtaSection />
      <SiteFooter /> 
    </div>
  );
}
