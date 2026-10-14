"use client";

import { useTranslations } from "next-intl";
import AnimatedSection from "@/components/AnimatedSection";

// Only programmes and partners that are real. Do not add a logo here without written permission to use it.
// Every logo sits on a white plate. Per file (checked on the pixels):
// - um6p.png, explorer.png: opaque white background, so mix-blend-multiply makes the white vanish on the plate.
// - mit-sandbox.png: transparent and coloured, shown as is.
// - um6p-launchpad.png, coe-white.png: white on transparent (invisible on white), flattened to ink with brightness-0.
// - fondation-ocp.svg: coloured vector, shown as is.
// zoom: the square PNGs carry a lot of empty canvas, so each is scaled up (from its measured content box) to read at a
// similar size inside the plate; the plate clips the empty margin.
// alt: proper names stay as they are in every language; a logo without a public name reads home.partners.genericLogoAlt.
const partners = [
  { src: "/images/um6p.png", alt: "UM6P", tone: "multiply", zoom: 1.7 },
  { src: "/images/mit-sandbox.png", alt: "MIT Sandbox", tone: "plain", zoom: 1.3 },
  { src: "/images/explorer.png", alt: "Explorer", tone: "multiply", zoom: 1 },
  { src: "/images/fondation-ocp.svg", alt: "Fondation OCP", tone: "plain", zoom: 1 },
  { src: "/images/um6p-launchpad.png", alt: "UM6P Launchpad", tone: "ink", zoom: 1.6 },
  { src: "/images/coe-white.png", alt: null, tone: "ink", zoom: 2 },
] as const;

const TONE = {
  multiply: "mix-blend-multiply",
  plain: "",
  ink: "brightness-0",
} as const;

function LogoSet({ id, hidden }: { id: "a" | "b"; hidden?: boolean }) {
  const t = useTranslations("home.partners");
  return (
    <ul
      data-marquee-set={id}
      aria-hidden={hidden ? true : undefined}
      className="marquee-set flex flex-row flex-nowrap shrink-0 items-center gap-4 pe-4"
    >
      {partners.map((p) => (
        <li
          key={p.src}
          className="flex h-24 w-48 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-white p-2"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={p.src}
            alt={hidden ? "" : (p.alt ?? t("genericLogoAlt"))}
            loading="eager"
            decoding="async"
            style={p.zoom === 1 ? undefined : { transform: `scale(${p.zoom})` }}
            className={`h-full w-full object-contain ${TONE[p.tone]}`.trim()}
          />
        </li>
      ))}
    </ul>
  );
}

/** A gap-free loop of the six real partner logos. Hover or keyboard focus pauses
 * the strip without a separate control; reduced motion keeps a swipeable row. */
export default function BackedBySection() {
  const t = useTranslations("home.partners");

  return (
    <section aria-labelledby="partners-title" className="px-5 py-20 sm:px-6 lg:py-24">
      <div className="mx-auto max-w-6xl">
        <AnimatedSection>
          <h2 id="partners-title" className="text-center text-sm font-semibold text-muted-foreground">
            {t("title")}
          </h2>
        </AnimatedSection>
        <div
          role="region"
          aria-label={t("region")}
          tabIndex={0}
          dir="ltr"
          className="marquee-window relative mt-10 overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
        >
          <div
            data-marquee-track=""
            className="marquee-track flex flex-row flex-nowrap w-max"
          >
            <LogoSet id="a" />
            <LogoSet id="b" hidden />
          </div>
        </div>
      </div>
    </section>
  );
}
