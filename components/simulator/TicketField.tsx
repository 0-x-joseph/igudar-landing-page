"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Minus, Plus } from "lucide-react";
import { LIMITS } from "@/lib/finance";
import { useFormat } from "@/lib/i18n/use-format";
import { clampTicket, parseAmount, stepTicket } from "@/lib/simulator";

/**
 * Amount input with minus and plus steppers. Never goes below the 25,000 MAD
 * minimum, snaps to the 5,000 step on blur or Enter. The field is free text so
 * "25 000", "25.000", "25,000" and Arabic-Indic digits all read as 25,000; the
 * settled value is shown with the language's own grouping.
 */
export function TicketField({
  id,
  label,
  value,
  onChange,
  max,
  className = "",
}: {
  id: string;
  label: string;
  value: number;
  onChange: (next: number) => void;
  /** Upper bound; defaults to the raise size (angels are not capped per project). */
  max?: number;
  className?: string;
}) {
  const t = useTranslations("simulator.ticket");
  const { mad, number } = useFormat();
  const [draft, setDraft] = useState<string | null>(null);
  const opts = { max };
  const step = mad(LIMITS.TICKET_STEP_MAD, { decimals: 0 });

  const commit = () => {
    if (draft === null) return;
    onChange(clampTicket(parseAmount(draft), opts));
    setDraft(null);
  };

  const stepButton =
    "flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-40";

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-foreground">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className={stepButton}
          aria-label={t("decrease", { step })}
          disabled={value <= LIMITS.MIN_TICKET_MAD}
          onClick={() => onChange(stepTicket(value, -1, opts))}
        >
          <Minus className="size-4" aria-hidden="true" />
        </button>
        <div className="relative min-w-0 flex-1">
          <input
            id={id}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={draft ?? number(value)}
            onChange={(e) => {
              setDraft(e.target.value);
              const n = parseAmount(e.target.value);
              if (Number.isFinite(n) && n >= LIMITS.MIN_TICKET_MAD) {
                onChange(clampTicket(n, opts));
              }
            }}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
            }}
            className="financial-number h-12 w-full rounded-2xl border border-border bg-card pe-16 ps-4 text-lg font-semibold text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground"
          >
            {t("currency")}
          </span>
        </div>
        <button
          type="button"
          className={stepButton}
          aria-label={t("increase", { step })}
          disabled={max !== undefined && value >= max}
          onClick={() => onChange(stepTicket(value, 1, opts))}
        >
          <Plus className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
