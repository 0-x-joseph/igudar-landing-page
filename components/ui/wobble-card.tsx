"use client";

import type { MouseEvent, ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";

import { cn } from "@/lib/utils";

interface WobbleCardProps {
  children: ReactNode;
  containerClassName?: string;
  className?: string;
}

export function WobbleCard({
  children,
  containerClassName,
  className,
}: WobbleCardProps) {
  const reduceMotion = useReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const x = useSpring(pointerX, { stiffness: 180, damping: 20 });
  const y = useSpring(pointerY, { stiffness: 180, damping: 20 });
  const contentX = useTransform(x, (value) => value * -0.45);
  const contentY = useTransform(y, (value) => value * -0.45);

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    if (reduceMotion) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set(((event.clientX - bounds.left) / bounds.width - 0.5) * 18);
    pointerY.set(((event.clientY - bounds.top) / bounds.height - 0.5) * 18);
  }

  function resetPosition() {
    pointerX.set(0);
    pointerY.set(0);
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={resetPosition}
      style={reduceMotion ? undefined : { x, y }}
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-slate-950",
        containerClassName,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.18),transparent_35%)] opacity-70" />
      <motion.div
        style={reduceMotion ? undefined : { x: contentX, y: contentY }}
        className={cn("relative h-full p-7 sm:p-9", className)}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
