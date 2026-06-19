import Image from "next/image";
import {
  CircleDollarSign,
  Search,
  TrendingUp,
  UserPlus,
} from "lucide-react";

import AnimatedSection from "@/components/AnimatedSection";
import { WobbleCard } from "@/components/ui/wobble-card";

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="scroll-mt-28 bg-[#F8F7FC] py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <p className="mb-3 text-sm font-semibold text-[#5D18E9]">
              Your investment journey
            </p>
            <h2 className="mb-4 text-3xl font-bold tracking-normal text-slate-900 lg:text-4xl">
              How It Works
            </h2>
            <p className="leading-relaxed text-slate-600">
              Four simple steps to start building your real estate portfolio.
            </p>
          </div>
        </AnimatedSection>

        <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-3">
          <WobbleCard
            containerClassName="min-h-[520px] bg-[#5D18E9] lg:col-span-2 lg:min-h-[460px]"
            className="flex h-full flex-col justify-between"
          >
            <div className="relative z-20 max-w-sm">
              <StepLabel icon={UserPlus} step="01" />
              <h3 className="text-3xl font-semibold leading-tight tracking-normal text-white sm:text-5xl">
                Create Account
              </h3>
              <p className="mt-5 text-base leading-7 text-white/75">
                Sign up in under 3 minutes with your investment goals.
              </p>
            </div>

            <p className="relative z-20 mt-10 text-sm font-semibold text-white">
              Under 3 minutes
            </p>

            <Image
              src="/images/igudar-investor-dashboard.png"
              alt="IGUDAR investor dashboard showing portfolio performance"
              width={1536}
              height={1024}
              className="absolute -bottom-10 -right-[48%] z-10 w-[118%] max-w-none rounded-xl border border-white/15 shadow-2xl sm:-right-[28%] sm:w-[92%] lg:-right-[36%] lg:w-[85%]"
            />
          </WobbleCard>

          <WobbleCard
            containerClassName="min-h-[520px] bg-[#2D256B] lg:col-span-1 lg:min-h-[460px]"
            className="flex h-full flex-col justify-between"
          >
            <div>
              <div className="border-b border-white/15 pb-8">
                <StepLabel icon={Search} step="02" />
                <h3 className="text-3xl font-semibold leading-tight tracking-normal text-white">
                  Browse Properties
                </h3>
                <p className="mt-4 text-base leading-7 text-white/70">
                  AI analyzes market data to find the best opportunities.
                </p>
              </div>

              <div className="pt-8">
                <StepLabel icon={CircleDollarSign} step="03" />
                <h3 className="text-3xl font-semibold leading-tight tracking-normal text-white">
                  Invest
                </h3>
                <p className="mt-4 text-base leading-7 text-white/70">
                  Choose a property, invest from 1,000 MAD. All
                  Sharia-compliant.
                </p>
              </div>
            </div>

            <p className="mt-10 text-sm font-semibold text-[#C8BFFF]">
              AI-powered. From 1,000 MAD.
            </p>
          </WobbleCard>

          <WobbleCard
            containerClassName="min-h-[560px] bg-[#4A3AB5] lg:col-span-3 lg:min-h-[470px]"
            className="flex h-full flex-col justify-between"
          >
            <div className="relative z-20 max-w-md">
              <StepLabel icon={TrendingUp} step="04" />
              <h3 className="text-3xl font-semibold leading-tight tracking-normal text-white sm:text-5xl">
                Earn Returns
              </h3>
              <p className="mt-5 max-w-sm text-base leading-7 text-white/75">
                Track real-time performance. Collect rental income.
              </p>
            </div>

            <p className="relative z-20 mt-10 text-sm font-semibold text-white">
              Real-time performance and rental income
            </p>

            <Image
              src="/images/igudar-investor-dashboard.png"
              alt="IGUDAR dashboard with returns and rental income reporting"
              width={1536}
              height={1024}
              className="absolute -bottom-20 -right-[60%] z-10 w-[138%] max-w-none rounded-xl border border-white/15 shadow-2xl sm:-right-[35%] sm:w-[105%] lg:-bottom-24 lg:-right-[12%] lg:w-[62%]"
            />
          </WobbleCard>
        </div>
      </div>
    </section>
  );
}

type StepLabelProps = {
  icon: typeof UserPlus;
  step: string;
};

function StepLabel({ icon: Icon, step }: StepLabelProps) {
  return (
    <div className="mb-7 flex items-center gap-3">
      <span className="flex size-10 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-white">
        <Icon className="size-5" strokeWidth={1.7} />
      </span>
      <span className="text-sm font-semibold text-white/65">Step {step}</span>
    </div>
  );
}
