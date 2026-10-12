import { getTranslations, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { pageMetadata } from "@/lib/i18n/metadata";
import { CalculatorPageContent } from "@/components/calculator/CalculatorPageContent";

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "calculator.meta" });
  return pageMetadata(locale, "/calculator", t("title"), t("description"));
}

export default async function CalculatorPage({ params }: Params) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <CalculatorPageContent />;
}
