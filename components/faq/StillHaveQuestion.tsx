"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import WaitlistModal from "@/components/WaitlistModal";
import { BuildingSketch } from "@/components/brand";
import { Hover, Reveal } from "@/components/motion";

// The closed-beta sign-up. Approval is manual.
const BETA_URL = "https://app.igudar.tech/auth/register";

/** End of the FAQ: the two approved ways forward, nothing else. */
export default function StillHaveQuestion() {
  const t = useTranslations("faq.still");
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  return (
    <Reveal className="mt-10">
      <Hover>
        <div className="relative isolate overflow-hidden rounded-3xl border border-border bg-surface-mist px-6 py-10 text-center sm:px-10">
          {/* Decoration only, kept to the card's side margins. */}
          <BuildingSketch variant="arch" className="absolute -start-8 bottom-0 -z-10 hidden h-44 w-28 sm:block" />
          <BuildingSketch variant="arch" className="absolute -end-8 bottom-0 -z-10 hidden h-44 w-28 -scale-x-100 sm:block" />
          <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-muted-foreground">{t("lead")}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <a
              href={BETA_URL}
              data-track="faq_beta_access"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-primary px-8 text-base font-semibold text-primary-foreground transition-colors duration-200 ease-out hover:bg-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:w-auto"
            >
              {t("applyBeta")}
            </a>
            <button
              type="button"
              data-track="faq_waitlist"
              onClick={() => setWaitlistOpen(true)}
              className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center rounded-2xl border border-border bg-card px-8 text-base font-semibold text-foreground transition-colors duration-200 ease-out hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:w-auto"
            >
              {t("joinWaitlist")}
            </button>
          </div>
        </div>
      </Hover>
      <WaitlistModal isOpen={waitlistOpen} onClose={() => setWaitlistOpen(false)} />
    </Reveal>
  );
}
