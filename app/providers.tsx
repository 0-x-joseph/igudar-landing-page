"use client";

import { HeroUIProvider } from "@heroui/system";
import { MotionConfig } from "framer-motion";

export function Providers({children}: { children: React.ReactNode }) {
  return (
    <HeroUIProvider>
      {/* "user" turns transform and layout animations off when the visitor prefers reduced motion. */}
      <MotionConfig reducedMotion="user">
        {children}
      </MotionConfig>
    </HeroUIProvider>
  )
}
