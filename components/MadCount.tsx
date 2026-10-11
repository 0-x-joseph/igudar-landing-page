"use client";

import { CountUp } from "@/components/CountUp";
import { formatMad } from "@/lib/finance";

/** A dirham amount that counts up when first scrolled into view (server markup and reduced motion show the final figure). */
export function MadCount({ value, decimals = 0, className }: { value: number; decimals?: number; className?: string }) {
  return <CountUp value={value} format={(n) => formatMad(n, { decimals })} className={className} />;
}
