import AnimatedSection from '@/components/AnimatedSection';

export default function ComplianceSection() {
  return (
    <section id="sharia-compliant" className="py-24 lg:py-32 border-y border-border bg-card">
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
                      ? 'bg-primary/5 border-primary/15 hover:border-primary/30'
                      : 'bg-muted/50 border-border hover:border-foreground/20'
                  }`}
                >
                  <h4 className={`text-base font-semibold mb-1 ${item.accent ? 'text-primary' : 'text-foreground'}`}>{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </AnimatedSection>

          <AnimatedSection direction="right">
            <div>
              <p className="text-primary text-sm font-semibold tracking-wide mb-4">Built on Trust</p>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground tracking-tight mb-5">
                Sharia Compliant &{' '}
                <span className="text-primary">ESG Focused</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-8">
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
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center mt-0.5">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-0.5">{item.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>

        <AnimatedSection>
          <div className="mt-20 max-w-3xl mx-auto">
            <h3 className="text-xl font-bold text-foreground text-center mb-8">
              Traditional Investment vs <span className="text-primary">Igudar</span>
            </h3>
            <div className="rounded-2xl border border-border overflow-hidden bg-card shadow-sm">
              <div className="grid grid-cols-3 bg-muted/50">
                <div className="p-4 text-xs text-muted-foreground font-semibold uppercase tracking-wider border-b border-border">Feature</div>
                <div className="p-4 text-xs text-muted-foreground font-semibold uppercase tracking-wider border-b border-l border-border text-center">Traditional</div>
                <div className="p-4 text-xs text-primary font-semibold uppercase tracking-wider border-b border-l border-border text-center">Igudar</div>
              </div>
              {[
                { feature: 'Minimum Investment', traditional: '2,000,000+ MAD', igudar: '1,000 MAD' },
                { feature: 'Time to Invest', traditional: '6-12 months', igudar: '3 minutes' },
                { feature: 'Sharia Compliance', traditional: 'Rare', igudar: '100% Certified' },
                { feature: 'Transparency', traditional: 'Opaque', igudar: 'Full Data Access' },
                { feature: 'Liquidity', traditional: 'Locked for years', igudar: 'Flexible exit' },
                { feature: 'AI Analysis', traditional: 'None', igudar: 'Built-in' },
              ].map((row, i) => (
                <div key={i} className="grid grid-cols-3 border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors">
                  <div className="p-4 text-sm text-foreground font-medium">{row.feature}</div>
                  <div className="p-4 text-sm text-red-500/80 text-center border-l border-border">{row.traditional}</div>
                  <div className="p-4 text-sm text-primary font-medium text-center border-l border-border">{row.igudar}</div>
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}