"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import { ZelligePattern } from "./ZelligePattern";
import { cn } from "@/lib/utils";

function dynamicMask(): CSSProperties {
  const mask = "radial-gradient(circle 28rem at var(--mx, 50%) var(--my, 8rem), black, transparent 80%)";
  return { maskImage: mask, WebkitMaskImage: mask };
}

function staticMask(): CSSProperties {
  const mask = "radial-gradient(circle 28rem at 50% 8rem, black, transparent 80%)";
  return { maskImage: mask, WebkitMaskImage: mask };
}

// All mounted backgrounds share one pointer listener and one scheduled frame.
// Measure the layer itself: hero layers can be inset beyond their host, while
// tool-page backgrounds can be much taller than the viewport.
const layers = new Set<HTMLDivElement>();
let pointer: { x: number; y: number } | null = null;
let frame = 0;

function updateLayers() {
  frame = 0;
  for (const layer of layers) {
    if (!pointer) {
      layer.removeAttribute("data-active");
      continue;
    }
    const bounds = layer.getBoundingClientRect();
    const active = pointer.x >= bounds.left && pointer.x <= bounds.right &&
      pointer.y >= bounds.top && pointer.y <= bounds.bottom;
    layer.toggleAttribute("data-active", active);
    if (active) {
      layer.style.setProperty("--mx", `${pointer.x - bounds.left}px`);
      layer.style.setProperty("--my", `${pointer.y - bounds.top}px`);
    }
  }
}

function scheduleUpdate() {
  if (!frame) frame = requestAnimationFrame(updateLayers);
}

function onPointerMove(event: PointerEvent) {
  if (event.pointerType === "touch") return;
  pointer = { x: event.clientX, y: event.clientY };
  scheduleUpdate();
}

function clearPointer() {
  pointer = null;
  scheduleUpdate();
}

function registerLayer(layer: HTMLDivElement) {
  if (layers.size === 0) {
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", clearPointer);
    window.addEventListener("blur", clearPointer);
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate, { passive: true });
  }
  layers.add(layer);
  scheduleUpdate();
  return () => {
    layers.delete(layer);
    layer.removeAttribute("data-active");
    layer.style.removeProperty("--mx");
    layer.style.removeProperty("--my");
    if (layers.size === 0) {
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", clearPointer);
      window.removeEventListener("blur", clearPointer);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      cancelAnimationFrame(frame);
      frame = 0;
      pointer = null;
    }
  };
}

/**
 * Drop-in glow layer: an absolute zellige texture whose bright spot follows
 * the pointer across its surface without re-rendering. Place it inside a
 * positioned, isolated host; the negative z-index keeps content above it.
 *
 * Decorative only: `aria-hidden`, `pointer-events-none`, always masked, and
 * fully static under `prefers-reduced-motion`.
 */
export function ReactiveGlow({ className, size = 48 }: { className?: string; size?: number }) {
  const glowRef = useRef<HTMLDivElement | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const layer = glowRef.current;
    if (layer) return registerLayer(layer);
  }, [reduce]);

  return (
    <div
      ref={glowRef}
      aria-hidden="true"
      data-reactive-glow=""
      style={reduce ? staticMask() : dynamicMask()}
      className={cn(
        "reactive-glow pointer-events-none absolute -z-10 text-primary",
        className,
      )}
    >
      <ZelligePattern size={size} className="h-full w-full" />
    </div>
  );
}

/**
 * Panel container with a reactive zellige glow behind its content. Use to
 * frame calls to action while retaining the surrounding section palette.
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
