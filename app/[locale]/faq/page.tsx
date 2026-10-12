import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import FaqPageContent from "@/components/faq/FaqPageContent";
import { routing } from "@/i18n/routing";
import { pageMetadata } from "@/lib/i18n/metadata";

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "faq.meta" });
  return pageMetadata(locale, "/faq", t("title"), t("description"));
}

export default async function FaqPage({ params }: Params) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="min-h-screen bg-card">
      <Navbar />
      <main>
        <FaqPageContent />
      </main>
      <SiteFooter />
    </div>
  );
}
