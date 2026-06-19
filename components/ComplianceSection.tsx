import AnimatedSection from '@/components/AnimatedSection';

export default function ComplianceSection() {
  return (
    <section id="sharia-compliant" className="py-24 lg:py-32 border-y border-slate-200 bg-white">
      <div className="max-w-[1120px] mx-auto px-5 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <AnimatedSection direction="left">
            <div className="grid grid-cols-2 gap-4">
              {[
                { title: 'Halal', desc: '100% Sharia Compliant', accent: true },
                { title: 'ESG', desc: 'Sustainable & Ethical', accent: false },
                { title: 'Verified', desc: 'Expert Reviewed', accent: false },
                { title: 'Growth', desc: 'Focused on Returns', accent: true },
              ].map((item, i) => (
                <div
                  key={i}
                  className={`rounded-2xl p-6 border transition-all hover:scale-[1.02] ${
                    item.accent
                      ? 'bg-[#5D18E9]/5 border-[#5D18E9]/15 hover:border-[#5D18E9]/30'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <h4 className={`text-base font-semibold mb-1 ${item.accent ? 'text-[#7B3FFF]' : 'text-slate-900'}`}>{item.title}</h4>
                  <p className="text-sm text-slate-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </AnimatedSection>

          <AnimatedSection direction="right">
            <div>
              <p className="text-[#7B3FFF] text-sm font-semibold tracking-wide mb-4">Built on Trust</p>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight mb-5">
                Sharia Compliant &{' '}
                <span className="text-[#7B3FFF]">ESG Focused</span>
              </h2>
              <p className="text-slate-600 leading-relaxed mb-8">
                Every investment is carefully vetted to ensure compliance with Islamic financial
                principles and environmental, social, and governance standards.
              </p>

              <div className="space-y-1">
                {[
                  { title: 'Halal Certified', desc: 'All properties undergo rigorous Sharia compliance screening by certified advisors.' },
                  { title: 'ESG Standards', desc: 'Environmental and social responsibility at the core of our investment selection.' },
                  { title: 'Transparent Process', desc: 'Clear documentation and regular audits ensure ongoing compliance and trust.' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-3 py-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#5D18E9]/20 text-[#7B3FFF] flex items-center justify-center mt-0.5">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 mb-0.5">{item.title}</h4>
                      <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>

        <AnimatedSection>
          <div className="mt-20 max-w-3xl mx-auto">
            <h3 className="text-xl font-bold text-slate-900 text-center mb-8">
              Traditional Investment vs <span className="text-[#7B3FFF]">Igudar</span>
            </h3>
            <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm">
              <div className="grid grid-cols-3 bg-slate-50">
                <div className="p-4 text-xs text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">Feature</div>
                <div className="p-4 text-xs text-slate-500 font-semibold uppercase tracking-wider border-b border-l border-slate-200 text-center">Traditional</div>
                <div className="p-4 text-xs text-[#7B3FFF] font-semibold uppercase tracking-wider border-b border-l border-slate-200 text-center">Igudar</div>
              </div>
              {[
                { feature: 'Minimum Investment', traditional: '2,000,000+ MAD', igudar: '1,000 MAD' },
                { feature: 'Time to Invest', traditional: '6-12 months', igudar: '3 minutes' },
                { feature: 'Sharia Compliance', traditional: 'Rare', igudar: '100% Certified' },
                { feature: 'Transparency', traditional: 'Opaque', igudar: 'Full Data Access' },
                { feature: 'Liquidity', traditional: 'Locked for years', igudar: 'Flexible exit' },
                { feature: 'AI Analysis', traditional: 'None', igudar: 'Built-in' },
              ].map((row, i) => (
                <div key={i} className="grid grid-cols-3 border-b border-slate-200 last:border-b-0 hover:bg-slate-50 transition-colors">
                  <div className="p-4 text-sm text-slate-700 font-medium">{row.feature}</div>
                  <div className="p-4 text-sm text-red-500/80 text-center border-l border-slate-200">{row.traditional}</div>
                  <div className="p-4 text-sm text-[#7B3FFF] font-medium text-center border-l border-slate-200">{row.igudar}</div>
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}