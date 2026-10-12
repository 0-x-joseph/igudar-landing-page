"use client";

import { useTranslations } from "next-intl";
import { type SimulationResult } from "@/lib/finance";
import { useFormat, useScenarioLabel } from "@/lib/i18n/use-format";

/** Mobile-only summary pinned to the bottom while the controls and results scroll. */
export function StickySummary({ result }: { result: SimulationResult }) {
  const t = useTranslations("simulator.sticky");
  const tc = useTranslations("common");
  const scenarioLabel = useScenarioLabel();
  const { mad: formatMad } = useFormat();
  const key = result.input.scenarioKey === "custom" ? "base" : result.input.scenarioKey;
  const mad = (n: number) => formatMad(n, { decimals: 0 });
  return (
    <div
      role="region"
      aria-label={t("label")}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-4 py-3 backdrop-blur lg:hidden"
    >
      <p className="financial-number text-center text-sm font-bold text-foreground">
        {t("figures", { cash: mad(result.netCashYear1Mad), profit: mad(result.netProfitMad), years: result.input.holdYears })}
      </p>
      <p className="text-center text-[11px] text-muted-foreground">
        {t("scenario", { scenario: scenarioLabel(key), suffix: tc("notice.netIndicative") })}
      </p>
    </div>
  );
}
