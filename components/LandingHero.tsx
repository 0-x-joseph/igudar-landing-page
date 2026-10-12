"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { LIMITS } from "@/lib/finance";
import { useFormat } from "@/lib/i18n/use-format";
import { ArchFrame, BuildingSketch, ReactiveGlow } from "@/components/brand";

// The closed-beta sign-up. Approval is manual and the money is demo money.
const BETA_URL = "https://app.igudar.tech/auth/register";

const ctaPrimary =
  "inline-flex min-h-12 items-center justify-center rounded-2xl bg-primary px-8 text-base font-semibold text-primary-foreground transition-colors duration-200 ease-out hover:bg-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
const ctaSecondary =
  "inline-flex min-h-12 items-center justify-center rounded-2xl border border-border bg-card px-8 text-base font-semibold text-foreground transition-colors duration-200 ease-out hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

export default function LandingHero() {
  const reduceMotion = useReducedMotion();
  const t = useTranslations("home.hero");
  const tc = useTranslations("common.cta");
  const { mad } = useFormat();

  return (
    <section className="relative isolate overflow-hidden bg-background px-5 pb-12 pt-32 sm:px-6 sm:pt-40 lg:pb-16">
      {/* Decoration only: light line drawings behind the visual and along the foot, never behind text. */}
      <BuildingSketch
        variant="riad"
        className="absolute inset-x-0 bottom-0 -z-10 mx-auto hidden h-10 w-[28rem] max-w-full min-[420px]:block"
      />
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-16">
        <div>
          {/* The zellige texture lives behind the headline only, never behind the body text below. Its glow follows the pointer. */}
          <div className="group relative">
            <ReactiveGlow className="absolute -inset-x-10 -inset-y-12 -z-10 h-[calc(100%+6rem)] w-[calc(100%+5rem)]" />
            <motion.h1
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="font-display text-[clamp(2.75rem,7.2vw,5.5rem)] font-semibold leading-[1.02] tracking-tight text-foreground"
            >
              {t.rich("title", {
                em: (chunks) => <span className="mt-1 block italic text-primary">{chunks}</span>,
              })}
            </motion.h1>
          </div>

          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
            className="mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl"
          >
            {t("subtitle", { min: mad(LIMITS.MIN_TICKET_MAD, { decimals: 0 }) })}
          </motion.p>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2, ease: "easeOut" }}
          >
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <a href={BETA_URL} className={ctaPrimary}>
                {tc("betaAccess")}
              </a>
              <a href="#waitlist-cta" className={ctaSecondary}>
                {tc("joinWaitlist")}
              </a>
            </div>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">{t("note")}</p>
          </motion.div>
        </div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
          className="relative mx-auto w-full max-w-xs sm:max-w-sm lg:max-w-none"
        >
          {/* A granary tower standing beside the arch frame, in the empty space under the body copy. */}
          <BuildingSketch
            variant="agadir"
            className="absolute -start-44 bottom-0 -z-10 hidden h-52 w-48 min-[420px]:block lg:-start-52 lg:h-64 lg:w-56"
          />
          <ArchFrame className="aspect-[4/5] w-full bg-accent">
            <Image
              src="/images/hero-bg.png"
              alt={t("imageAlt")}
              fill
              priority
              sizes="(min-width: 1024px) 380px, (min-width: 640px) 384px, 320px"
              className="object-cover object-[30%_35%]"
            />
          </ArchFrame>
        </motion.div>
      </div>
    </section>
  );
}
