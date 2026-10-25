/**
 * IGUDAR fee grid, tax and legal constants: the single source of truth.
 * Implements FINANCE_ENGINE_SPEC.md section 2. Pure module, no imports.
 */

/**
 * Active fee grid: IGUDAR grid v6 (founder decision, 22 Oct 2026; IGUDAR_Financial_Model_Gate2_v6.xlsx).
 * Rates are fractions, HT; VAT is TAX.TVA_ON_FEES (one constant). S2 (operator structuring) is removed: its 1.5 %
 * became the investor structuring fee D1, the only fee the investor pays directly. D6 is now the dossier fee: 0 MAD.
 */
export const FEE_GRID = {
	S1_SYNDICATION: 0.03,
	D1_STRUCTURING_HT: 0.015,
	D2_PLATFORM_HT: 0.0075,
	D3_EXIT_HT: 0.015,
	D4_TRANSFER_HT: 0.01,
	D5_PERFORMANCE: 0.15,
	D5_HURDLE: 0.06,
	D6_DOSSIER_MAD: 0,
} as const;

/** Tax constants applied by the engine (spec section 2, legal table). */
export const TAX = {
	// The single VAT rate on IGUDAR fees (D1 to D5). VAT on D1 is still to be confirmed with the accountant.
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
 * What the investor pays on top of the ticket at subscription: the D1 structuring fee plus the D6 dossier fee,
 * VAT included (450 MAD on 25,000 MAD). The minimum, the step and the caps apply to the ticket, never to this fee.
 */
export function entryFeeMad(ticketMad: number): number {
	if (!Number.isFinite(ticketMad) || ticketMad < 0) {
		throw new RangeError('ticketMad must be a finite number of at least 0');
	}
	return (ticketMad * FEE_GRID.D1_STRUCTURING_HT + FEE_GRID.D6_DOSSIER_MAD) * (1 + TAX.TVA_ON_FEES);
}

/**
 * The D1 fee in integer cents, rounded to the centime: exactly what subscribe() debits
 * (public.entry_fee_cents: round(amount x active D1 x (1 + VAT)), migration 20261025000400_fee_grid_v6).
 * The D6 dossier fee is 0 in grid v6 and is not charged by subscribe().
 */
export function entryFeeCents(ticketCents: number): number {
	if (!Number.isFinite(ticketCents) || ticketCents < 0) {
		throw new RangeError('ticketCents must be a finite number of at least 0');
	}
	const exact = ticketCents * FEE_GRID.D1_STRUCTURING_HT * (1 + TAX.TVA_ON_FEES);
	// toFixed(6) first: 0.015 x 1.2 is not exact in binary, so a half centime is never decided by float noise.
	return Math.round(Number(exact.toFixed(6)));
}

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

/** Codes of the active grid. 'S2' only survives in data written under an older grid (see LEGACY_FEE_LABELS). */
export type FeeCode = 'S1' | 'D1' | 'D2' | 'D3' | 'D4' | 'D5' | 'D6';

/** Labels for codes that older grids used and v6 removed, so stored rows still display. */
export const LEGACY_FEE_LABELS: Readonly<Record<string, string>> = { S2: 'Master-lease structuring (removed)' };

export type FeeLine = {
	code: FeeCode;
	label: string;
	paidBy: string;
	rate: number;
	when: string;
};

/** The seven rows of the v6 grid (spec section 2). D6 is a fixed amount (0 MAD), so its rate is 0. */
export const FEE_LINES: readonly FeeLine[] = [
	{
		code: 'S1',
		label: 'Syndication',
		paidBy: 'Seller / developer, only if the raise closes',
		rate: FEE_GRID.S1_SYNDICATION,
		when: 'Once, at closing',
	},
	{
		code: 'D1',
		label: 'Structuring fee',
		paidBy: 'Investor, on top of the ticket',
		rate: FEE_GRID.D1_STRUCTURING_HT,
		when: 'At subscription, shown before payment',
	},
	{
		code: 'D2',
		label: 'Platform fee (incl. SAS running costs)',
		paidBy: 'The SAS, from rent',
		rate: FEE_GRID.D2_PLATFORM_HT,
		when: 'Billed quarterly, before payouts',
	},
	{ code: 'D3', label: 'Exit fee', paidBy: 'The SAS, at sale', rate: FEE_GRID.D3_EXIT_HT, when: 'At exit' },
	{
		code: 'D4',
		label: 'Share transfer',
		paidBy: 'Selling investor',
		rate: FEE_GRID.D4_TRANSFER_HT,
		when: 'Each transfer window',
	},
	{ code: 'D5', label: 'Performance fee', paidBy: 'The SAS, at exit', rate: FEE_GRID.D5_PERFORMANCE, when: 'At exit' },
	{ code: 'D6', label: 'Dossier fee', paidBy: 'Investor', rate: 0, when: 'None' },
];

export type TicketRejection = 'below_minimum' | 'above_maximum' | 'not_a_step' | 'not_finite';

/**
 * Validates a ticket against minimum, maximum and step (spec section 6, ticket inputs).
 * The maximum defaults to the per-project cap; pass `max` for other caps.
 * The maximum is checked before the step so an oversized round amount reads as "too much".
 */
export function isValidTicket(
	mad: number,
	opts: { max?: number } = {}
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
