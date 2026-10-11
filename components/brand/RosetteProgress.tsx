import { useId } from "react";
import { cn } from "@/lib/utils";

export interface RosetteProgressProps {
  /** Number of petals / steps. Default 8, clamped to 3..12. */
  steps?: number;
  /** Completed steps. Clamped to [0, steps]. */
  completed: number;
  /** Visible label. Defaults to "Step {completed} of {steps}". */
  label?: string;
  size?: number;
  className?: string;
}

const PETAL = "M50 48 C39 37 40 18 50 6 C60 18 61 37 50 48 Z";
const SAFFRON = "var(--color-highlight)";

/** 8-petal zellige rosette. Each completed step fills one petal; the centre turns saffron when all are done. */
export function RosetteProgress({ steps = 8, completed, label, size = 96, className }: RosetteProgressProps) {
  const labelId = useId();
  const total = Math.min(12, Math.max(3, Math.floor(Number.isFinite(steps) ? steps : 8)));
  const done = Math.min(total, Math.max(0, Math.floor(Number.isFinite(completed) ? completed : 0)));
  const isComplete = done === total;
  const text = label ?? `Step ${done} of ${total}`;
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={done}
      aria-valuetext={text}
      aria-labelledby={labelId}
      className={cn("inline-flex flex-col items-center gap-2", className)}
    >
      <svg aria-hidden="true" focusable="false" viewBox="0 0 100 100" width={size} height={size}>
        {Array.from({ length: total }, (_, i) => {
          const filled = i < done;
          return (
            <path
              key={i}
              d={PETAL}
              data-petal=""
              data-filled={filled ? "true" : "false"}
              transform={`rotate(${(360 / total) * i} 50 50)`}
              fill="currentColor"
              fillOpacity={filled ? 1 : 0}
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinejoin="round"
              className={cn(
                "transition-[fill-opacity,color] duration-300 ease-out motion-reduce:transition-none",
                filled ? "text-primary" : "text-border",
              )}
            />
          );
        })}
        <circle
          data-centre=""
          data-complete={isComplete ? "true" : "false"}
          cx={50}
          cy={50}
          r={7}
          fill="currentColor"
          style={isComplete ? { fill: SAFFRON } : undefined}
          className={cn(
            "transition-colors duration-300 ease-out motion-reduce:transition-none",
            !isComplete && "text-border",
          )}
        />
      </svg>
      <span id={labelId} className="text-sm text-muted-foreground">{text}</span>
    </div>
  );
}
