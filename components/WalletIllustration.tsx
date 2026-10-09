import { LIMITS, NET_INDICATIVE_SUFFIX, formatMad, simulate } from "@/lib/finance";

/**
 * Static illustration of the platform wallet, built from the engine at the 25,000 MAD
 * Base case. Replaces the old dashboard screenshot. It has no actions on purpose.
 */
export default function WalletIllustration({ className = "" }: { className?: string }) {
  const sim = simulate({ ticketMad: LIMITS.MIN_TICKET_MAD, scenario: "base" });

  const tiles = [
    { label: "Committed", value: sim.input.ticketMad, note: "Your amount, pledged to one project", received: false },
    { label: "In escrow", value: 0, note: "Held at the bank until the raise closes", received: false },
    { label: "Invested", value: sim.input.ticketMad, note: "Shares in the property company", received: false },
    { label: "Received", value: sim.netCashYear1Mad, note: "Net rent after year 1 (Base)", received: true },
  ];

  return (
    <figure className={`rounded-3xl border border-border bg-card p-5 sm:p-6 ${className}`}>
      <figcaption className="mb-5 flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-bold text-foreground">Wallet</span>
        <span className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
          Illustration — demo data
        </span>
      </figcaption>
      <dl className="grid grid-cols-2 gap-3">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-2xl bg-background p-4">
            <dt className="text-xs font-semibold text-muted-foreground">{t.label}</dt>
            <dd
              className={`financial-number mt-1 text-xl font-bold tracking-tight sm:text-2xl ${
                t.received ? "text-success" : "text-foreground"
              }`}
            >
              {formatMad(t.value)}
            </dd>
            <dd className="mt-1 text-xs leading-snug text-muted-foreground">{t.note}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        A {formatMad(LIMITS.MIN_TICKET_MAD, { decimals: 0 })} example, Base scenario, one year after the raise closed.
        Figures are {NET_INDICATIVE_SUFFIX}.
      </p>
    </figure>
  );
}
