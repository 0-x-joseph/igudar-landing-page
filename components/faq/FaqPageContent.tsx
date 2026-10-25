"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import AnimatedSection from "@/components/AnimatedSection";
import FaqExplorer, { type FaqCategory, type FaqEntry } from "@/components/faq/FaqExplorer";
import StillHaveQuestion from "@/components/faq/StillHaveQuestion";
import { Hover, Reveal } from "@/components/motion";
import { ReactiveGlow, ZelligeBand } from "@/components/brand";
import GradientText from "@/components/GradientText";
import { IndicativeNotice } from "@/components/simulator/IndicativeNotice";
import { FEE_GRID, LIMITS, simulateAll } from "@/lib/finance";
import { useFormat } from "@/lib/i18n/use-format";

const MODEL = simulateAll(LIMITS.MIN_TICKET_MAD);

/** Category ids, in rail order. Labels: `faq.categories.<id>`. */
const CATEGORY_IDS = ["returns", "money", "platform", "rules"] as const;
type CategoryId = (typeof CATEGORY_IDS)[number];

/** Question ids in page order, each with its category. Text: `faq.items.<id>.q` / `.a`. */
const FAQ_ITEMS: readonly { id: string; category: CategoryId }[] = [
  { id: "promise", category: "returns" },
  { id: "earlyExit", category: "money" },
  { id: "raiseFails", category: "money" },
  { id: "irrVsYield", category: "returns" },
  { id: "howItWorks", category: "platform" },
  { id: "ownership", category: "platform" },
  { id: "participatory", category: "rules" },
  { id: "sellers", category: "platform" },
  { id: "audience", category: "platform" },
  { id: "licence", category: "rules" },
  { id: "realMoney", category: "rules" },
  { id: "risks", category: "returns" },
  { id: "payment", category: "money" },
];

/** Highlight cards above the questions. */
const PILLARS = [
  { id: "participatory", bg: "bg-accent", accent: "text-primary" },
  { id: "minimum", bg: "bg-green-50", accent: "text-green-700" },
  { id: "licence", bg: "bg-blue-50", accent: "text-blue-700" },
] as const;

export default function FaqPageContent() {
  const t = useTranslations("faq");
  const f = useFormat();
  const minTicket = f.mad(LIMITS.MIN_TICKET_MAD, { decimals: 0 });

  // Every figure inside an answer comes from the engine; the words around it come from the messages.
  const values: Record<string, Record<string, string>> = {
    promise: {
      min: minTicket,
      pessimisticProfit: f.mad(MODEL.pessimistic.netProfitMad),
      years: f.number(LIMITS.HOLD_YEARS),
      comparison: MODEL.pessimistic.beatsBankDeposit ? t("items.promise.more") : t("items.promise.less"),
      bankProfit: f.mad(MODEL.pessimistic.bankDepositProfitMad),
    },
    earlyExit: {
      years: f.number(LIMITS.HOLD_YEARS),
      months: f.number(LIMITS.EXIT_WINDOW_MONTHS),
      transferFee: f.percent(FEE_GRID.D4_TRANSFER_HT),
    },
    irrVsYield: {
      cashYield: f.percent(MODEL.base.netCashYieldYear1),
      acquisition: f.percent(LIMITS.ACQUISITION_COSTS),
      irr: MODEL.base.netIrr === null ? t("items.irrVsYield.notAvailable") : f.percent(MODEL.base.netIrr),
    },
    howItWorks: {
      min: minTicket,
      platformFee: f.percent(FEE_GRID.D2_PLATFORM_HT, 2),
      entryFee: f.percent(FEE_GRID.D1_ENTRY, 1),
      entryAmount: f.mad(MODEL.base.entryFeeMad, { decimals: 0 }),
    },
    sellers: { syndication: f.percent(FEE_GRID.S1_SYNDICATION) },
    audience: { min: minTicket },
  };

  const categories: FaqCategory[] = CATEGORY_IDS.map((id) => ({ id, label: t(`categories.${id}`) }));
  const faqs: FaqEntry[] = FAQ_ITEMS.map(({ id, category }) => ({
    id,
    category,
    question: t(`items.${id}.q`),
    answer: t(`items.${id}.a`, values[id] ?? {}),
  }));

  return (
    <>
      {/* Hero Section */}
      <section className="group relative isolate overflow-hidden pt-28 pb-16 lg:pt-36 lg:pb-20">
        <ReactiveGlow className="inset-x-0 top-0 -z-10 h-full" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-2 mb-8 text-muted-foreground hover:text-primary transition-colors text-sm font-medium"
              >
                <svg
                  className="w-4 h-4 rtl:-scale-x-100"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                {t("hero.back")}
              </Link>

              <h1 className="font-display text-4xl lg:text-5xl font-semibold tracking-tight text-foreground leading-tight mb-6">
                {t.rich("hero.title", { brand: (chunks) => <span className="italic text-primary">{chunks}</span> })}
              </h1>

              <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">{t("hero.lead")}</p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-16 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {PILLARS.map((item, i) => (
              <Reveal key={item.id} index={i} className="h-full">
                <Hover className="h-full">
                  <div className={`${item.bg} p-8 rounded-3xl h-full`}>
                    <h3 className={`text-xl font-bold ${item.accent} mb-3`}>{t(`pillars.${item.id}.title`)}</h3>
                    <p className="text-muted-foreground leading-relaxed">{t(`pillars.${item.id}.desc`, { min: minTicket })}</p>
                  </div>
                </Hover>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <ZelligeBand className="mx-auto max-w-4xl" />

      {/* FAQ Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-14">
              <h2 className="font-display text-3xl lg:text-[2.75rem] font-semibold leading-tight tracking-tight text-foreground mb-4">
                {t.rich("section.title", { accent: (chunks) => <GradientText>{chunks}</GradientText> })}
              </h2>
              <p className="text-lg text-muted-foreground">{t("section.lead")}</p>
            </div>
          </AnimatedSection>

          <FaqExplorer faqs={faqs} categories={categories}>
            <StillHaveQuestion />
          </FaqExplorer>
        </div>
      </section>

      <section className="pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <IndicativeNotice />
        </div>
      </section>
    </>
  );
}
