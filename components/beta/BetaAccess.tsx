import { TifinaghMark } from "@/components/brand";

/** Direct entry for people who already want to create an account. Approval is still by hand. */
export default function BetaAccess() {
  return (
    <section className="px-5 py-20 sm:px-6 lg:py-28">
      <div className="mx-auto max-w-3xl text-center">
        <TifinaghMark height={20} className="mx-auto mb-8 text-primary" />
        <h2 className="font-display text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
          Prefer to go <span className="italic text-primary">straight in?</span>
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
          Create an account on the platform. You will read and accept the beta consent first, then a founder approves
          your access by hand.
        </p>
        <a
          href="https://app.igudar.tech/auth/register"
          className="mt-10 inline-flex min-h-12 items-center justify-center rounded-2xl bg-primary px-8 text-base font-semibold text-primary-foreground transition-colors duration-200 ease-out hover:bg-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Access the demo
        </a>
      </div>
    </section>
  );
}
