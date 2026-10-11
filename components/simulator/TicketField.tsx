"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { LIMITS } from "@/lib/finance";
import { clampTicket, stepTicket } from "@/lib/simulator";

/**
 * Amount input with minus and plus steppers. Never goes below the 25,000 MAD
 * minimum, snaps to the 5,000 step on blur or Enter.
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
  const [draft, setDraft] = useState<string | null>(null);
  const opts = { max };

  const commit = () => {
    if (draft === null) return;
    onChange(clampTicket(draft.trim() === "" ? Number.NaN : Number(draft), opts));
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
          aria-label={`Decrease amount by ${LIMITS.TICKET_STEP_MAD.toLocaleString("en-US")} MAD`}
          disabled={value <= LIMITS.MIN_TICKET_MAD}
          onClick={() => onChange(stepTicket(value, -1, opts))}
        >
          <Minus className="size-4" aria-hidden="true" />
        </button>
        <div className="relative min-w-0 flex-1">
          <input
            id={id}
            type="number"
            inputMode="numeric"
            min={LIMITS.MIN_TICKET_MAD}
            step={LIMITS.TICKET_STEP_MAD}
            value={draft ?? String(value)}
            onChange={(e) => {
              setDraft(e.target.value);
              const n = Number(e.target.value);
              if (e.target.value.trim() !== "" && Number.isFinite(n) && n >= LIMITS.MIN_TICKET_MAD) {
                onChange(clampTicket(n, opts));
              }
            }}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
            }}
            className="financial-number h-12 w-full rounded-2xl border border-border bg-card pl-4 pr-16 text-lg font-semibold text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground"
          >
            MAD
          </span>
        </div>
        <button
          type="button"
          className={stepButton}
          aria-label={`Increase amount by ${LIMITS.TICKET_STEP_MAD.toLocaleString("en-US")} MAD`}
          disabled={max !== undefined && value >= max}
          onClick={() => onChange(stepTicket(value, 1, opts))}
        >
          <Plus className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
