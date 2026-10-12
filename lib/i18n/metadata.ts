import type { Metadata } from "next";
import { LOCALES, LOCALE_META, routing, type Locale } from "@/i18n/routing";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://igudar.tech";

/** The public path of `pathname` in `locale` (`/pricing` → `/fr/pricing`, English unprefixed). */
export function localizedPath(locale: Locale, pathname: string): string {
  const clean = pathname === "/" ? "" : pathname;
  return locale === routing.defaultLocale ? clean || "/" : `/${locale}${clean}`;
}

/** hreflang alternates for one page, plus x-default pointing at English. */
export function alternatesFor(pathname: string): NonNullable<Metadata["alternates"]> {
  const languages: Record<string, string> = {};
  for (const locale of LOCALES) languages[locale] = localizedPath(locale, pathname);
  languages["x-default"] = localizedPath(routing.defaultLocale, pathname);
  return { canonical: undefined, languages };
}

/** Shared metadata shape for a localised page. */
export function pageMetadata(locale: Locale, pathname: string, title: string, description: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: localizedPath(locale, pathname), languages: alternatesFor(pathname).languages },
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "IGUDAR",
      locale: LOCALE_META[locale].og,
      alternateLocale: LOCALES.filter((l) => l !== locale).map((l) => LOCALE_META[l].og),
      url: localizedPath(locale, pathname),
    },
    twitter: { card: "summary", title, description },
  };
}
