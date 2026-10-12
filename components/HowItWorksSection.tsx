"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Building2, DoorClosed, ScrollText, ShieldCheck } from "lucide-react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";

import AnimatedSection from "@/components/AnimatedSection";
import DirhamPath from "@/components/DirhamPath";
import WalletIllustration from "@/components/WalletIllustration";
import { BuildingSketch, GranarySketch } from "@/components/brand";
import { Hover, Reveal } from "@/components/motion";
import { Link } from "@/i18n/navigation";

// Each idea is the approved text, split at its own sentence boundary: the story of the granary, then
// what it means in IGUDAR. The words live in `sections.howItWorks.pillars.<id>`; the ids match the
// regions of the granary sketch.
const pillars = [
  { id: "building", icon: Building2 },
  { id: "chamber", icon: DoorClosed },
  { id: "keeper", icon: ShieldCheck },
  { id: "rules", icon: ScrollText },
] as const;

/** How far (px) the sticky drawing drifts down while the four cards scroll past it on desktop. */
const DRIFT_PX = 72;

export default function HowItWorksSection() {
  const t = useTranslations("sections.howItWorks");
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();

  // The drawing is sticky on desktop. Rather than freezing in place, it eases a little further down the
  // longer the reader scrolls through the ideas, spring-smoothed so it feels like the rest of the section.
  const gridRef = useRef<HTMLDivElement>(null);
  // Progress runs over the pinned phase only: from the grid's top reaching the sticky offset (7rem, `lg:top-28`)
  // to its bottom reaching the viewport bottom, so the slide is visible while the ideas scroll past.
  const { scrollYProgress } = useScroll({ target: gridRef, offset: ["start 112px", "end end"] });
  const drift = useSpring(useTransform(scrollYProgress, [0, 1], [0, DRIFT_PX]), {
    stiffness: 80,
    damping: 22,
    mass: 0.7,
  });
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  const driftY = desktop && !reduce ? drift : 0;

  return (
    <section id="how-it-works" className="relative isolate overflow-clip scroll-mt-28 bg-surface-mist px-0 pb-12 pt-24 lg:pb-16 lg:pt-32">
      {/* Decoration only: placed in the free margins either side of the centred heading. */}
      <BuildingSketch variant="arch" className="absolute start-4 top-10 -z-10 hidden h-64 w-48 xl:block 2xl:start-16" />
      <BuildingSketch variant="agadir" className="absolute end-4 top-8 -z-10 hidden h-72 w-60 -scale-x-100 xl:block 2xl:end-16" />
      <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <p className="mb-3 text-sm font-semibold text-primary">{t("eyebrow")}</p>
            <h2 className="font-display text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {t("title")}
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{t("intro")}</p>
          </div>
        </AnimatedSection>

        <div
          ref={gridRef}
          className="grid grid-cols-[minmax(0,1fr)] items-start gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-12"
        >
          <Reveal className="lg:sticky lg:top-28 lg:self-start">
            {/* Portrait drawing: tall enough to stand beside the four ideas, capped so it stays inside the viewport while sticky. */}
            <motion.div data-granary-card="" style={{ y: driftY }} className="rounded-3xl border border-border bg-card p-4 sm:p-6">
              <GranarySketch
                active={active}
                onSelect={setActive}
                className="mx-auto max-w-md lg:max-w-none [&>svg]:lg:max-h-[calc(100vh-16rem)]"
              />
            </motion.div>
          </Reveal>

          <div>
            {/* Phones step through the four ideas; desktop reads them all and hovers. */}
            <div
              role="tablist"
              aria-label={t("tablist")}
              className="mb-4 flex gap-2 overflow-x-auto pb-1 lg:hidden"
            >
              {pillars.map((p, i) => (
                <button
                  key={p.id}
                  role="tab"
                  type="button"
                  aria-selected={active === i}
                  onClick={() => setActive(i)}
                  className={`min-h-11 shrink-0 cursor-pointer rounded-full border px-4 text-sm font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                    active === i
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:bg-muted"
                  }`}
                >
                  <span className="me-1.5 opacity-70">{i + 1}</span>
                  {t(`pillars.${p.id}.title`)}
                </button>
              ))}
            </div>

            <ul className="grid gap-4">
              {pillars.map(({ id, icon: Icon }, i) => (
                <li key={id} className={active === i ? "block" : "hidden lg:block"}>
                  <Reveal index={i}>
                    <Hover>
                      <article
                        tabIndex={0}
                        data-pillar={i}
                        data-active={active === i}
                        onMouseEnter={() => setActive(i)}
                        onFocus={() => setActive(i)}
                        className="relative rounded-3xl border border-border bg-card p-6 outline-none transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                      >
                        {active === i && (
                          <motion.span
                            layoutId="pillar-ring"
                            aria-hidden="true"
                            transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 32 }}
                            className="pointer-events-none absolute -inset-px rounded-3xl border-2 border-primary/60"
                          />
                        )}
                        <div className="flex items-start gap-4">
                          <span
                            data-pillar-icon=""
                            className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-accent text-primary"
                          >
                            <Icon className="size-6" strokeWidth={1.7} aria-hidden="true" />
                          </span>
                          <div>
                            <h3 className="text-lg font-bold text-foreground">
                              <span className="me-2 text-sm font-semibold text-primary">{i + 1}</span>
                              {t(`pillars.${id}.title`)}
                            </h3>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t(`pillars.${id}.story`)}</p>
                          </div>
                        </div>
                        <div data-in-igudar="" className="mt-4 rounded-2xl bg-accent/60 px-4 py-3">
                          <p className="text-xs font-bold uppercase tracking-wider text-primary">{t("inIgudar")}</p>
                          <p className="mt-1 text-sm leading-relaxed text-foreground">{t(`pillars.${id}.inIgudar`)}</p>
                        </div>
                      </article>
                    </Hover>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-24 grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <AnimatedSection>
            <h3 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {t("follow.title")}
            </h3>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{t("follow.body")}</p>
            <Link
              href="/simulator"
              className="mt-6 inline-flex min-h-12 items-center justify-center rounded-2xl border border-border bg-card px-6 text-base font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {t("follow.cta")}
            </Link>
          </AnimatedSection>
          <AnimatedSection delay={120}>
            <DirhamPath className="mb-5 px-2" />
            <WalletIllustration />
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
