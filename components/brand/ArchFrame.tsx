import type { ReactNode } from "react";
import { useId } from "react";
import { cn } from "@/lib/utils";

export interface ArchFrameProps {
  children: ReactNode;
  className?: string;
  variant?: "pointed" | "horseshoe";
}

// Paths in objectBoundingBox units (0..1) so the arch scales with its box.
const PATHS = {
  pointed: "M0,1 L0,0.46 C0,0.24 0.3,0.08 0.5,0 C0.7,0.08 1,0.24 1,0.46 L1,1 Z",
  horseshoe:
    "M0.12,1 L0.12,0.74 C0.02,0.68 0,0.38 0.12,0.22 C0.22,0.09 0.38,0.03 0.5,0 C0.62,0.03 0.78,0.09 0.88,0.22 C1,0.38 0.98,0.68 0.88,0.74 L0.88,1 Z",
} as const;

/**
 * Pointed / horseshoe arch mask for an image or any child.
 * Brand rule: use in MAX TWO places (property detail hero, onboarding welcome illustration;
 * optionally the profile avatar). Not on every card.
 * Note: the clip-path clips everything outside the arch, including focus rings and shadows of
 * children near the edge; do not put interactive elements at the border.
 * Give the frame a size via className (e.g. `aspect-[4/5] w-full`).
 */
export function ArchFrame({ children, className, variant = "pointed" }: ArchFrameProps) {
  const id = `arch-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  return (
    <div className={cn("relative overflow-hidden", className)} style={{ clipPath: `url(#${id})` }}>
      <svg aria-hidden="true" focusable="false" width="0" height="0" className="absolute">
        <defs>
          <clipPath id={id} clipPathUnits="objectBoundingBox">
            <path d={PATHS[variant]} />
          </clipPath>
        </defs>
      </svg>
      {children}
    </div>
  );
}
