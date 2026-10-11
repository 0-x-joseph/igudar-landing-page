"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import { ZelligePattern } from "./ZelligePattern";
import { cn } from "@/lib/utils";

function dynamicMask(): CSSProperties {
  const mask = "radial-gradient(circle 22rem at var(--mx, 50%) var(--my, 0%), black, transparent 72%)";
  return { maskImage: mask, WebkitMaskImage: mask };
}

function staticMask(): CSSProperties {
  const mask = "radial-gradient(circle 22rem at 50% 0%, black, transparent 72%)";
  return { maskImage: mask, WebkitMaskImage: mask };
}

/**
 * Drop-in glow layer: an absolute zellige texture whose bright spot follows
 * the pointer across its parent container (the parent sets `--mx`/`--my`
 * through this layer's listener, so hovering never re-renders). The parent
 * must carry the `group` class for the hover/focus brightening to apply.
 *
 * Decorative only: `aria-hidden`, `pointer-events-none`, always masked, and
 * fully static under `prefers-reduced-motion`.
 */
export function ReactiveGlow({ className, size = 48 }: { className?: string; size?: number }) {
  const glowRef = useRef<HTMLDivElement | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const host = glowRef.current?.parentElement;
    if (!host) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        host.style.setProperty("--mx", `${x.toFixed(1)}%`);
        host.style.setProperty("--my", `${y.toFixed(1)}%`);
      });
    };
    host.addEventListener("pointermove", onMove);
    return () => {
      host.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [reduce]);

  return (
    <div
      ref={glowRef}
      aria-hidden="true"
      data-reactive-glow=""
      style={reduce ? staticMask() : dynamicMask()}
      className={cn(
        "pointer-events-none absolute text-primary transition-opacity duration-300",
        "opacity-[0.07] group-hover:opacity-[0.14] group-focus-within:opacity-[0.14]",
        className,
      )}
    >
      <ZelligePattern size={size} className="h-full w-full" />
    </div>
  );
}

/**
 * Panel container with a reactive zellige glow behind its content. Use to
 * alternate patterned sections against plain dark ones.
 */
export function ReactivePattern({
  children,
  className,
  size = 48,
}: {
  children: ReactNode;
  className?: string;
  size?: number;
}) {
  return (
    <div data-reactive-pattern="" className={cn("group relative isolate overflow-hidden", className)}>
      <ReactiveGlow size={size} className="inset-0" />
      <div className="relative">{children}</div>
    </div>
  );
}
