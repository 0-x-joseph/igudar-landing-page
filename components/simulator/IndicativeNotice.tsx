import { Info } from "lucide-react";
import { INDICATIVE_NOTICE } from "@/lib/finance";

/** Mandatory pre-licence notice for every page that shows numbers (finance spec section 6). */
export function IndicativeNotice({ className = "" }: { className?: string }) {
  return (
    <aside
      role="note"
      aria-label="Important notice"
      className={`flex items-start gap-3 rounded-2xl border border-border bg-card px-4 py-3 ${className}`}
    >
      <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <p className="text-xs leading-relaxed text-muted-foreground">{INDICATIVE_NOTICE}</p>
    </aside>
  );
}
