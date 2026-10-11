import { defineRouting } from "next-intl/routing";

/** The site's languages. Adding one is: add it here, add `messages/<code>/*.json`, done. */
export const LOCALES = ["en", "fr", "ar"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  // English stays at `/`; the others are prefixed (`/fr`, `/ar`). First visits are redirected by Accept-Language.
  localePrefix: "as-needed",
});

export interface LocaleMeta {
  /** The language's own name, for the switcher. */
  nativeLabel: string;
  /** BCP 47 tag used for Intl formatting (Moroccan conventions for French and Arabic). */
  intl: string;
  dir: "ltr" | "rtl";
  /** Open Graph locale. */
  og: string;
}

export const LOCALE_META: Record<Locale, LocaleMeta> = {
  en: { nativeLabel: "English", intl: "en-US", dir: "ltr", og: "en_US" },
  fr: { nativeLabel: "Français", intl: "fr-MA", dir: "ltr", og: "fr_MA" },
  ar: { nativeLabel: "العربية", intl: "ar-MA", dir: "rtl", og: "ar_MA" },
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}
