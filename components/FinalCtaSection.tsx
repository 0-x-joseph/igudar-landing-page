import Link from "next/link";
import { LIMITS, formatMad } from "@/lib/finance";
import AnimatedSection from "@/components/AnimatedSection";
import WaitlistForm from "@/components/WaitlistForm";
import { ReactivePattern, TifinaghMark } from "@/components/brand";

export default function FinalCtaSection() {
  return (
    <section id="waitlist-cta" className="scroll-mt-24 px-5 py-24 sm:px-6 lg:py-32">
      <ReactivePattern className="mx-auto max-w-5xl rounded-[2.5rem] border border-border bg-card px-6 py-14 sm:px-12 lg:py-20">
      <div className="mx-auto max-w-3xl text-center">
        <AnimatedSection>
          <TifinaghMark height={20} className="mx-auto mb-8 text-primary" />
          <h2 className="font-display text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Stop watching from the sidelines.{" "}
            <span className="italic text-primary">Start with a simulation.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
            See what {formatMad(LIMITS.MIN_TICKET_MAD, { decimals: 0 })} could look like, try the closed beta with
            demo money, or join the waitlist to hear when IGUDAR opens.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4">
            <Link
              href="/simulator"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-primary px-8 text-base font-semibold text-primary-foreground transition-colors duration-200 ease-out hover:bg-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Simulate
            </Link>
            <Link
              href="/beta"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-border bg-background px-8 text-base font-semibold text-foreground transition-colors duration-200 ease-out hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Apply for the beta
            </Link>
            <p className="text-sm text-muted-foreground">or join the waitlist</p>
          </div>

          <WaitlistForm className="mx-auto mt-4 w-full max-w-md" />
        </AnimatedSection>
      </div>
      </ReactivePattern>
    </section>
  );
}
