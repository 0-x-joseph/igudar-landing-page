import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import PricingPageContent from "@/components/pricing/PricingPageContent";

export const metadata: Metadata = {
  title: "Pricing: who pays what, when | IGUDAR",
  description: "The IGUDAR fee grid, published in full: who pays what, and when.",
};

export default function Pricing() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-background text-foreground">
      <Navbar />
      <main>
        <PricingPageContent />
      </main>
      <SiteFooter />
    </div>
  );
}
