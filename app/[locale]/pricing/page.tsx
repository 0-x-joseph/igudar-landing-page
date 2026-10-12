import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import PricingPageContent from "@/components/pricing/PricingPageContent";
import { routing } from "@/i18n/routing";
import { pageMetadata } from "@/lib/i18n/metadata";

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "pricing.meta" });
  return pageMetadata(locale, "/pricing", t("title"), t("description"));
}

export default async function PricingPage({ params }: Params) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-background text-foreground">
      <Navbar />
      <main>
        <PricingPageContent />
      </main>
      <SiteFooter />
    </div>
  );
}
