import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import { Simulator } from "@/components/simulator/Simulator";
import { IndicativeNotice } from "@/components/simulator/IndicativeNotice";
import { LIMITS, formatMad } from "@/lib/finance";

export const metadata: Metadata = {
  title: "Investment simulator | IGUDAR",
  description: `See what a share of rented Moroccan property could return after fees and taxes, from ${formatMad(LIMITS.MIN_TICKET_MAD, { decimals: 0 })}. Pessimistic, Base and Optimistic scenarios, shown honestly. Indicative, not guaranteed.`,
};

export default function SimulatorPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 pb-28 pt-36 sm:px-6 lg:px-8 lg:pb-20 lg:pt-40">
        <header className="mb-10 max-w-3xl">
          <p className="mb-3 text-sm font-semibold text-primary">Simulator</p>
          <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
            What could a share of rented property return?
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Pick an amount and a scenario. Every figure is after fees and taxes, and the bad case is always next to the
            good one.
          </p>
        </header>
        <Simulator />
        <IndicativeNotice className="mt-10" />
      </main>
      <SiteFooter />
    </div>
  );
}
