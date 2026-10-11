import AnimatedSection from "@/components/AnimatedSection";

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

/** A quiet, static strip of the programmes IGUDAR is part of. No marquee, no invented logos. */
export default function BackedBySection() {
  return (
    <section aria-labelledby="partners-title" className="px-5 py-20 sm:px-6 lg:py-24">
      <div className="mx-auto max-w-6xl">
        <AnimatedSection>
          <h2 id="partners-title" className="text-center text-sm font-semibold text-muted-foreground">
            Programmes &amp; partners
          </h2>
        </AnimatedSection>
        <ul className="mt-10 grid grid-cols-2 items-center gap-x-8 gap-y-10 sm:grid-cols-3 lg:grid-cols-6">
          {partners.map((p) => (
            <li key={p.src} className="flex h-14 items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.src}
                alt={p.alt}
                loading="lazy"
                className={`max-h-full w-auto max-w-full object-contain opacity-80 ${p.flatten ? "brightness-0" : ""}`}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
