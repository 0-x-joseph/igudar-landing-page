import type { MetadataRoute } from "next";
import { LOCALES } from "@/i18n/routing";
import { SITE_URL, localizedPath } from "@/lib/i18n/metadata";

/** Every public page in every language, with hreflang alternates so search engines pair them. */
export const SITE_PATHS = ["/", "/simulator", "/calculator", "/pricing", "/beta", "/faq"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return SITE_PATHS.map((pathname) => ({
    url: `${SITE_URL}${localizedPath("en", pathname)}`,
    lastModified,
    changeFrequency: "weekly",
    priority: pathname === "/" ? 1 : 0.7,
    alternates: {
      languages: Object.fromEntries(LOCALES.map((locale) => [locale, `${SITE_URL}${localizedPath(locale, pathname)}`])),
    },
  }));
}
