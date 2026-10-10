import { ChartNoAxesColumn, ShieldCheck, Sparkles } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";

const features = [
  {
    title: "Market Analysis",
    desc: "Real-time analysis of Moroccan real estate market trends and emerging opportunities.",
    icon: ChartNoAxesColumn,
  },
  {
    title: "Risk Assessment",
    desc: "Comprehensive risk evaluation for each investment with transparent scoring.",
    icon: ShieldCheck,
  },
  {
    title: "Personalized Matching",
    desc: "Tailored recommendations based on your profile, goals, and risk tolerance.",
    icon: Sparkles,
  },
];

export default function FeaturesSection() {
  return (
    <section id="ai-powered" className="scroll-mt-28 px-5 py-24 sm:px-6 lg:py-32">
      <div className="mx-auto max-w-6xl">
        <AnimatedSection>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold text-primary">Platform Features</p>
            <h2 className="mt-3 font-display text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Data-Driven Investment Intelligence
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              Market analytics, AI-powered insights, and rigorous compliance screening, all in one platform.
            </p>
          </div>
        </AnimatedSection>

        <ul className="mt-16 grid gap-4 md:grid-cols-3">
          {features.map(({ title, desc, icon: Icon }, i) => (
            <li key={title}>
              <AnimatedSection delay={i * 80} className="h-full">
                <div className="h-full rounded-3xl border border-border bg-card p-6 sm:p-8">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                    <Icon className="size-5" strokeWidth={1.7} aria-hidden="true" />
                  </span>
                  <h3 className="mt-6 text-lg font-semibold text-foreground">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
                </div>
              </AnimatedSection>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
