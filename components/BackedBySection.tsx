"use client";

import { useState } from "react";
import { Pause, Play } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import { ReactiveGlow } from "@/components/brand";

// Only programmes and partners that are real. Do not add a logo here without written permission to use it.
const partners = [
  { src: "/images/um6p.png", alt: "UM6P" },
  { src: "/images/mit-sandbox.png", alt: "MIT Sandbox" },
  { src: "/images/explorer.png", alt: "Explorer" },
  { src: "/images/fondation-ocp.svg", alt: "Fondation OCP" },
  { src: "/images/um6p-launchpad.png", alt: "UM6P Launchpad" },
  // The source file is white on transparent: flattened to ink so it shows on sand.
  { src: "/images/coe-white.png", alt: "Programme partner logo", flatten: true },
];

/** A slow, seamless loop of the programmes IGUDAR is part of. */
export default function BackedBySection() {
  const [paused, setPaused] = useState(false);
  return (
    <section aria-labelledby="partners-title" className="relative isolate px-5 py-20 sm:px-6 lg:py-24">
      <ReactiveGlow className="inset-0" />
      <div className="mx-auto max-w-6xl">
        <AnimatedSection>
          <h2 id="partners-title" className="text-center text-sm font-semibold text-muted-foreground">
            Programmes &amp; partners
          </h2>
        </AnimatedSection>
        <div className="partner-marquee mt-10" data-paused={paused}>
          <div className="partner-marquee-window overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
            <div className="partner-marquee-track">
              {[false, true].map((duplicate) => (
                <ul key={String(duplicate)} aria-hidden={duplicate || undefined} className="partner-marquee-group">
                  {partners.map((p) => (
                    <li key={p.src} className="partner-marquee-logo flex h-14 items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.src}
                        alt={duplicate ? "" : p.alt}
                        loading="lazy"
                        className={`max-h-full w-auto max-w-full object-contain opacity-80 ${p.flatten ? "brightness-0" : ""}`}
                      />
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
          <div className="mt-4 flex justify-center motion-reduce:hidden">
            <button
              type="button"
              onClick={() => setPaused((value) => !value)}
              aria-label={paused ? "Resume partner logo animation" : "Pause partner logo animation"}
              className="flex size-11 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {paused ? <Play className="size-4" aria-hidden="true" /> : <Pause className="size-4" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
