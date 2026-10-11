/**
 * Locale-aware display formatting. `lib/finance/format.ts` is shared with the platform and stays
 * en-US; this module gives each language its own grouping, decimal mark and currency word while
 * keeping the same rules (never NaN, "-0.0" shown as zero, non-breaking spaces).
 */
import { LOCALE_META, type Locale } from "@/i18n/routing";

const NBSP = " ";
const EM_DASH = "—";

/** The currency word that follows an amount. Moroccan French keeps "MAD"; Arabic reads "درهم". */
const CURRENCY_WORD: Record<Locale, string> = { en: "MAD", fr: "MAD", ar: "درهم" };

const cache = new Map<string, Intl.NumberFormat>();

function numberFormat(locale: Locale, decimals: number, compact: boolean): Intl.NumberFormat {
  const key = `${locale}:${decimals}:${compact}`;
  let formatter = cache.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(LOCALE_META[locale].intl, {
      minimumFractionDigits: compact ? 0 : decimals,
      maximumFractionDigits: decimals,
      notation: compact ? "compact" : "standard",
      // Western digits everywhere: Moroccan Arabic uses 0-9.
      numberingSystem: "latn",
    });
    cache.set(key, formatter);
  }
  return formatter;
}

export interface MadOptions {
  decimals?: number;
  compact?: boolean;
}

/** "25,000 MAD" · "25 000 MAD" · "25 000 درهم". */
export function formatMadIn(locale: Locale, amount: number, opts: MadOptions = {}): string {
  const { decimals = 2, compact = false } = opts;
  if (!Number.isFinite(amount)) return EM_DASH;
  return `${numberFormat(locale, decimals, compact).format(amount)}${NBSP}${CURRENCY_WORD[locale]}`;
}

/** A bare number with the locale's grouping, for tables that carry the unit in the header. */
export function formatNumberIn(locale: Locale, value: number, decimals = 0): string {
  if (!Number.isFinite(value)) return EM_DASH;
  return numberFormat(locale, decimals, false).format(value);
}

/** "4.5 %" · "4,5 %". */
export function formatPercentIn(locale: Locale, rate: number, decimals = 1): string {
  if (!Number.isFinite(rate)) return EM_DASH;
  let text = numberFormat(locale, decimals, false).format(rate * 100);
  if (/^-0([.,]0+)?$/.test(text)) text = text.slice(1);
  return `${text}${NBSP}%`;
}

export interface Formatters {
  locale: Locale;
  mad: (amount: number, opts?: MadOptions) => string;
  number: (value: number, decimals?: number) => string;
  percent: (rate: number, decimals?: number) => string;
}

/** Formatters bound to one locale, for server components and emails. */
export function formattersFor(locale: Locale): Formatters {
  return {
    locale,
    mad: (amount, opts) => formatMadIn(locale, amount, opts),
    number: (value, decimals) => formatNumberIn(locale, value, decimals),
    percent: (rate, decimals) => formatPercentIn(locale, rate, decimals),
  };
}
