"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { ScenarioKey } from "@/lib/finance";
import { isLocale, DEFAULT_LOCALE } from "@/i18n/routing";
import { formattersFor, type Formatters } from "./format";

/** Money and percent formatters for the current language, in client components. */
export function useFormat(): Formatters {
  const raw = useLocale();
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  return useMemo(() => formattersFor(locale), [locale]);
}

/** "Pessimistic" / "Pessimiste" / "متحفظ", from `common.scenarios`. */
export function useScenarioLabel(): (key: ScenarioKey) => string {
  const t = useTranslations("common.scenarios");
  return (key) => t(key);
}
