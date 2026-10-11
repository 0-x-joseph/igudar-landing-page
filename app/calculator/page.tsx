import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import { Calculator } from "@/components/calculator/Calculator";
import { IndicativeNotice } from "@/components/simulator/IndicativeNotice";

export const metadata: Metadata = {
  title: "Fees and ownership calculator | IGUDAR",
  description:
    "Work out your ownership of a property company, who pays which fee, what an early exit costs and whether you are within the investment caps. Indicative, not an offer.",
};

export default function CalculatorPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 pb-20 pt-36 sm:px-6 lg:px-8 lg:pt-40">
        <header className="mb-10 max-w-3xl">
          <p className="mb-3 text-sm font-semibold text-primary">Calculator</p>
          <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
            The mechanics: ownership, fees and exits
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            For people who want to see exactly how a share is built, who pays each fee, and what selling early would
            cost.
          </p>
        </header>
        <Calculator />
        <IndicativeNotice className="mt-10" />
      </main>
      <SiteFooter />
    </div>
  );
}
