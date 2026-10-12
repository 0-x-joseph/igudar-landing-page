import { useTranslations } from "next-intl";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import { Simulator } from "./Simulator";
import { IndicativeNotice } from "./IndicativeNotice";

/** Everything on /simulator below the locale: the page itself only sets the request locale. */
export function SimulatorPageContent() {
  const t = useTranslations("simulator.page");
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 pb-28 pt-36 sm:px-6 lg:px-8 lg:pb-20 lg:pt-40">
        <header className="mb-10 max-w-3xl">
          <p className="mb-3 text-sm font-semibold text-primary">{t("eyebrow")}</p>
          <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{t("intro")}</p>
        </header>
        <Simulator />
        <IndicativeNotice className="mt-10" />
      </main>
      <SiteFooter />
    </div>
  );
}
