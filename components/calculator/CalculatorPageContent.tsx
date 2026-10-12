import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import { Calculator } from "./Calculator";
import { IndicativeNotice } from "@/components/simulator/IndicativeNotice";

const linkClass = "font-semibold text-primary underline underline-offset-2";

/** Everything on /calculator below the locale: the page itself only sets the request locale. */
export function CalculatorPageContent() {
  const t = useTranslations("calculator.page");
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 pb-20 pt-36 sm:px-6 lg:px-8 lg:pt-40">
        <header className="mb-10 max-w-3xl">
          <p className="mb-3 text-sm font-semibold text-primary">{t("eyebrow")}</p>
          <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{t("intro")}</p>
        </header>
        <Calculator />
        <p className="mt-8 text-sm leading-relaxed text-muted-foreground">
          {t.rich("links", {
            pricing: (chunks) => (
              <Link href="/pricing" className={linkClass}>
                {chunks}
              </Link>
            ),
            simulator: (chunks) => (
              <Link href="/simulator" className={linkClass}>
                {chunks}
              </Link>
            ),
          })}
        </p>
        <IndicativeNotice className="mt-10" />
      </main>
      <SiteFooter />
    </div>
  );
}
