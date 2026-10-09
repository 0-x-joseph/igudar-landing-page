/**
 * Display formatting and the mandatory "indicative, not guaranteed" wording.
 * Implements FINANCE_ENGINE_SPEC.md section 6. The engine never rounds; this does.
 */
import type { ScenarioKey } from './scenarios';

const NBSP = ' ';
const MIDDOT = '·';
const EM_DASH = '—';

/** Footer for every page that shows numbers (spec section 6). */
export const INDICATIVE_NOTICE =
	'Indicative simulation based on the IGUDAR financial model. Returns are not guaranteed. Not an offer or solicitation; no investment is collected before the AMMC licence (Loi 15-18).';

export const NET_INDICATIVE_SUFFIX = `net ${MIDDOT} indicative ${MIDDOT} not guaranteed`;

const SCENARIO_LABELS: Record<ScenarioKey, string> = {
	pessimistic: 'Pessimistic',
	base: 'Base',
	optimistic: 'Optimistic',
};

// Intl.NumberFormat construction is slow, so instances are cached per option set.
const formatterCache = new Map<string, Intl.NumberFormat>();

function numberFormat(decimals: number, compact: boolean): Intl.NumberFormat {
	const cacheKey = `${decimals}:${compact}`;
	let formatter = formatterCache.get(cacheKey);
	if (!formatter) {
		formatter = new Intl.NumberFormat('en-US', {
			minimumFractionDigits: compact ? 0 : decimals,
			maximumFractionDigits: decimals,
			notation: compact ? 'compact' : 'standard',
		});
		formatterCache.set(cacheKey, formatter);
	}
	return formatter;
}

/**
 * Formats an amount as "1,122.51 MAD" (en-US grouping). Returns an em dash for
 * non-finite input rather than printing "NaN".
 */
export function formatMad(amount: number, opts: { decimals?: number; compact?: boolean } = {}): string {
	const { decimals = 2, compact = false } = opts;
	if (!Number.isFinite(amount)) return EM_DASH;
	return `${numberFormat(decimals, compact).format(amount)}${NBSP}MAD`;
}

/** Formats a fraction as "4.5 %" with a non-breaking space. */
export function formatPercent(rate: number, decimals = 1): string {
	if (!Number.isFinite(rate)) return EM_DASH;
	let text = numberFormat(decimals, false).format(rate * 100);
	// A tiny negative rate rounds to "-0.0"; show it as a plain zero.
	if (/^-0(\.0+)?$/.test(text)) text = text.slice(1);
	return `${text}${NBSP}%`;
}

export function scenarioLabel(key: ScenarioKey): string {
	return SCENARIO_LABELS[key];
}

/** Net cash yield label, always naming the scenario (spec section 6). */
export function yieldLabel(rate: number, key: ScenarioKey): string {
	return `${formatPercent(rate)} indicative net cash yield (${scenarioLabel(key)}) ${MIDDOT} not guaranteed`;
}

/** Net IRR label, always naming the scenario (spec section 6). A null IRR is stated plainly. */
export function irrLabel(rate: number | null, key: ScenarioKey): string {
	const tail = `(${scenarioLabel(key)}) ${MIDDOT} indicative ${MIDDOT} not guaranteed`;
	if (rate === null) return `Net IRR not available ${tail}`;
	return `${formatPercent(rate)} net IRR ${tail}`;
}
