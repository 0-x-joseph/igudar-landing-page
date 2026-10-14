import type { Metadata } from "next";
import { Fraunces, Noto_Sans_Arabic, Public_Sans } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import "../globals.css";
import { Providers } from "../providers";
import ScrollToTop from "@/components/ScrollToTop";
import { AnalyticsTracker } from "@/components/analytics/AnalyticsTracker";
import { LIMITS } from "@/lib/finance";
import { formatMadIn } from "@/lib/i18n/format";
import { SITE_URL, pageMetadata } from "@/lib/i18n/metadata";
import { LOCALE_META, routing } from "@/i18n/routing";

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
  display: "swap",
});

// Display serif for hero titles only, never for numbers.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
  axes: ["opsz"],
});

// Arabic body and display face. Loaded for every language so switching never reflows on a font swap.
const notoSansArabic = Noto_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "meta" });
  const title = t("home.title");
  const description = t("home.description", { min: formatMadIn(locale, LIMITS.MIN_TICKET_MAD, { decimals: 0 }) });
  return {
    metadataBase: new URL(SITE_URL),
    // Indexing is left at the Next.js default (indexed). Founders: add `robots: { index: false }` to hide the site until launch.
    ...pageMetadata(locale, "/", title, description),
    icons: {
      icon: "/images/Logo-IGUDAR-2-Photoroom.svg",
      shortcut: "/images/Logo-IGUDAR-2-Photoroom.svg",
      apple: "/images/Logo-IGUDAR-2-Photoroom.svg",
    },
    other: { "theme-color": "#FFFFFF" },
  };
}

export default async function LocaleLayout({ children, params }: Readonly<{ children: React.ReactNode }> & Params) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const { dir } = LOCALE_META[locale];

  return (
    <html
      lang={locale}
      dir={dir}
      // Smooth scrolling is declared in globals.css; this lets Next switch it off while it scrolls to the top of a new page.
      data-scroll-behavior="smooth"
      className={`${publicSans.variable} ${fraunces.variable} ${notoSansArabic.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased font-sans bg-card text-foreground">
        <NextIntlClientProvider>
          <Providers>
            <ScrollToTop />
            <AnalyticsTracker />
            {children}
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
