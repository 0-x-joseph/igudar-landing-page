import { setRequestLocale, getTranslations } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { pageMetadata } from "@/lib/i18n/metadata";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import BetaPageContent from "@/components/beta/BetaPageContent";

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "beta.meta" });
  return pageMetadata(locale, "/beta", t("title"), t("description"));
}

export default async function BetaPage({ params }: Params) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-background text-foreground">
      <Navbar />
      <main>
        <BetaPageContent />
      </main>
      <SiteFooter />
    </div>
  );
}
