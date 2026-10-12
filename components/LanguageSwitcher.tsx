"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Languages } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { LOCALES, LOCALE_META, isLocale, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

/**
 * Language choice: the same page in English, French or Arabic. A plain select so it works without
 * JavaScript assumptions and with every screen reader; the current language is the selected option.
 */
export function LanguageSwitcher({ className, compact = false }: { className?: string; compact?: boolean }) {
  const t = useTranslations("common.language");
  const raw = useLocale();
  const current: Locale = isLocale(raw) ? raw : "en";
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const change = (next: Locale) => {
    if (next === current) return;
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
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
