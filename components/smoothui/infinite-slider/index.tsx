"use client";

import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
} from "motion/react";
import { useEffect, useState } from "react";
import useMeasure from "react-use-measure";

export interface InfiniteSliderProps {
  children: React.ReactNode;
  className?: string;
  direction?: "horizontal" | "vertical";
  gap?: number;
  reverse?: boolean;
  speed?: number;
  speedOnHover?: number;
}

export default function InfiniteSlider({
  children,
  gap = 16,
  speed = 100,
  speedOnHover,
  direction = "horizontal",
  reverse = false,
  className,
}: InfiniteSliderProps) {
  const [currentSpeed, setCurrentSpeed] = useState(speed);
  const [ref, { width, height }] = useMeasure();
  const translation = useMotionValue(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const size = direction === "horizontal" ? width : height;
    if (shouldReduceMotion || size === 0) {
      return;
    }

    // With 3 sets of children {children}{children}{children}
    // and 2 gaps in between, the total width is 3*W_set + 2*gap.
    // However, useMeasure on the flex container with gap property returns:
    // width = (3 * childrenWidth) + (2 * gap)
    // To loop perfectly, we travel exactly one set + one gap: (childrenWidth + gap)
    const contentSize = (size + gap) / 3;
    
    const from = reverse ? -contentSize : 0;
    const to = reverse ? 0 : -contentSize;

    const duration = contentSize / currentSpeed;

    const controls = animate(translation, [from, to], {
      ease: "linear",
      duration,
      repeat: Number.POSITIVE_INFINITY,
      repeatType: "loop",
      repeatDelay: 0,
      onRepeat: () => {
        translation.set(from);
      }
    });

    return controls.stop;
  }, [
    translation,
    currentSpeed,
    width,
    height,
    gap,
    direction,
    reverse,
    shouldReduceMotion,
  ]);

  const hoverProps = speedOnHover
    ? {
        onHoverStart: () => setCurrentSpeed(speedOnHover),
        onHoverEnd: () => setCurrentSpeed(speed),
      }
    : {};

  return (
    <div className={`overflow-hidden ${className || ""}`}>
      <motion.div
        className="flex w-max whitespace-nowrap"
        ref={ref}
        style={{
          ...(direction === "horizontal"
            ? { x: translation }
            : { y: translation }),
          gap: `${gap}px`,
          flexDirection: direction === "horizontal" ? "row" : "column",
        }}
        {...hoverProps}
      >
        {children}
        {children}
        {children}
      </motion.div>
    </div>
  );
}
