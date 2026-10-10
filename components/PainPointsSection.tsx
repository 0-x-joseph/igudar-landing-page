import AnimatedSection from "@/components/AnimatedSection";

const transparencyCards = [
  {
    eyebrow: "Transparent access",
    title: "Every opportunity starts with the facts.",
    body: "Property details, pricing logic, expected returns, documents, and key risks are organized in one place before anyone invests.",
    stat: "Deal context",
  },
  {
    eyebrow: "Clear ownership",
    title: "Investors can understand what they own.",
    body: "IGUDAR is built around visible fees, documented structures, investor rights, and simple terms for fractional real estate.",
    stat: "No hidden layers",
  },
  {
    eyebrow: "Ongoing visibility",
    title: "The platform keeps reporting after investment.",
    body: "Occupancy, expenses, distributions, and property updates are designed to stay visible across the full asset lifecycle.",
    stat: "Live updates",
  },
];

export default function PainPointsSection() {
  return (
    <section className="px-5 py-24 sm:px-6 lg:py-32">
      <div className="mx-auto max-w-6xl">
        <AnimatedSection>
          <h2 className="mx-auto max-w-3xl text-center font-display text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            We built something <span className="italic text-primary">different.</span>
          </h2>
        </AnimatedSection>

        <ul className="mt-16 grid gap-4 md:grid-cols-3">
          {transparencyCards.map((card, index) => (
            <li key={card.title}>
              <AnimatedSection delay={index * 80} className="h-full">
                <article className="flex h-full flex-col rounded-3xl border border-border bg-card p-6 sm:p-8">
                  <p className="text-sm font-semibold text-primary">{card.eyebrow}</p>
                  <h3 className="mt-4 font-display text-2xl font-semibold leading-snug tracking-tight text-foreground">
                    {card.title}
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{card.body}</p>
                  <p className="mt-auto border-t border-border pt-5 text-sm font-semibold text-foreground">
                    {card.stat}
                  </p>
                </article>
              </AnimatedSection>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
