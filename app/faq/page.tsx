"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import SiteFooter from '@/components/SiteFooter';
import AnimatedSection from '@/components/AnimatedSection';
import GradientText from '@/components/GradientText';
import { IndicativeNotice } from '@/components/simulator/IndicativeNotice';
import { FEE_GRID, LIMITS, formatMad, formatPercent, simulateAll } from '@/lib/finance';
import { ReactiveGlow } from '@/components/brand';

const MODEL = simulateAll(LIMITS.MIN_TICKET_MAD);
const MIN_TICKET = formatMad(LIMITS.MIN_TICKET_MAD, { decimals: 0 });

export default function FAQ() {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const faqs = [
    {
      question: 'Can IGUDAR promise me a return?',
      answer: `No. Rent can arrive late, a property can stay empty and its price can fall. That is why every figure on this site is labelled net, indicative and not guaranteed, and why we always show the Pessimistic case next to the Base case. At ${formatMad(LIMITS.MIN_TICKET_MAD, { decimals: 0 })}, the Pessimistic scenario makes ${formatMad(MODEL.pessimistic.netProfitMad)} over ${LIMITS.HOLD_YEARS} years, ${MODEL.pessimistic.beatsBankDeposit ? 'more' : 'less'} than the ${formatMad(MODEL.pessimistic.bankDepositProfitMad)} a bank deposit would earn. A return nobody can guarantee should not be promised, and not promising it protects you from a number that could be broken.`,
    },
    {
      question: 'Can I get my money out early?',
      answer: `Not at any time. Your money is locked up while the property is held, for ${LIMITS.HOLD_YEARS} years. After the first year, exit windows open every ${LIMITS.EXIT_WINDOW_MONTHS} months, where you can offer your share to other associates. A buyer is not guaranteed, and selling early costs a transfer fee of ${formatPercent(FEE_GRID.D4_TRANSFER_HT)} of the amount traded, plus registration duty and tax on any gain (to confirm with counsel).`,
    },
    {
      question: 'What happens if the raise fails?',
      answer: 'Your money waits in an escrow account at a regulated bank, one account per project, and is only released to the property company if the raise reaches its target. If it fails, or the deadline passes, the bank refunds you in full and IGUDAR keeps no fee from you.',
    },
    {
      question: 'Why is the IRR lower than the cash yield?',
      answer: `The cash yield is the rent you receive in a year divided by what you invested (${formatPercent(MODEL.base.netCashYieldYear1)} in the Base scenario). The IRR also counts the ${formatPercent(LIMITS.ACQUISITION_COSTS)} purchase costs (registration, land registry and notary) that are paid from the capital, and what you get back when the property is sold, so it is lower (${MODEL.base.netIrr === null ? 'n/a' : formatPercent(MODEL.base.netIrr)} in the Base scenario). Both are net of fees and taxes, and neither is a promise.`,
    },
    {
      question: 'How does the IGUDAR platform work?',
      answer: `Several people each buy a share of one property company, which owns one rented building. The company rents the building to a professional operator, and the rent left after costs, fees and taxes is shared between the shareholders. The minimum is ${MIN_TICKET} per project. You pay no entry fee and a platform fee of ${formatPercent(FEE_GRID.D2_PLATFORM_HT)} a year, taken through the property company. Sellers and operators pay their own fees.`,
    },
    {
      question: 'What do I actually own?',
      answer:
        'Shares in a property company (a SAS) created for one building. The company rents the building to a professional operator, and the rent, after costs, fees and taxes, is shared between the shareholders. There is no loan to you and no interest in either direction. Rent comes from the operator under the lease, not from IGUDAR.',
    },
    {
      question: 'Is IGUDAR Sharia-compliant?',
      answer:
        'We do not claim it yet. IGUDAR is built on participatory-finance principles: you own shares, the rent and the risk are shared, and there is no interest. Sharia board review in progress. Until the board gives its opinion, we will not describe IGUDAR with any religious label.',
    },
    {
      question: 'How do sellers and developers benefit?',
      answer: `A seller can raise part of the funding from a group of shareholders instead of relying only on a bank loan. The seller pays a syndication fee of ${formatPercent(FEE_GRID.S1_SYNDICATION)} of the amount raised, only if the raise closes, and the operator pays ${formatPercent(FEE_GRID.S2_STRUCTURING)} to structure the lease. Neither is charged to you.`,
    },
    {
      question: 'Who is IGUDAR for?',
      answer: `Urban professionals and Moroccans abroad who want to own a share of rented property without buying a whole building. The minimum is ${MIN_TICKET} per project. What you receive depends on how the property performs, is shown net of fees and taxes, and is never promised.`,
    },
    {
      question: 'Is IGUDAR licensed?',
      answer:
        'Not yet. IGUDAR is built to follow Moroccan crowdfunding law (Loi 15-18) and is preparing its licence application with the AMMC. Until a licence is granted, nothing on this site is an offer or a solicitation.',
    },
    {
      question: 'Can I put in real money today?',
      answer:
        'No. The platform at app.igudar.tech is a closed beta of about 50 people, using demo money. No real money is collected anywhere, and no investment is accepted before the AMMC licence. You can apply for the beta on the Beta page.',
    },
    {
      question: 'How are risks managed?',
      answer:
        'Each property is reviewed before it is listed, and its documents, fees and risks are published on its page. Money waits in a dedicated escrow account per project, and every figure is shown with a Pessimistic case next to the Base case. None of this removes the risk: you can lose part or all of what you put in.',
    },
    {
      question: 'How does payment work?',
      answer:
        'In the beta, with demo money only. Once IGUDAR is licensed, your money would go to an escrow account at a regulated bank, one per project, and never to IGUDAR itself. We will confirm the payment methods before any launch.',
    },
  ];

  return (
    <div className="min-h-screen bg-card">
      <Navbar />

      {/* Hero Section */}
      <section className="relative isolate pt-28 pb-16 lg:pt-36 lg:pb-20">
        <ReactiveGlow className="inset-0" />
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
      <section className="relative isolate py-16 bg-muted/50">
        <ReactiveGlow className="inset-0" />
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
              <AnimatedSection key={i} delay={i * 120}>
                <div className={`${item.bg} p-8 rounded-3xl h-full hover:scale-[1.02] transition-transform duration-300`}>
                  <h3 className={`text-xl font-bold ${item.accent} mb-3`}>{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative isolate py-20">
        <ReactiveGlow className="inset-0" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-14">
              <h2 className="text-3xl lg:text-[2.75rem] font-extrabold text-foreground mb-4">
                Frequently Asked <GradientText>Questions</GradientText>
              </h2>
              <p className="text-lg text-muted-foreground">Get answers to common questions about IGUDAR</p>
            </div>
          </AnimatedSection>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <AnimatedSection key={index} delay={index * 60}>
                <div className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/20 transition-colors duration-300">
                  <button
                    onClick={() => toggleItem(index)}
                    className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 hover:bg-muted/50 transition-colors duration-200"
                  >
                    <h3 className="text-[15px] font-semibold text-foreground pr-2">{faq.question}</h3>
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        openItems.includes(index) ? 'bg-primary rotate-180' : 'bg-muted'
                      }`}
                    >
                      <svg
                        className={`w-4 h-4 transition-colors ${
                          openItems.includes(index) ? 'text-white' : 'text-muted-foreground'
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  <AnimatePresence>
                    {openItems.includes(index) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-5">
                          <div className="border-t border-border pt-4">
                            <p className="text-muted-foreground leading-relaxed text-[15px]">{faq.answer}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="relative isolate pb-12">
        <ReactiveGlow className="inset-0" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <IndicativeNotice />
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 relative isolate overflow-hidden bg-muted/50 border-y border-border">
        <ReactiveGlow className="inset-0" />
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h2 className="text-3xl lg:text-[2.75rem] font-extrabold text-foreground mb-6">
              Still Have Questions?
            </h2>
            <p className="text-lg text-muted-foreground mb-10">
              Our team is here to help you understand how IGUDAR can work for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://app.igudar.tech/auth/register"
                className="inline-flex items-center justify-center px-8 py-4 bg-card text-primary font-semibold rounded-2xl hover:bg-muted/50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
              >
                Access the demo
              </a>
              <Link
                href="/beta"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-border text-foreground font-semibold rounded-2xl hover:bg-muted transition-all duration-300"
              >
                Apply for the beta
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

