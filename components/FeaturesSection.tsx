"use client";

import { motion } from 'framer-motion';
import AnimatedSection from '@/components/AnimatedSection';

export default function FeaturesSection() {
  const features = [
    {
      title: 'Market Analysis',
      desc: 'Real-time analysis of Moroccan real estate market trends and emerging opportunities.',
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>,
    },
    {
      title: 'Risk Assessment',
      desc: 'Comprehensive risk evaluation for each investment with transparent scoring.',
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>,
    },
    {
      title: 'Personalized Matching',
      desc: 'Tailored recommendations based on your profile, goals, and risk tolerance.',
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" /></svg>,
    },
  ];

  return (
    <section id="ai-powered" className="scroll-mt-28 py-24 lg:py-32 border-y border-border bg-card">
      <div className="max-w-[1120px] mx-auto px-5 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          <AnimatedSection direction="left">
            <div>
              <p className="text-primary text-sm font-semibold tracking-wide mb-4">Platform Features</p>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground tracking-tight mb-5">
                Data-Driven Investment Intelligence
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-10">
                Market analytics, AI-powered insights, and rigorous compliance screening — all in one platform.
              </p>

              <div className="space-y-1">
                {features.map((f, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-xl hover:bg-muted/50 transition-colors group/item">
                    <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-muted text-muted-foreground flex items-center justify-center group-hover/item:bg-primary/10 group-hover/item:text-primary transition-colors">
                      {f.icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-0.5">{f.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection direction="right">
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="p-6 pb-5">
                <div className="flex items-center justify-between mb-7">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">AI Recommendation Score</p>
                    <p className="text-3xl font-bold text-foreground">92<span className="text-base text-muted-foreground font-medium">/100</span></p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
                  </div>
                </div>

                <div className="space-y-4 mb-5">
                  {[
                    { label: 'Location Score', value: 95 },
                    { label: 'ROI Potential', value: 88 },
                    { label: 'Risk Level', value: 72 },
                  ].map((bar, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-muted-foreground">{bar.label}</span>
                        <span className="font-semibold text-foreground">{bar.value}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${bar.value}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.2 + i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                          className="h-full bg-primary rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-border px-6 py-4 flex items-center gap-3 bg-primary/5">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Strong Buy Recommendation</p>
                  <p className="text-xs text-muted-foreground">Based on 47 data points</p>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
