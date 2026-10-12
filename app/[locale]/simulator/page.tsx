import { getTranslations, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { pageMetadata } from "@/lib/i18n/metadata";
import { formatMadIn } from "@/lib/i18n/format";
import { LIMITS } from "@/lib/finance";
import { SimulatorPageContent } from "@/components/simulator/SimulatorPageContent";

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "simulator.meta" });
  return pageMetadata(
    locale,
    "/simulator",
    t("title"),
    t("description", { min: formatMadIn(locale, LIMITS.MIN_TICKET_MAD, { decimals: 0 }) }),
  );
}

export default async function SimulatorPage({ params }: Params) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <SimulatorPageContent />;
}
