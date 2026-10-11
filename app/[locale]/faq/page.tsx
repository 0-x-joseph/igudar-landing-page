"use client";
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import SiteFooter from '@/components/SiteFooter';
import AnimatedSection from '@/components/AnimatedSection';
import FaqExplorer, { type FaqEntry } from '@/components/faq/FaqExplorer';
import StillHaveQuestion from '@/components/faq/StillHaveQuestion';
import { Hover, Reveal } from '@/components/motion';
import { ReactiveGlow, ZelligeBand } from '@/components/brand';
import GradientText from '@/components/GradientText';
import { IndicativeNotice } from '@/components/simulator/IndicativeNotice';
import { FEE_GRID, LIMITS, formatMad, formatPercent, simulateAll } from '@/lib/finance';

const MODEL = simulateAll(LIMITS.MIN_TICKET_MAD);
const MIN_TICKET = formatMad(LIMITS.MIN_TICKET_MAD, { decimals: 0 });

const CATEGORIES = ['Returns & risk', 'Money & exit', 'The platform', 'Rules & licence'];

export default function FAQ() {
  const faqs: FaqEntry[] = [
    {
      question: 'Can IGUDAR promise me a return?',
      category: 'Returns & risk',
      answer: `No. Rent can arrive late, a property can stay empty and its price can fall. That is why every figure on this site is labelled net, indicative and not guaranteed, and why we always show the Pessimistic case next to the Base case. At ${formatMad(LIMITS.MIN_TICKET_MAD, { decimals: 0 })}, the Pessimistic scenario makes ${formatMad(MODEL.pessimistic.netProfitMad)} over ${LIMITS.HOLD_YEARS} years, ${MODEL.pessimistic.beatsBankDeposit ? 'more' : 'less'} than the ${formatMad(MODEL.pessimistic.bankDepositProfitMad)} a bank deposit would earn. A return nobody can guarantee should not be promised, and not promising it protects you from a number that could be broken.`,
    },
    {
      question: 'Can I get my money out early?',
      category: 'Money & exit',
      answer: `Not at any time. Your money is locked up while the property is held, for ${LIMITS.HOLD_YEARS} years. After the first year, exit windows open every ${LIMITS.EXIT_WINDOW_MONTHS} months, where you can offer your share to other associates. A buyer is not guaranteed, and selling early costs a transfer fee of ${formatPercent(FEE_GRID.D4_TRANSFER_HT)} of the amount traded, plus registration duty and tax on any gain (to confirm with counsel).`,
    },
    {
      question: 'What happens if the raise fails?',
      category: 'Money & exit',
      answer: 'Your money waits in an escrow account at a regulated bank, one account per project, and is only released to the property company if the raise reaches its target. If it fails, or the deadline passes, the bank refunds you in full and IGUDAR keeps no fee from you.',
    },
    {
      question: 'Why is the IRR lower than the cash yield?',
      category: 'Returns & risk',
      answer: `The cash yield is the rent you receive in a year divided by what you invested (${formatPercent(MODEL.base.netCashYieldYear1)} in the Base scenario). The IRR also counts the ${formatPercent(LIMITS.ACQUISITION_COSTS)} purchase costs (registration, land registry and notary) that are paid from the capital, and what you get back when the property is sold, so it is lower (${MODEL.base.netIrr === null ? 'n/a' : formatPercent(MODEL.base.netIrr)} in the Base scenario). Both are net of fees and taxes, and neither is a promise.`,
    },
    {
      question: 'How does the IGUDAR platform work?',
      category: 'The platform',
      answer: `Several people each buy a share of one property company, which owns one rented building. The company rents the building to a professional operator, and the rent left after costs, fees and taxes is shared between the shareholders. The minimum is ${MIN_TICKET} per project. You pay no entry fee and a platform fee of ${formatPercent(FEE_GRID.D2_PLATFORM_HT)} a year, taken through the property company. Sellers and operators pay their own fees.`,
    },
    {
      question: 'What do I actually own?',
      category: 'The platform',
      answer:
        'Shares in a property company (a SAS) created for one building. The company rents the building to a professional operator, and the rent, after costs, fees and taxes, is shared between the shareholders. There is no loan to you and no interest in either direction. Rent comes from the operator under the lease, not from IGUDAR.',
    },
    {
      question: 'Is IGUDAR Sharia-compliant?',
      category: 'Rules & licence',
      answer:
        'We do not claim it yet. IGUDAR is built on participatory-finance principles: you own shares, the rent and the risk are shared, and there is no interest. Sharia board review in progress. Until the board gives its opinion, we will not describe IGUDAR with any religious label.',
    },
    {
      question: 'How do sellers and developers benefit?',
      category: 'The platform',
      answer: `A seller can raise part of the funding from a group of shareholders instead of relying only on a bank loan. The seller pays a syndication fee of ${formatPercent(FEE_GRID.S1_SYNDICATION)} of the amount raised, only if the raise closes, and the operator pays ${formatPercent(FEE_GRID.S2_STRUCTURING)} to structure the lease. Neither is charged to you.`,
    },
    {
      question: 'Who is IGUDAR for?',
      category: 'The platform',
      answer: `Urban professionals and Moroccans abroad who want to own a share of rented property without buying a whole building. The minimum is ${MIN_TICKET} per project. What you receive depends on how the property performs, is shown net of fees and taxes, and is never promised.`,
    },
    {
      question: 'Is IGUDAR licensed?',
      category: 'Rules & licence',
      answer:
        'Not yet. IGUDAR is built to follow Moroccan crowdfunding law (Loi 15-18) and is preparing its licence application with the AMMC. Until a licence is granted, nothing on this site is an offer or a solicitation.',
    },
    {
      question: 'Can I put in real money today?',
      category: 'Rules & licence',
      answer:
        'No. The platform at app.igudar.tech is a closed beta of about 50 people, using demo money. No real money is collected anywhere, and no investment is accepted before the AMMC licence. You can apply for the beta on the Beta page.',
    },
    {
      question: 'How are risks managed?',
      category: 'Returns & risk',
      answer:
        'Each property is reviewed before it is listed, and its documents, fees and risks are published on its page. Money waits in a dedicated escrow account per project, and every figure is shown with a Pessimistic case next to the Base case. None of this removes the risk: you can lose part or all of what you put in.',
    },
    {
      question: 'How does payment work?',
      category: 'Money & exit',
      answer:
        'In the beta, with demo money only. Once IGUDAR is licensed, your money would go to an escrow account at a regulated bank, one per project, and never to IGUDAR itself. We will confirm the payment methods before any launch.',
    },
  ];

  return (
    <div className="min-h-screen bg-card">
      <Navbar />

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
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to home
              </Link>

              <h1 className="text-4xl lg:text-5xl font-extrabold text-foreground leading-tight mb-6">
                Everything you need to know about{' '}
                <GradientText>IGUDAR</GradientText>
              </h1>

              <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                IGUDAR lets you own a share of a rented Moroccan building, with the fees, the risks and the rules
                written down in plain language.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-16 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Participatory finance',
                desc: 'Built on participatory-finance principles: you own shares, you share the rent, and there is no interest. Sharia board review in progress.',
                bg: 'bg-accent',
                accent: 'text-primary',
              },
              {
                title: 'A clear minimum',
                desc: `Shares start from ${MIN_TICKET} per project, and every fee is published in full.`,
                bg: 'bg-green-50',
                accent: 'text-green-700',
              },
              {
                title: 'Licence in preparation',
                desc: 'Built for Moroccan Law 15-18. IGUDAR is preparing its AMMC licence and collects no money before it is granted.',
                bg: 'bg-blue-50',
                accent: 'text-blue-700',
              },
            ].map((item, i) => (
              <Reveal key={i} index={i} className="h-full">
                <Hover className="h-full">
                  <div className={`${item.bg} p-8 rounded-3xl h-full`}>
                  <h3 className={`text-xl font-bold ${item.accent} mb-3`}>{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
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
              <h2 className="text-3xl lg:text-[2.75rem] font-extrabold text-foreground mb-4">
                Frequently Asked <GradientText>Questions</GradientText>
              </h2>
              <p className="text-lg text-muted-foreground">Get answers to common questions about IGUDAR</p>
            </div>
          </AnimatedSection>

          <FaqExplorer faqs={faqs} categories={CATEGORIES}>
            <StillHaveQuestion />
          </FaqExplorer>
        </div>
      </section>

      <section className="pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <IndicativeNotice />
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};


