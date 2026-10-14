"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Languages } from "lucide-react";
import { getPathname, usePathname } from "@/i18n/navigation";
import { LOCALES, LOCALE_META, isLocale, type Locale } from "@/i18n/routing";
import { flushAnalytics, track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

/**
 * Language choice: the same page in English, French, Arabic or Darija. A plain select so it works with
 * every screen reader; the current language is the selected option.
 *
 * Switching is a full navigation on purpose: `<html lang dir>` and the fonts live in the root layout,
 * which a soft client-side navigation does not re-render, so the page would keep the old direction.
 */
export function LanguageSwitcher({ className, compact = false }: { className?: string; compact?: boolean }) {
  const t = useTranslations("common.language");
  const raw = useLocale();
  const current: Locale = isLocale(raw) ? raw : "en";
  const pathname = usePathname();
  const [pending, setPending] = useState(false);

  const change = (next: Locale) => {
    if (next === current) return;
    setPending(true);
    track("language_change", { from: current, to: next });
    // Switching is a full navigation: send the event now rather than rely on pagehide alone.
    flushAnalytics();
    // The proxy honours this cookie over the URL for unprefixed paths, so it must change before the request.
    document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000; SameSite=Lax`;
    const target = getPathname({ href: pathname, locale: next });
    window.location.assign(`${target}${window.location.search}${window.location.hash}`);
  };

  return (
    <label className={cn("relative inline-flex items-center gap-1.5 text-sm font-semibold text-foreground", className)}>
      {/* The icon is dropped in the compact desktop bar, where French labels already fill the row. */}
      {!compact && <Languages className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />}
      <span className="sr-only">{t("label")}</span>
      <select
        data-language-switcher=""
        value={current}
        disabled={pending}
        onChange={(e) => change(e.target.value as Locale)}
        className={cn(
          "min-h-10 cursor-pointer appearance-none rounded-full border border-border bg-card py-1 pe-7 ps-3 text-sm font-semibold text-foreground outline-none transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          compact && "min-h-9",
        )}
      >
        {LOCALES.map((code) => (
          <option key={code} value={code} lang={code} dir={LOCALE_META[code].dir}>
            {LOCALE_META[code].nativeLabel}
          </option>
        ))}
      </select>
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        className="pointer-events-none absolute end-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 8l4 4 4-4" />
      </svg>
    </label>
  );
}
