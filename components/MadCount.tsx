"use client";

import { CountUp } from "@/components/CountUp";
import { useFormat } from "@/lib/i18n/use-format";

/** A dirham amount that counts up when first scrolled into view (server markup and reduced motion show the final figure). Grouping and the currency word follow the page language. */
export function MadCount({ value, decimals = 0, className }: { value: number; decimals?: number; className?: string }) {
  const { mad } = useFormat();
  return <CountUp value={value} format={(n) => mad(n, { decimals })} className={className} />;
}
