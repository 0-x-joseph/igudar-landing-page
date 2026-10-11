import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import { Calculator } from "@/components/calculator/Calculator";
import { IndicativeNotice } from "@/components/simulator/IndicativeNotice";

export const metadata: Metadata = {
  title: "Fees and ownership calculator | IGUDAR",
  description:
    "Work out your ownership of a property company from the amount you choose and the size of the project. Indicative, not an offer.",
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
            For people who want to see exactly how a share is built: your amount, the size of the project, and the part of
            the company you would own.
          </p>
        </header>
        <Calculator />
        <p className="mt-8 text-sm leading-relaxed text-muted-foreground">
          Looking for the fees? <Link href="/pricing" className="font-semibold text-primary underline underline-offset-2">See who pays what, when</Link>,
          or <Link href="/simulator" className="font-semibold text-primary underline underline-offset-2">simulate a return</Link> after fees and taxes.
        </p>
        <IndicativeNotice className="mt-10" />
      </main>
      <SiteFooter />
    </div>
  );
}
