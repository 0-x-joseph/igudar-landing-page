import { useTranslations } from "next-intl";
import { Info } from "lucide-react";

/**
 * Mandatory pre-licence notice for every page that shows numbers (finance spec section 6).
 * Reads `common.notice.indicative`; works in server and client trees alike.
 */
export function IndicativeNotice({ className = "" }: { className?: string }) {
  const t = useTranslations("common");
  const ts = useTranslations("simulator.notice");
  return (
    <aside
      role="note"
      aria-label={ts("label")}
      className={`flex items-start gap-3 rounded-2xl border border-border bg-card px-4 py-3 ${className}`}
    >
      <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <p className="text-xs leading-relaxed text-muted-foreground">{t("notice.indicative")}</p>
    </aside>
  );
}
