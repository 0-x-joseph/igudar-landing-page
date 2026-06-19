import AnimatedSection from '@/components/AnimatedSection';
import WaitlistForm from '@/components/WaitlistForm';

export default function FinalCtaSection() {
  return (
    <section className="py-24 lg:py-32 bg-white">
      <div className="max-w-2xl mx-auto text-center px-5 sm:px-6 lg:px-8">
        <AnimatedSection>
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight mb-5">
            Stop watching from the sidelines.{' '}
            <br className="hidden sm:block" />
            Start building <span className="font-serif-italic text-[#7B3FFF]">wealth.</span>
          </h2>
          <p className="text-slate-600 mb-10 max-w-md mx-auto leading-relaxed">
            Join thousands of Moroccans building wealth through
            Sharia-compliant fractional real estate.
          </p>

          <WaitlistForm className="w-full max-w-md mx-auto mb-8" />

          <div className="flex items-center justify-center gap-6 text-[13px] text-slate-600">
            {['Sharia Compliant', 'AI Verified', 'From 1,000 MAD'].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-[#5D18E9]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                {t}
              </span>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}