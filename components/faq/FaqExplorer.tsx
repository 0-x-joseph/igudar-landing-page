"use client";

import { Fragment, useId, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, Search, X } from "lucide-react";

import { MOTION, Reveal } from "@/components/motion";

export interface FaqEntry {
  question: string;
  answer: string;
  category: string;
}

const ALL = "All";

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Wraps every occurrence of `query` (plain text, any case) in <mark>. */
function highlight(text: string, query: string): ReactNode {
  if (!query) return text;
  const parts = text.split(new RegExp(`(${escapeRegExp(query)})`, "gi"));
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <mark key={i} className="rounded bg-highlight/40 px-0.5 text-inherit">
        {part}
      </mark>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

/**
 * Category rail (sticky on desktop, chip row on phones), live search with highlighted matches and an
 * accordion whose height eases open. Filtering is client-side over the questions and their answers.
 */
export default function FaqExplorer({ faqs, categories, children }: { faqs: FaqEntry[]; categories: string[]; children?: ReactNode }) {
  const reduce = useReducedMotion();
  const uid = useId();
  const [category, setCategory] = useState(ALL);
  const [query, setQuery] = useState("");
  // An explicit open/close from the visitor wins; otherwise an answer that contains the search opens itself.
  const [open, setOpen] = useState<Map<number, boolean>>(new Map());

  const q = query.trim();
  const needle = q.toLowerCase();

  const matches = faqs.map((f) => ({
    inQuestion: !needle || f.question.toLowerCase().includes(needle),
    inAnswer: !!needle && f.answer.toLowerCase().includes(needle),
  }));
  const matchesQuery = (i: number) => !needle || matches[i].inQuestion || matches[i].inAnswer;

  // Counts in the rail follow the search, so a category never promises more than it will show.
  const counts = new Map<string, number>([[ALL, 0]]);
  for (const c of categories) counts.set(c, 0);
  faqs.forEach((f, i) => {
    if (!matchesQuery(i)) return;
    counts.set(ALL, (counts.get(ALL) ?? 0) + 1);
    counts.set(f.category, (counts.get(f.category) ?? 0) + 1);
  });

  const visible = faqs
    .map((f, i) => ({ f, i }))
    .filter(({ f, i }) => (category === ALL || f.category === category) && matchesQuery(i));

  const isExpanded = (i: number) => open.get(i) ?? matches[i].inAnswer;
  const toggle = (i: number) => setOpen((prev) => new Map(prev).set(i, !isExpanded(i)));

  const tabs = [ALL, ...categories];
  const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12">
      <nav aria-label="Question categories" className="lg:sticky lg:top-28 lg:self-start">
        <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0 lg:pb-0">
          {tabs.map((c) => {
            const on = category === c;
            return (
              <li key={c} className="shrink-0">
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => setCategory(c)}
                  className={`relative flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 rounded-full border px-4 text-sm font-semibold transition-colors duration-200 lg:rounded-2xl lg:border-transparent ${focusRing} ${
                    on
                      ? "border-primary bg-primary text-primary-foreground lg:bg-accent lg:text-accent-foreground"
                      : "border-border bg-card text-foreground hover:bg-muted lg:bg-transparent"
                  }`}
                >
                  <span className="whitespace-nowrap">{c}</span>
                  <span
                    data-count=""
                    className={`financial-number rounded-full px-2 py-0.5 text-xs ${
                      on ? "bg-white/20 lg:bg-primary lg:text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {counts.get(c) ?? 0}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            type="search"
            role="searchbox"
            aria-label="Search the questions"
            placeholder="Search the questions"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(new Map());
            }}
            className={`min-h-12 w-full rounded-2xl border border-border bg-card pl-12 pr-12 text-base text-foreground placeholder:text-muted-foreground ${focusRing}`}
          />
          {query && (
            <button
              type="button"
              aria-label="Clear the search"
              onClick={() => {
                setQuery("");
                setOpen(new Map());
              }}
              className={`absolute right-2 top-1/2 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-xl text-muted-foreground hover:bg-muted ${focusRing}`}
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          )}
        </div>
        <p role="status" aria-live="polite" className="mt-3 text-sm text-muted-foreground">
          {visible.length === 0
            ? `No question matches “${q}”. Try another word, or clear the search.`
            : `${visible.length} of ${faqs.length} questions`}
        </p>

        <ul className="mt-4 space-y-3">
          {visible.map(({ f, i }, n) => {
            const expanded = isExpanded(i);
            const panelId = `${uid}-panel-${i}`;
            return (
              <Reveal as="li" key={f.question} index={Math.min(n, 5)}>
                <div
                  data-faq-item=""
                  className={`overflow-hidden rounded-2xl border bg-card transition-colors duration-200 ${
                    expanded ? "border-primary/30" : "border-border hover:border-primary/20"
                  }`}
                >
                  <h3>
                    <button
                      type="button"
                      aria-expanded={expanded}
                      aria-controls={panelId}
                      onClick={() => toggle(i)}
                      className={`flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-5 text-left transition-colors duration-200 hover:bg-muted/50 sm:px-6 ${focusRing} focus-visible:-outline-offset-2`}
                    >
                      <span className="text-[15px] font-semibold text-foreground">{highlight(f.question, q)}</span>
                      <span
                        className={`flex size-8 shrink-0 items-center justify-center rounded-xl transition-colors duration-200 ${
                          expanded ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <motion.span
                          animate={{ rotate: expanded ? 180 : 0 }}
                          transition={reduce ? { duration: 0 } : { duration: MOTION.durationS, ease: MOTION.ease }}
                          className="flex"
                        >
                          <ChevronDown className="size-4" aria-hidden="true" />
                        </motion.span>
                      </span>
                    </button>
                  </h3>
                  <AnimatePresence initial={false}>
                    {expanded && (
                      <motion.div
                        id={panelId}
                        key="panel"
                        initial={reduce ? false : { height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { height: 0, opacity: 0 }}
                        transition={reduce ? { duration: 0 } : { duration: MOTION.durationS, ease: MOTION.ease }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 sm:px-6">
                          <div className="border-t border-border pt-4">
                            <p className="text-[15px] leading-relaxed text-muted-foreground">{highlight(f.answer, q)}</p>
                            <p className="mt-3 text-xs font-semibold text-primary">{f.category}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </ul>

        {children}
      </div>
    </div>
  );
}
