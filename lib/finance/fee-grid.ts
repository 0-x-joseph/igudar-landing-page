/**
 * IGUDAR fee grid, tax and legal constants: the single source of truth.
 * Implements FINANCE_ENGINE_SPEC.md section 2. Pure module, no imports.
 */

/**
 * Active fee grid, v6 (final 22 Oct 2026). Rates are fractions.
 * S1 is paid by the seller. D1 is the only fee the investor pays directly (HT, VAT on top).
 * D2, D3 and D5 are paid by the SAS before payouts; D4 only by a selling investor.
 * S2 (operator structuring) is removed. Analytics plans are out of scope until Gate 3.
 */
export const FEE_GRID = {
	S1_SYNDICATION: 0.03,
	D1_ENTRY: 0.015,
	D2_PLATFORM_HT: 0.0075,
	D3_EXIT_HT: 0.015,
	D4_TRANSFER_HT: 0.01,
	D5_PERFORMANCE: 0.15,
	D5_HURDLE: 0.06,
	D6_DOSSIER: 0,
} as const;

/** Tax constants applied by the engine (spec section 2, legal table). */
export const TAX = {
	TVA_ON_FEES: 0.2,
	IS_RATE: 0.2,
	CM_RATE: 0.0025,
	CM_FLOOR_MAD: 3000,
	CM_EXEMPT_YEARS: 3,
	// Flagged in the model: 10 % vs 11.25 % for 2026 is still to be confirmed.
	WITHHOLDING_INDIVIDUAL: 0.1,
	DEPRECIATION_BUILDING_SHARE: 0.7,
	DEPRECIATION_RATE: 0.04,
} as const;

/** Legal and product limits (spec section 2, legal table). */
export const LIMITS = {
	MIN_TICKET_MAD: 25_000,
	TICKET_STEP_MAD: 5_000,
	MAX_PER_PROJECT_MAD: 500_000,
	MAX_ALL_PLATFORMS_MAD: 1_000_000,
	MAX_RAISE_MAD: 5_000_000,
	HOLD_YEARS: 5,
	EXIT_LOCK_YEARS: 1,
	EXIT_WINDOW_MONTHS: 6,
	COOLING_OFF_DAYS: 14,
	ACQUISITION_COSTS: 0.065,
	BANK_DEPOSIT_RATE: 0.0182,
} as const;

export const MIN_TICKET_MAD = LIMITS.MIN_TICKET_MAD;
/** Stored amounts elsewhere in the platform are integer cents. */
export const MIN_TICKET_CENTS = MIN_TICKET_MAD * 100;

/**
 * Promotions from the Gate 2 pricing document. Flags only: they stay off until
 * decided after the licence, and the engine does not read them yet (spec section 2).
 */
export const PROMOTIONS = {
	yearOneWaiver: false,
	tieredAbove100k: false,
	referral: false,
	allocationPriority: false,
} as const;

export type FeeCode = 'S1' | 'D1' | 'D2' | 'D3' | 'D4' | 'D5' | 'D6';

export type FeeLine = {
	code: FeeCode;
	label: string;
	paidBy: string;
	rate: number;
	when: string;
};

/** The seven rows of the v6 fee grid. D6 (dossier fee) is 0. */
export const FEE_LINES: readonly FeeLine[] = [
	{ code: 'S1', label: 'Syndication', paidBy: 'Seller / developer, only if the raise closes', rate: FEE_GRID.S1_SYNDICATION, when: 'Closing' },
	{ code: 'D1', label: 'Structuring fee', paidBy: 'Investor, at subscription', rate: FEE_GRID.D1_ENTRY, when: 'Subscription' },
	{ code: 'D2', label: 'Platform fee (all-in)', paidBy: 'SAS, from rent, before payouts', rate: FEE_GRID.D2_PLATFORM_HT, when: 'Quarterly' },
	{ code: 'D3', label: 'Exit fee', paidBy: 'SAS, deductible', rate: FEE_GRID.D3_EXIT_HT, when: 'Asset sale / block sale' },
	{ code: 'D4', label: 'Secondary transfer', paidBy: 'Selling associate', rate: FEE_GRID.D4_TRANSFER_HT, when: 'Each transfer window' },
	{ code: 'D5', label: 'Performance fee', paidBy: 'SAS at exit', rate: FEE_GRID.D5_PERFORMANCE, when: 'Exit' },
	{ code: 'D6', label: 'Dossier fee', paidBy: 'Nobody', rate: FEE_GRID.D6_DOSSIER, when: 'None' },
];

export type TicketRejection = 'below_minimum' | 'above_maximum' | 'not_a_step' | 'not_finite';

/**
 * Validates a ticket against minimum, maximum and step (spec section 6, ticket inputs).
 * The maximum defaults to the per-project cap; pass `max` for other caps.
 * The maximum is checked before the step so an oversized round amount reads as "too much".
 */
export function isValidTicket(
	mad: number,
	opts: { max?: number } = {},
): { ok: true } | { ok: false; reason: TicketRejection } {
	const max = opts.max ?? LIMITS.MAX_PER_PROJECT_MAD;
	if (!Number.isFinite(mad)) return { ok: false, reason: 'not_finite' };
	if (mad < LIMITS.MIN_TICKET_MAD) return { ok: false, reason: 'below_minimum' };
	if (mad > max) return { ok: false, reason: 'above_maximum' };
	if (mad % LIMITS.TICKET_STEP_MAD !== 0) return { ok: false, reason: 'not_a_step' };
	return { ok: true };
}

export type CapRejection = 'invalid_ticket' | 'per_project_cap' | 'all_platforms_cap';

/**
 * Checks a new ticket against the per-project and all-platforms caps (spec section 2).
 * Business angels are exempt (art. 44), so their headroom is infinite.
 * Headroom is what remained before this ticket. Negative invested amounts count as 0.
 */
export function checkCaps(input: {
	ticketMad: number;
	investedInProjectMad?: number;
	investedTotalMad?: number;
	isAngel?: boolean;
}): { ok: boolean; reason?: CapRejection; headroom: { perProject: number; total: number } } {
	const inProject = Math.max(0, input.investedInProjectMad ?? 0);
	const total = Math.max(0, input.investedTotalMad ?? 0);
	const headroom = input.isAngel
		? { perProject: Infinity, total: Infinity }
		: {
				perProject: Math.max(0, LIMITS.MAX_PER_PROJECT_MAD - inProject),
				total: Math.max(0, LIMITS.MAX_ALL_PLATFORMS_MAD - total),
			};
	if (!Number.isFinite(input.ticketMad) || input.ticketMad <= 0) {
		return { ok: false, reason: 'invalid_ticket', headroom };
	}
	if (input.isAngel) return { ok: true, headroom };
	if (input.ticketMad > headroom.perProject) return { ok: false, reason: 'per_project_cap', headroom };
	if (input.ticketMad > headroom.total) return { ok: false, reason: 'all_platforms_cap', headroom };
	return { ok: true, headroom };
}
