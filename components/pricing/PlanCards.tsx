"use client";

import { FEE_GRID, LIMITS, NET_INDICATIVE_SUFFIX, formatMad, formatPercent } from "@/lib/finance";
import { PLANS, planFigures, type Plan, type PlanId } from "@/lib/plans";
import { CountUp } from "@/components/CountUp";
import { Hover, Reveal } from "@/components/motion";

type Row =
  | { kind: "fee"; label: string; value: string }
  | { kind: "planned"; label: string };

const mad0 = (n: number) => formatMad(n, { decimals: 0 });

/** Lines that are in the published fee grid (D1, D2, D4), shown the same on every card. */
const GRID_FEES: Row[] = [
  { kind: "fee", label: "Entry fee", value: formatPercent(FEE_GRID.D1_ENTRY, 0) },
  { kind: "fee", label: "Platform fee", value: `${formatPercent(FEE_GRID.D2_PLATFORM_HT, 2)} / yr HT` },
  { kind: "fee", label: "Transfer, only if you sell early", value: formatPercent(FEE_GRID.D4_TRANSFER_HT) },
];

/** What each plan adds. Anything marked "planned" is not in the fee grid and states no amount. */
const EXTRA_FEES: Record<PlanId, Row[]> = {
  individual: [
    { kind: "planned", label: "File fee" },
    { kind: "planned", label: "Lower transfer fee" },
  ],
  family: [
    { kind: "planned", label: "Transfers between members" },
    { kind: "planned", label: "Volume discount on combined tickets" },
  ],
  institutional: [],
};

const SERVICE: Record<PlanId, Row[]> = {
  individual: [{ kind: "fee", label: "Analytics, optional (D6)", value: `${mad0(FEE_GRID.D6_ANALYTICS_MAD.individual)} / yr` }],
  family: [{ kind: "fee", label: "Analytics, optional (D6)", value: `${mad0(FEE_GRID.D6_ANALYTICS_MAD.premium)} / yr` }],
  institutional: [
    { kind: "fee", label: "Analytics, optional (D6)", value: `${mad0(FEE_GRID.D6_ANALYTICS_MAD.b2b)} / yr` },
    { kind: "planned", label: "Anchor-investor discount" },
  ],
};

const TICKET_NOTES: Record<PlanId, { prefix?: string; notes: string[] }> = {
  individual: { notes: [`cap ${mad0(LIMITS.MAX_PER_PROJECT_MAD)} per project`] },
  family: { prefix: "per member", notes: ["family tickets add up"] },
  institutional: { notes: ["business angels exempt from caps (art. 44)"] },
};

function RowList({ rows, dark }: { rows: Row[]; dark: boolean }) {
  return (
    <dl className="mt-3 space-y-2.5 text-sm">
      {rows.map((r) =>
        r.kind === "fee" ? (
          <div key={r.label} className="flex items-baseline justify-between gap-4">
            <dt className={dark ? "text-white/70" : "text-muted-foreground"}>{r.label}</dt>
            <dd className="financial-number text-right font-semibold">{r.value}</dd>
          </div>
        ) : (
          <div
            key={r.label}
            data-planned=""
            className={`flex items-center justify-between gap-4 rounded-lg border border-dashed px-2.5 py-1.5 ${
              dark ? "border-white/20 text-white/50" : "border-border text-muted-foreground/70"
            }`}
          >
            <dt>{r.label}</dt>
            <dd
              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-wide ${
                dark ? "bg-white/10 text-white/70" : "bg-muted text-muted-foreground"
              }`}
            >
              Planned
            </dd>
          </div>
        ),
      )}
    </dl>
  );
}

function PlanCard({ plan, index }: { plan: Plan; index: number }) {
  const dark = plan.id === "family";
  const { base, pessimistic } = planFigures(plan);
  const note = TICKET_NOTES[plan.id];
  const muted = dark ? "text-white/70" : "text-muted-foreground";
  const label = `text-xs font-semibold uppercase tracking-wider ${muted}`;

  return (
    <Reveal as="li" index={index} className="h-full list-none">
      <Hover className="h-full">
        <article
          data-plan={plan.id}
          data-highlight={dark ? "true" : undefined}
          className={`relative flex h-full flex-col overflow-hidden rounded-3xl border p-6 sm:p-8 ${
            dark
              ? "border-primary/40 bg-foreground text-background shadow-[0_24px_60px_-28px_rgb(93_24_233/0.55)] lg:-my-4 lg:py-12"
              : "border-border bg-card text-foreground"
          }`}
        >
          {dark && <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-primary" />}
          <p className={`text-xs font-bold tracking-[0.18em] ${dark ? "text-[#B79CFF]" : "text-primary"}`}>{plan.eyebrow}</p>
          <h3 className="mt-3 font-display text-3xl font-semibold tracking-tight">{plan.title}</h3>
          <p className={`mt-2 text-sm leading-relaxed ${muted}`}>{plan.audience}</p>

          <div className="mt-7">
            <p className={label}>Minimum ticket</p>
            <p className="mt-1 flex flex-wrap items-baseline gap-x-2">
              <span className="financial-number text-3xl font-bold tracking-tight">{mad0(plan.ticketMad)}</span>
              {note.prefix && <span className={`text-sm ${muted}`}>{note.prefix}</span>}
            </p>
            {note.notes.map((n) => (
              <p key={n} className={`text-sm ${muted}`}>
                {n}
              </p>
            ))}
          </div>

          <div className="mt-7">
            <p className={label}>Personal fees</p>
            <RowList rows={[...GRID_FEES, ...EXTRA_FEES[plan.id]]} dark={dark} />
          </div>

          <div className="mt-7">
            <p className={label}>Service</p>
            <RowList rows={SERVICE[plan.id]} dark={dark} />
          </div>

          <div className="mt-auto pt-8"><div className={`grid grid-cols-2 gap-4 border-t pt-6 ${dark ? "border-white/15" : "border-border"}`}>
            <div>
              <p className={`text-xs leading-snug ${muted}`}>Net IRR per year</p>
              <p className="financial-number mt-1 text-2xl font-bold tracking-tight">
                <span data-figure="irr">
                  <CountUp value={base.netIrr ?? 0} format={(n) => formatPercent(n)} />
                </span>
              </p>
              <p data-figure="irr-pessimistic" className={`financial-number mt-1 text-xs ${muted}`}>
                Pessimistic {pessimistic.netIrr === null ? "n/a" : formatPercent(pessimistic.netIrr)}
              </p>
            </div>
            <div>
              <p className={`text-xs leading-snug ${muted}`}>Total gain after the sale over {LIMITS.HOLD_YEARS} years</p>
              <p className="financial-number mt-1 text-2xl font-bold tracking-tight">
                <span data-figure="gain">
                  <CountUp value={base.netProfitMad} format={(n) => mad0(n)} />
                </span>
              </p>
              <p data-figure="gain-pessimistic" className={`financial-number mt-1 text-xs ${muted}`}>
                Pessimistic {mad0(pessimistic.netProfitMad)}
              </p>
            </div>
          </div>
          </div>
          <p className={`mt-4 text-[11px] ${muted}`}>{NET_INDICATIVE_SUFFIX}</p>
        </article>
      </Hover>
    </Reveal>
  );
}

/** "One property, three ways to invest": every figure is the engine's output at the plan's ticket. */
export default function PlanCards() {
  return (
    <div>
      <ul className="grid items-stretch gap-5 lg:grid-cols-3 lg:gap-6" aria-label="Plans">
        {PLANS.map((p, i) => (
          <PlanCard key={p.id} plan={p} index={i} />
        ))}
      </ul>
      <p className="mt-8 max-w-3xl text-sm leading-relaxed text-muted-foreground">
        {`Simulation net of fees and taxes, not guaranteed: Base scenario of the IGUDAR financial model, sold after ${LIMITS.HOLD_YEARS} years; the IRR includes the sale; total gain = net rent + sale proceeds − amount invested. Pessimistic shown beside Base.`}
      </p>
    </div>
  );
}
