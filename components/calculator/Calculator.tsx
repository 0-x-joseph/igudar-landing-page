"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { FEE_GRID, LIMITS, checkCaps, formatMad, formatPercent, type CapRejection } from "@/lib/finance";
import {
  calculateOwnership,
  calculatorFeeRows,
  clampProject,
  earlyExitFor,
} from "@/lib/calculator";
import { DEFAULT_TICKET_MAD, clampTicket } from "@/lib/simulator";
import { track } from "@/lib/analytics";
import { TicketField } from "@/components/simulator/TicketField";
import { AnimatedNumber } from "@/components/simulator/AnimatedNumber";

const DEFAULT_PROJECT_MAD = LIMITS.MAX_RAISE_MAD;

const inputClass =
  "financial-number h-12 w-full rounded-2xl border border-border bg-card px-4 text-base font-semibold text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

function Card({ title, intro, children }: { title: string; intro?: string; children: React.ReactNode }) {
  const id = useId();
  return (
    <section aria-labelledby={id} className="rounded-3xl border border-border bg-card p-5 sm:p-6">
      <h2 id={id} className="text-lg font-bold text-foreground">
        {title}
      </h2>
      {intro && <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{intro}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function numberFrom(value: string): number {
  const n = Number(value);
  return value.trim() === "" || !Number.isFinite(n) || n < 0 ? 0 : n;
}

const CAP_MESSAGES: Record<CapRejection, string> = {
  invalid_ticket: "Enter an amount above zero.",
  per_project_cap: `This is above the ${formatMad(LIMITS.MAX_PER_PROJECT_MAD, { decimals: 0 })} limit per contributor per project.`,
  all_platforms_cap: `This would take you above the ${formatMad(LIMITS.MAX_ALL_PLATFORMS_MAD, { decimals: 0 })} limit across all crowdfunding platforms.`,
};

/** Fees and ownership calculator. Every figure comes from lib/finance through lib/calculator. */
export function Calculator() {
  const [ticket, setTicket] = useState(DEFAULT_TICKET_MAD);
  const [projectInput, setProjectInput] = useState(String(DEFAULT_PROJECT_MAD));
  const [exitYear, setExitYear] = useState(2);
  const [tradedInput, setTradedInput] = useState<string | null>(null);
  const [inProject, setInProject] = useState("0");
  const [inTotal, setInTotal] = useState("0");
  const [isAngel, setIsAngel] = useState(false);

  useEffect(() => {
    track("calc_view");
  }, []);

  const project = clampProject(numberFrom(projectInput), ticket);
  const ownership = useMemo(() => calculateOwnership({ ticketMad: ticket, projectMad: project }), [ticket, project]);
  const rows = useMemo(() => calculatorFeeRows({ ticketMad: ticket, projectMad: project }), [ticket, project]);

  const traded = tradedInput === null ? ticket : numberFrom(tradedInput);
  const exit = earlyExitFor({ tradedMad: traded, year: exitYear });

  const caps = checkCaps({
    ticketMad: ticket,
    investedInProjectMad: numberFrom(inProject),
    investedTotalMad: numberFrom(inTotal),
    isAngel,
  });

  const s1 = rows.find((r) => r.code === "S1");
  const s2 = rows.find((r) => r.code === "S2");
  const mad = (n: number) => formatMad(n);

  return (
    <div className="space-y-8">
      <Card title="Your amount and the project" intro="Ownership is your amount divided by what the project raises.">
        <div className="grid gap-5 sm:grid-cols-2">
          <TicketField id="calc-amount" label="Your amount" value={ticket} onChange={(n) => setTicket(clampTicket(n))} />
          <div>
            <label htmlFor="calc-project" className="mb-2 block text-sm font-semibold text-foreground">
              Project size (capital raised, MAD)
            </label>
            <input
              id="calc-project"
              type="number"
              inputMode="numeric"
              min={ticket}
              max={LIMITS.MAX_RAISE_MAD}
              step={100_000}
              value={projectInput}
              onChange={(e) => setProjectInput(e.target.value)}
              onBlur={() => setProjectInput(String(project))}
              className={inputClass}
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Up to {formatMad(LIMITS.MAX_RAISE_MAD, { decimals: 0 })} per project over 12 months.
            </p>
          </div>
        </div>
      </Card>

      <section aria-labelledby="calc-own-title">
        <h2 id="calc-own-title" className="sr-only">
          Ownership
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-muted-foreground">Your ownership of the property company (SAS)</h3>
            <p className="financial-number mt-1 text-3xl font-bold text-foreground sm:text-4xl">
              <AnimatedNumber value={ownership.share} format={(n) => formatPercent(n, 3)} />
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              You become a shareholder of the company that owns the property, in proportion to your amount.
            </p>
          </div>
          <div className="rounded-3xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-muted-foreground">Investors needed to fill the project</h3>
            <p className="financial-number mt-1 text-3xl font-bold text-foreground sm:text-4xl">
              <AnimatedNumber value={ownership.investorsNeeded} format={(n) => Math.round(n).toLocaleString("en-US")} />
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              At the {formatMad(LIMITS.MIN_TICKET_MAD, { decimals: 0 })} minimum ticket.
            </p>
          </div>
        </div>
      </section>

      <Card
        title="Who pays what"
        intro="Your share of each fee line, for the amount and project above. Exit lines use the Base scenario sale."
      >
        <ul className="divide-y divide-border">
          {rows.map((row) => (
            <li key={row.code} className="grid gap-1 py-3 sm:grid-cols-[1fr_auto] sm:gap-x-6">
              <p className="text-sm font-semibold text-foreground">
                <span className="mr-2 rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-bold text-muted-foreground">
                  {row.code}
                </span>
                {row.label}
              </p>
              <p className="financial-number text-sm font-semibold text-foreground sm:text-right">
                {row.yourShareMad === null ? "Not in the 5-year simulation" : `${mad(row.yourShareMad)} for you`}
              </p>
              <p className="text-xs leading-relaxed text-muted-foreground sm:col-span-2">
                Paid by {row.paidBy.toLowerCase()} · {row.when.toLowerCase()}
                {row.lineTotalMad !== null && row.lineTotalMad > 0 && ` · ${mad(row.lineTotalMad)} on the whole project`}
                {row.note ? ` · ${row.note}` : ""}
              </p>
            </li>
          ))}
        </ul>
        {s1 && s2 && s1.lineTotalMad !== null && s2.lineTotalMad !== null && (
          <p className="mt-4 rounded-2xl bg-accent px-4 py-3 text-sm leading-relaxed text-accent-foreground">
            The seller pays {formatPercent(FEE_GRID.S1_SYNDICATION)} of the capital raised ({mad(s1.lineTotalMad)}), and
            the operator pays {formatPercent(FEE_GRID.S2_STRUCTURING)} ({mad(s2.lineTotalMad)}). You pay none of it, and
            it does not reduce your return.
          </p>
        )}
      </Card>

      <Card
        title="Early exit calculator"
        intro={`Exit windows open every ${LIMITS.EXIT_WINDOW_MONTHS} months after the first year. Selling early costs a transfer fee, and a buyer is not guaranteed.`}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="calc-exit-year" className="mb-2 block text-sm font-semibold text-foreground">
              Sell in a window in
            </label>
            <select
              id="calc-exit-year"
              value={exitYear}
              onChange={(e) => setExitYear(Number(e.target.value))}
              className={inputClass}
            >
              <option value={0}>The first year (no window yet)</option>
              {Array.from({ length: LIMITS.HOLD_YEARS - 1 }, (_, i) => i + 1).map((y) => (
                <option key={y} value={y}>
                  Year {y}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="calc-traded" className="mb-2 block text-sm font-semibold text-foreground">
              Value of the share you sell (MAD)
            </label>
            <input
              id="calc-traded"
              type="number"
              inputMode="numeric"
              min={0}
              step={1000}
              value={tradedInput ?? String(ticket)}
              onChange={(e) => setTradedInput(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
        <div className="mt-5 rounded-2xl bg-muted p-4" aria-live="polite">
          {exit.windowOpen ? (
            <>
              <p className="text-sm font-semibold text-foreground">
                Transfer fee ({formatPercent(FEE_GRID.D4_TRANSFER_HT)} of the amount traded)
              </p>
              <p className="financial-number mt-1 text-2xl font-bold text-foreground">{mad(exit.feeMad)}</p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Plus registration duty and tax on any gain: to confirm with counsel. The fee is paid by the seller, and the
                price depends on a buyer being found in the window.
              </p>
            </>
          ) : (
            <p className="text-sm font-semibold text-foreground">
              No exit window opens during the first year. Your share is locked up until the first window.
            </p>
          )}
        </div>
      </Card>

      <Card
        title="Caps checker"
        intro={`The limit is ${formatMad(LIMITS.MAX_PER_PROJECT_MAD, { decimals: 0 })} per contributor per project and ${formatMad(LIMITS.MAX_ALL_PLATFORMS_MAD, { decimals: 0 })} across all platforms. Business angels are exempt (art. 44).`}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="calc-in-project" className="mb-2 block text-sm font-semibold text-foreground">
              Already invested in this project (MAD)
            </label>
            <input id="calc-in-project" type="number" min={0} step={5000} value={inProject} onChange={(e) => setInProject(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="calc-in-total" className="mb-2 block text-sm font-semibold text-foreground">
              Already invested across all platforms (MAD)
            </label>
            <input id="calc-in-total" type="number" min={0} step={5000} value={inTotal} onChange={(e) => setInTotal(e.target.value)} className={inputClass} />
          </div>
        </div>
        <label className="mt-4 flex cursor-pointer items-start gap-3 text-sm text-muted-foreground">
          <input type="checkbox" checked={isAngel} onChange={(e) => setIsAngel(e.target.checked)} className="mt-0.5 size-5 shrink-0 accent-primary" />
          <span>I am a business angel (not capped)</span>
        </label>
        <p
          role="status"
          className={`mt-4 rounded-2xl px-4 py-3 text-sm font-semibold ${caps.ok ? "bg-muted text-foreground" : "bg-muted text-destructive"}`}
        >
          {caps.ok
            ? isAngel
              ? "Business angels are not capped per project or across platforms."
              : `Within the caps. Room before this amount: ${mad(caps.headroom.perProject)} in this project, ${mad(caps.headroom.total)} across platforms.`
            : CAP_MESSAGES[caps.reason ?? "invalid_ticket"]}
        </p>
      </Card>
    </div>
  );
}
