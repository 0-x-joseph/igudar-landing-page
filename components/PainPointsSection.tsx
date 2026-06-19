import AnimatedSection from '@/components/AnimatedSection';
import TransparencyScrollStack from '@/components/TransparencyScrollStack';

export default function PainPointsSection() {
  return (
    <section className="bg-[#F6F2FF] px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 sm:gap-14">
        <div className="hidden">
          {/* <AnimatedSection>
            <p className="text-[clamp(1.25rem,3vw,2.25rem)] font-semibold leading-snug tracking-[-0.02em] text-slate-900">
              Real estate is broken in Morocco.
            </p>
          </AnimatedSection>
          <AnimatedSection delay={150}>
            <p className="text-[clamp(1.25rem,3vw,2.25rem)] font-semibold leading-snug tracking-[-0.02em] text-slate-900">
              You need millions to get started. Markets are opaque. Returns are uncertain.
            </p>
          </AnimatedSection> */}

          {/* <AnimatedSection delay={200}>
            <div className="flex flex-col items-center gap-4 py-8">
              <p className="text-red-500 text-sm font-semibold tracking-wide uppercase">Traditional Real Estate Investment</p>

              <div className="w-full max-w-5xl mx-auto px-1 sm:px-4 overflow-hidden transform scale-[0.82] sm:scale-100 origin-top">
                <div className="rounded-xl overflow-hidden shadow-2xl shadow-slate-200/70 border border-slate-200 bg-white">
                  <div className="flex items-center gap-2 px-4 py-3 bg-slate-100 border-b border-slate-200">
                    <div className="flex items-center gap-[7px]">
                      <div className="w-3 h-3 rounded-full bg-[hsl(0,70%,55%)]" />
                      <div className="w-3 h-3 rounded-full bg-[hsl(44,80%,55%)]" />
                      <div className="w-3 h-3 rounded-full bg-[hsl(120,45%,48%)]" />
                    </div>
                    <span className="text-[11px] text-slate-400 ml-2 font-medium tracking-wide hidden sm:inline">
                      BanqlMaghrib — Real Estate Investment Portal
                    </span>
                    <span className="text-[9px] text-slate-400 ml-2 font-medium tracking-wide sm:hidden">
                      Investment Portal
                    </span>
                    <div className="ml-auto flex items-center gap-2 sm:gap-3">
                      <span className="text-[7px] sm:text-[9px] text-[hsl(0,70%,55%)] font-mono font-bold">● APPLICATION DENIED</span>
                    </div>
                  </div>

                  <div className="relative bg-slate-50 min-h-[280px] sm:min-h-[400px] overflow-hidden p-6 sm:p-10" style={{ boxShadow: 'inset 0 0 80px 20px rgba(148, 163, 184, 0.12)' }}>
                    <div className="absolute inset-0 bg-[hsla(210,50%,95%,0.45)] pointer-events-none z-[1]" />

                    <div className="relative z-[2] flex flex-col gap-6 sm:gap-8 max-w-md mx-auto">
                      <div className="text-center border-b border-slate-200 pb-6">
                        <h3 className="text-slate-800 text-lg sm:text-xl font-semibold mb-1">Property Investment Application</h3>
                        <p className="text-slate-400 text-xs font-mono">REF: IMM-2025-00847</p>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-slate-200">
                          <span className="text-slate-400 text-xs sm:text-sm font-mono">Property Type</span>
                          <span className="text-slate-600 text-xs sm:text-sm font-mono">Residential Apartment</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-slate-200">
                          <span className="text-slate-400 text-xs sm:text-sm font-mono">Location</span>
                          <span className="text-slate-600 text-xs sm:text-sm font-mono">Casablanca, Anfa</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-slate-200">
                          <span className="text-slate-400 text-xs sm:text-sm font-mono">Min. Investment</span>
                          <span className="text-slate-900 text-xs sm:text-sm font-mono font-bold text-red-500">2,500,000 MAD</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-slate-200">
                          <span className="text-slate-400 text-xs sm:text-sm font-mono">Down Payment</span>
                          <span className="text-slate-900 text-xs sm:text-sm font-mono font-bold text-red-500">750,000 MAD</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-slate-200">
                          <span className="text-slate-400 text-xs sm:text-sm font-mono">Credit Score</span>
                          <span className="text-slate-600 text-xs sm:text-sm font-mono">Required: Excellent</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-slate-200">
                          <span className="text-slate-400 text-xs sm:text-sm font-mono">Processing Time</span>
                          <span className="text-slate-600 text-xs sm:text-sm font-mono">6-12 months</span>
                        </div>
                      </div>

                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-15deg] pointer-events-none">
                        <div className="border-4 border-red-500/40 rounded-lg px-8 py-3">
                          <span className="text-red-500/50 text-3xl sm:text-5xl font-black tracking-widest uppercase">INACCESSIBLE</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection> */}
        </div>

        <AnimatedSection>
          <div className="text-center">
            <p className="text-[clamp(1.25rem,3vw,2.25rem)] font-semibold leading-snug tracking-[-0.02em] text-slate-900">
              We built something <span className="font-serif-italic text-[#7B3FFF]">different.</span>
            </p>
          </div>
        </AnimatedSection>

        <TransparencyScrollStack />
      </div>
    </section>
  );
}
