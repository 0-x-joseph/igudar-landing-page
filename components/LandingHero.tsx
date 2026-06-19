"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import WaitlistForm from "@/components/WaitlistForm";

const wealthTerms = ["estate", "trust", "transparency"];

const cards = [
  {
    title: "Agdal Residence",
    city: "Rabat, Morocco",
    image: "/images/hero-bg.png",
    return: "+10.4%",
  },
  {
    title: "Marina Apartment",
    city: "Casablanca, Morocco",
    image: "/images/hero-bg.png",
    return: "+8.7%",
  },
  {
    title: "Palm Urban Fund",
    city: "Marrakech, Morocco",
    image: "/images/hero-bg.png",
    return: "+12.1%",
  },
];

export default function LandingHero() {
  const [activeTerm, setActiveTerm] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;

    const interval = window.setInterval(() => {
      setActiveTerm((current) => (current + 1) % wealthTerms.length);
    }, 2400);

    return () => window.clearInterval(interval);
  }, [reduceMotion]);

  return (
    <section className="relative isolate overflow-hidden bg-[#F7F5EF] px-4 pt-28 pb-20 sm:px-6 sm:pt-32 lg:pb-28">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(93,24,233,0.14),transparent_35%),linear-gradient(180deg,#F7F5EF_0%,#FFFFFF_70%)]" />

      <div className="mx-auto max-w-7xl">
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.08 }}
          className="mx-auto mt-7 max-w-5xl text-center text-[clamp(3rem,8vw,7rem)] font-black leading-[0.88] tracking-[-0.07em] text-slate-950"
        >
          Build your wealth through real 
          <span className="relative mx-auto mt-2 block h-[0.95em] w-full overflow-hidden text-[#5D18E9]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={wealthTerms[activeTerm]}
                initial={reduceMotion ? false : { opacity: 0, y: "70%" }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: "-70%" }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 flex items-center justify-center"
              >
                {wealthTerms[activeTerm]}
              </motion.span>
            </AnimatePresence>
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.16 }}
          className="mx-auto mt-6 max-w-2xl text-center text-lg leading-relaxed text-slate-600 sm:text-xl"
        >
          Join future investors building passive income from vetted Moroccan
          properties, starting from just 1,000 MAD.
        </motion.p>

        {/* <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.22 }}
          className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Link
            href="#waitlist"
            className="rounded-full bg-[#5D18E9] px-7 py-4 text-sm font-bold text-white shadow-xl shadow-[#5D18E9]/25 transition hover:bg-[#4A13BA]"
          >
            Join the waitlist
          </Link>

          <Link
            href="#how-it-works"
            className="rounded-full border border-slate-300 bg-white px-7 py-4 text-sm font-bold text-slate-800 shadow-sm transition hover:bg-slate-50"
          >
            See how it works
          </Link>
        </motion.div> */}

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.28 }}
          className="mx-auto mt-8 max-w-md"
        >
      <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
  <button
    className="
      group relative overflow-hidden
      rounded-2xl bg-[#5D18E9]
      px-8 py-4
      text-base font-semibold text-white
      shadow-[0_10px_40px_rgba(93,24,233,0.35)]
      transition-all duration-300
      hover:-translate-y-1
      hover:shadow-[0_20px_60px_rgba(93,24,233,0.5)]
      active:translate-y-0
    "
		type="button"
		onClick={() => {
		  window.location.href = "https://app.igudar.tech/auth/login";
		}}
  >
    <span className="relative z-10">
      Access MVP
    </span>

    <div
      className="
        absolute inset-0
        bg-gradient-to-r
        from-[#6D28FF]
        via-[#7C3AED]
        to-[#5D18E9]
        opacity-0
        transition-opacity duration-300
        group-hover:opacity-100
      "
    />
  </button>

  <button
    type="button"
    onClick={() => {
      document
        .getElementById("waitlist-cta")
        ?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    }}
    className="
      rounded-2xl
      border border-slate-200
      bg-white/70
      backdrop-blur-xl
      px-8 py-4
      text-base font-semibold text-slate-900
      transition-all duration-300
      hover:-translate-y-1
      hover:border-[#5D18E9]/40
      hover:bg-white
      hover:shadow-xl
    "
  >
    Join Waitlist
  </button>
</div>
          {/* <WaitlistForm /> */}
        </motion.div>

        {/* <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.34 }}
          className="relative mt-16"
        >
          <div className="absolute left-1/2 top-10 -z-10 h-72 w-[85%] -translate-x-1/2 rounded-full bg-[#5D18E9]/20 blur-3xl" />

          <div className="grid gap-5 md:grid-cols-3">
            {cards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 40, rotate: 0 }}
                animate={{
                  opacity: 1,
                  y: index === 1 ? -20 : 0,
                  rotate: index === 0 ? -3 : index === 2 ? 3 : 0,
                }}
                transition={{ duration: 0.7, delay: 0.42 + index * 0.08 }}
                className="overflow-hidden rounded-[2rem] border border-white bg-white p-3 shadow-[0_30px_80px_rgba(15,23,42,0.12)]"
              >
                <div className="relative h-[270px] overflow-hidden rounded-[1.5rem]">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="h-full w-full object-cover"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                  <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-slate-900 backdrop-blur">
                    {card.return}
                  </div>

                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-black text-white">
                      {card.title}
                    </h3>
                    <p className="text-sm text-white/80">{card.city}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 p-3">
                  <div>
                    <p className="text-xs text-slate-500">Entry</p>
                    <p className="text-sm font-bold text-slate-900">1,000 MAD</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Type</p>
                    <p className="text-sm font-bold text-slate-900">Halal</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Screening</p>
                    <p className="text-sm font-bold text-slate-900">AI</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div> */}
      </div>
    </section>
  );
}
