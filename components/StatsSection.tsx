"use client";

import {
  Bot,
  ChartNoAxesCombined,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

const aiFeatures = [
  {
    number: '01',
    title: 'AI Chatbot',
    description:
      'Ask direct questions about a property, its documents, or the market and receive answers grounded in verified platform data.',
    icon: Bot,
    detail: 'RAG-powered property assistant',
  },
  {
    number: '02',
    title: 'Risk Assessment',
    description:
      'Review financial, legal, location, and market signals through one clear score with the factors behind it.',
    icon: ShieldCheck,
    detail: 'Transparent multi-factor scoring',
  },
  {
    number: '03',
    title: 'ROI Prediction',
    description:
      'Compare expected rental yield and value growth across realistic market scenarios before making a decision.',
    icon: ChartNoAxesCombined,
    detail: 'Yield and growth forecasting',
  },
  {
    number: '04',
    title: 'Recommendation Engine',
    description:
      'Find opportunities aligned with your budget, investment goals, time horizon, and preferred level of risk.',
    icon: Sparkles,
    detail: 'Personalized opportunity ranking',
  },
];

export default function StatsSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="ai-engine"
      className="scroll-mt-28 border-y border-slate-200 bg-white py-24 lg:py-32"
    >
      <div className="mx-auto max-w-[1120px] px-5 sm:px-6 lg:px-8">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="mb-14 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end"
        >
          <div>
            <p className="mb-4 text-sm font-semibold text-[#5D18E9]">
              AI capabilities
            </p>
            <h2 className="max-w-xl text-3xl font-bold tracking-tight text-slate-900 lg:text-4xl">
              Better information at every step
            </h2>
          </div>
          <p className="max-w-xl leading-7 text-slate-600 lg:justify-self-end">
            Practical tools designed to make property research and investment
            decisions clearer—not more complicated.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: reduceMotion ? 0 : 0.09,
              },
            },
          }}
          className="grid auto-rows-fr gap-5 md:grid-cols-2"
        >
          {aiFeatures.map((feature) => {
            const Icon = feature.icon;

            return (
              <motion.article
                key={feature.title}
                variants={{
                  hidden: reduceMotion
                    ? { opacity: 1 }
                    : { opacity: 0, y: 24, scale: 0.985 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: {
                      duration: 0.55,
                      ease: [0.16, 1, 0.3, 1],
                    },
                  },
                }}
                whileHover={
                  reduceMotion
                    ? undefined
                    : {
                        y: -5,
                        transition: { duration: 0.22, ease: 'easeOut' },
                      }
                }
                className="group relative flex min-h-[300px] flex-col rounded-2xl border border-slate-200 bg-white p-7 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-[border-color,box-shadow] duration-300 hover:border-slate-300 hover:shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:p-8"
              >
                <div className="mb-10 flex items-start justify-between">
                  <span className="flex size-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-[#5D18E9] transition-colors duration-300 group-hover:border-[#5D18E9]/20 group-hover:bg-[#5D18E9]/[0.06]">
                    <Icon className="size-5" strokeWidth={1.7} />
                  </span>
                  <span className="font-mono text-xs text-slate-400">
                    {feature.number}
                  </span>
                </div>

                <h3 className="mb-3 text-xl font-semibold tracking-tight text-slate-900">
                  {feature.title}
                </h3>
                <p className="max-w-md text-sm leading-6 text-slate-600">
                  {feature.description}
                </p>

                <div className="mt-auto pt-8">
                  <div className="h-px bg-slate-100" />
                  <p className="pt-5 text-xs font-medium tracking-wide text-slate-500">
                    {feature.detail}
                  </p>
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
