import { formatMad, scenarioLabel, type SimulationResult } from "@/lib/finance";

/** Mobile-only summary pinned to the bottom while the controls and results scroll. */
export function StickySummary({ result }: { result: SimulationResult }) {
  const key = result.input.scenarioKey === "custom" ? "base" : result.input.scenarioKey;
  const mad = (n: number) => formatMad(n, { decimals: 0 });
  return (
    <div
      role="region"
      aria-label="Summary of your result"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-4 py-3 backdrop-blur lg:hidden"
    >
      <p className="financial-number text-center text-sm font-bold text-foreground">
        {mad(result.netCashYear1Mad)}/yr · {mad(result.netProfitMad)} over {result.input.holdYears} yrs
      </p>
      <p className="text-center text-[11px] text-muted-foreground">
        {scenarioLabel(key)} · net · indicative · not guaranteed
      </p>
    </div>
  );
}
