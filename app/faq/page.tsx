"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import AnimatedSection from '@/components/AnimatedSection';
import GradientText from '@/components/GradientText';
import { IndicativeNotice } from '@/components/simulator/IndicativeNotice';
import { FEE_GRID, LIMITS, formatMad, formatPercent, simulateAll } from '@/lib/finance';

const MODEL = simulateAll(LIMITS.MIN_TICKET_MAD);

export default function FAQ() {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const faqs = [
    {
      question: 'Is my return guaranteed?',
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
      answer: `The cash yield is the rent you receive in a year divided by what you invested (${formatPercent(MODEL.base.netCashYieldYear1)} in the Base scenario). The IRR also counts the ${formatPercent(LIMITS.ACQUISITION_COSTS)} purchase costs (registration, land registry and notary) that are paid from the capital, and what you get back when the property is sold, so it is lower (${MODEL.base.netIrr === null ? 'n/a' : formatPercent(MODEL.base.netIrr)} in the Base scenario). Both are net of fees and taxes, and neither is guaranteed.`,
    },
    {
      question: 'How does the IGUDAR platform work?',
      answer:
        'IGUDAR pools funds from multiple investors who can enter with low minimum amounts. These funds are used to finance real estate projects compliant with Sharia principles. Developers pay a syndication fee, and investors pay a small percentage (1.5%) of pre-tax profit.',
    },
    {
      question: 'How does IGUDAR ensure Sharia compliance?',
      answer:
        'IGUDAR collaborates with certified Sharia advisors and applies Islamic finance principles, avoiding interest and favoring profit-and-loss sharing models.',
    },
    {
      question: 'How do real estate developers benefit?',
      answer:
        'Developers access competitive, Sharia-compliant financing without relying on traditional banks or high-interest loans.',
    },
    {
      question: 'What are the benefits for small savers?',
      answer:
        'Small savers can invest with low amounts, enter real estate markets, earn dividends based on project performance, and align with their religious values.',
    },
    {
      question: 'How is the platform regulated?',
      answer:
        'IGUDAR follows Moroccan crowdfunding Law 15-18 and operates under AMMC supervision for financial and investor protection.',
    },
    {
      question: 'What mechanisms are in place to manage risks?',
      answer:
        'IGUDAR implements project due diligence, active monitoring, transparent reporting, and portfolio diversification, backed by legal agreements.',
    },
    {
      question: 'Does IGUDAR comply with Moroccan crowdfunding law?',
      answer:
        'Yes. IGUDAR operates under the "investment-based crowdfunding" model and is subject to AMMC accreditation per Law 15-18.',
    },
    {
      question: 'What types of contracts are used with investors?',
      answer:
        'IGUDAR uses Mudarabah (profit-sharing), Musharakah (joint ownership), and Ijara (lease-to-own), compliant with Moroccan law and Sharia standards.',
    },
    {
      question: 'How does the payment process work?',
      answer:
        'After verifying identity, users can securely register a Mastercard or Visa card and invest online through our secure payment gateway.',
    },
  ];

  return (
    <div className="min-h-screen bg-card">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-28 pb-16 lg:pt-36 lg:pb-20">
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
                IGUDAR is a Moroccan fintech platform transforming property ownership through AI-driven,
                Sharia-compliant fractional real estate investment.
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
                title: 'Sharia Compliant',
                desc: 'All investments follow Islamic financial principles with certified Sharia advisor oversight.',
                bg: 'bg-accent',
                accent: 'text-primary',
              },
              {
                title: 'Accessible to All',
                desc: 'Low minimum investments starting from 1,000 MAD make real estate accessible to everyone.',
                bg: 'bg-green-50',
                accent: 'text-green-700',
              },
              {
                title: 'Regulated Platform',
                desc: 'Operating under Moroccan Law 15-18 with AMMC supervision for investor protection.',
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
      <section className="py-20">
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

      <section className="pb-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <IndicativeNotice />
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 relative overflow-hidden bg-muted/50 border-y border-border">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(93,24,233,0.08),transparent_55%)]" />
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
                Get Started Today
              </a>
              <a
                href="#"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-border text-foreground font-semibold rounded-2xl hover:bg-muted transition-all duration-300"
              >
                Contact Support
              </a>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted text-foreground pt-16 pb-8 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div>
              <Link href="/" className="inline-block mb-6">
                <img
                  src="/images/Logo-IGUDAR-2-Photoroom.png"
                  alt="IGUDAR"
                  className="h-12 w-auto object-contain"
                />
              </Link>
              <p className="text-muted-foreground text-[15px] leading-relaxed">
                Democratizing real estate investment in Morocco through AI-powered, Sharia-compliant fractional ownership.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-5 text-foreground">Platform</h3>
              <ul className="space-y-3">
                <li><Link href="/" className="text-muted-foreground hover:text-foreground transition-colors text-[15px]">How it Works</Link></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-[15px]">AI Technology</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-[15px]">Properties</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-[15px]">Security</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-5 text-foreground">Support</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-[15px]">Help Center</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-[15px]">Contact Us</a></li>
                <li><Link href="/faq" className="text-muted-foreground hover:text-foreground transition-colors text-[15px]">FAQ</Link></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-[15px]">Privacy</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-5 text-foreground">Company</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-[15px]">About</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-[15px]">Careers</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-[15px]">Press</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-[15px]">Partners</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">&copy; 2025 IGUDAR. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};


