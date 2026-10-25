import { describe, expect, it } from 'vitest';
import vectors from './test-vectors.json';
import {
	FEE_GRID,
	FEE_LINES,
	LIMITS,
	MIN_TICKET_CENTS,
	MIN_TICKET_MAD,
	PROMOTIONS,
	TAX,
	checkCaps,
	entryFeeCents,
	entryFeeMad,
	isValidTicket,
} from '../fee-grid';

describe('constants', () => {
	it('is the v6 grid (founder decision, 22 Oct 2026)', () => {
		expect(FEE_GRID.S1_SYNDICATION).toBe(0.03);
		expect(FEE_GRID.D1_STRUCTURING_HT).toBe(0.015);
		expect(FEE_GRID.D2_PLATFORM_HT).toBe(0.0075);
		expect(FEE_GRID.D3_EXIT_HT).toBe(0.015);
		expect(FEE_GRID.D4_TRANSFER_HT).toBe(0.01);
		expect(FEE_GRID.D5_PERFORMANCE).toBe(0.15);
		expect(FEE_GRID.D5_HURDLE).toBe(0.06);
		expect(FEE_GRID.D6_DOSSIER_MAD).toBe(0);
		expect(TAX.TVA_ON_FEES).toBe(0.2);
		expect(TAX.WITHHOLDING_INDIVIDUAL).toBe(0.1);
		expect(LIMITS.BANK_DEPOSIT_RATE).toBe(0.0182);
		expect(LIMITS.MIN_TICKET_MAD).toBe(25_000);
		expect(MIN_TICKET_MAD).toBe(25_000);
		expect(MIN_TICKET_CENTS).toBe(2_500_000);
	});

	it('keeps every promotion off by default', () => {
		expect(Object.values(PROMOTIONS).every((v) => v === false)).toBe(true);
	});

	it('lists the seven v6 fee lines in order: S2 removed, no analytics plan', () => {
		expect(FEE_LINES.map((l) => l.code)).toEqual(['S1', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6']);
		expect(FEE_LINES.find((l) => l.code === 'D1')?.rate).toBe(0.015);
		expect(FEE_LINES.find((l) => l.code === 'D2')?.rate).toBe(0.0075);
		expect(FEE_LINES.find((l) => l.code === 'D4')?.rate).toBe(0.01);
		expect(FEE_LINES.find((l) => l.code === 'D6')?.label).toBe('Dossier fee');
		expect(FEE_LINES.find((l) => l.code === 'D6')?.rate).toBe(0);
		expect(FEE_LINES.some((l) => /analytics/i.test(l.label))).toBe(false);
	});
});

describe('entry fee (D1 + VAT, paid on top of the ticket)', () => {
	it('is 450 MAD on the 25,000 MAD minimum: 1.5 % + 20 % VAT = 1.8 %', () => {
		expect(entryFeeMad(25_000)).toBeCloseTo(450, 10);
		expect(entryFeeCents(2_500_000)).toBe(45_000);
	});

	it('scales with the ticket and is an exact number of cents on every 5,000 MAD step', () => {
		for (let mad = 25_000; mad <= 500_000; mad += 5_000) {
			const cents = entryFeeCents(mad * 100);
			expect(Number.isInteger(cents)).toBe(true);
			expect(cents).toBe((mad * 100 * 18) / 1000);
			expect(cents / 100).toBeCloseTo(entryFeeMad(mad), 6);
		}
		expect(entryFeeCents(50_000_000)).toBe(900_000);
	});

	it('rounds to the nearest centime and rejects invalid amounts', () => {
		expect(entryFeeCents(1)).toBe(0);
		expect(entryFeeCents(100)).toBe(2);
		expect(entryFeeCents(0)).toBe(0);
		expect(() => entryFeeCents(-1)).toThrow(RangeError);
		expect(() => entryFeeMad(Number.NaN)).toThrow(RangeError);
	});

	it('never counts toward the caps: 500,000 MAD is still exactly the per-project cap', () => {
		expect(isValidTicket(500_000).ok).toBe(true);
		expect(checkCaps({ ticketMad: 500_000 }).ok).toBe(true);
	});
});

const reasonOf = (r: ReturnType<typeof isValidTicket>) => (r.ok ? undefined : r.reason);

describe('isValidTicket', () => {
	it('accepts the minimum, steps and the maximum', () => {
		expect(isValidTicket(25_000)).toEqual({ ok: true });
		expect(isValidTicket(30_000).ok).toBe(true);
		expect(isValidTicket(500_000).ok).toBe(true);
	});

	it('rejects below the minimum', () => {
		expect(isValidTicket(20_000)).toEqual({ ok: false, reason: 'below_minimum' });
		expect(reasonOf(isValidTicket(24_999))).toBe('below_minimum');
		expect(reasonOf(isValidTicket(0))).toBe('below_minimum');
		expect(reasonOf(isValidTicket(-5000))).toBe('below_minimum');
	});

	it('rejects amounts that are not a 5,000 step', () => {
		expect(isValidTicket(27_500)).toEqual({ ok: false, reason: 'not_a_step' });
		expect(reasonOf(isValidTicket(25_000.5))).toBe('not_a_step');
	});

	it('rejects above the maximum, honouring a custom max', () => {
		expect(isValidTicket(505_000)).toEqual({ ok: false, reason: 'above_maximum' });
		expect(isValidTicket(1_000_000, { max: 1_000_000 }).ok).toBe(true);
		expect(reasonOf(isValidTicket(100_000, { max: 50_000 }))).toBe('above_maximum');
	});

	it('reports an oversized non-step amount as above_maximum', () => {
		expect(reasonOf(isValidTicket(502_500))).toBe('above_maximum');
	});

	it('rejects non-finite values', () => {
		expect(isValidTicket(Number.NaN)).toEqual({ ok: false, reason: 'not_finite' });
		expect(reasonOf(isValidTicket(Infinity))).toBe('not_finite');
	});
});

describe('checkCaps', () => {
	it('is ok within both caps and reports headroom', () => {
		const r = checkCaps({ ticketMad: 100_000, investedInProjectMad: 100_000, investedTotalMad: 300_000 });
		expect(r.ok).toBe(true);
		expect(r.headroom).toEqual({ perProject: 400_000, total: 700_000 });
	});

	it('defaults invested amounts to zero', () => {
		expect(checkCaps({ ticketMad: 25_000 }).headroom).toEqual({ perProject: 500_000, total: 1_000_000 });
	});

	it('allows exactly the per-project cap and rejects one step over', () => {
		expect(checkCaps({ ticketMad: 400_000, investedInProjectMad: 100_000 }).ok).toBe(true);
		const over = checkCaps({ ticketMad: 405_000, investedInProjectMad: 100_000 });
		expect(over.ok).toBe(false);
		expect(over.reason).toBe('per_project_cap');
	});

	it('enforces the all-platforms cap', () => {
		expect(checkCaps({ ticketMad: 100_000, investedTotalMad: 900_000 }).ok).toBe(true);
		const over = checkCaps({ ticketMad: 100_000, investedTotalMad: 950_000 });
		expect(over.ok).toBe(false);
		expect(over.reason).toBe('all_platforms_cap');
	});

	it('clamps headroom at zero', () => {
		expect(checkCaps({ ticketMad: 25_000, investedInProjectMad: 600_000 }).headroom.perProject).toBe(0);
	});

	it('lets business angels bypass every cap', () => {
		const r = checkCaps({ ticketMad: 2_000_000, investedTotalMad: 5_000_000, isAngel: true });
		expect(r.ok).toBe(true);
		expect(r.headroom).toEqual({ perProject: Infinity, total: Infinity });
	});
});

describe('checkCaps input validation', () => {
	it.each([0, -25_000, Number.NaN, Infinity])('rejects an invalid ticket (%s)', (ticketMad) => {
		const r = checkCaps({ ticketMad });
		expect(r.ok).toBe(false);
		expect(r.reason).toBe('invalid_ticket');
	});

	it('treats negative invested amounts as zero', () => {
		const r = checkCaps({ ticketMad: 25_000, investedInProjectMad: -100, investedTotalMad: -5 });
		expect(r.headroom).toEqual({ perProject: 500_000, total: 1_000_000 });
	});
});

describe('test-vectors.json defaults stay in sync with the grid', () => {
	const d = vectors.defaults;

	it('matches the fee grid', () => {
		expect(d.fees.D1_structuring_HT).toBe(FEE_GRID.D1_STRUCTURING_HT);
		expect(d.fees.D6_dossier_mad).toBe(FEE_GRID.D6_DOSSIER_MAD);
		expect(d.fees.D2_platform_per_year_HT).toBe(FEE_GRID.D2_PLATFORM_HT);
		expect(d.fees.D3_exit_HT).toBe(FEE_GRID.D3_EXIT_HT);
		expect(d.fees.D4_transfer_HT).toBe(FEE_GRID.D4_TRANSFER_HT);
		expect(d.fees.D5_performance).toBe(FEE_GRID.D5_PERFORMANCE);
		expect(d.fees.D5_hurdle).toBe(FEE_GRID.D5_HURDLE);
		expect(d.fees.S1_syndication_seller).toBe(FEE_GRID.S1_SYNDICATION);
		expect('S2_structuring_operator' in d.fees).toBe(false);
	});

	it('matches tax and limits', () => {
		expect(d.tva_on_fees).toBe(TAX.TVA_ON_FEES);
		expect(d.is_rate).toBe(TAX.IS_RATE);
		expect(d.cotisation_minimale.rate).toBe(TAX.CM_RATE);
		expect(d.cotisation_minimale.floor_mad).toBe(TAX.CM_FLOOR_MAD);
		expect(d.cotisation_minimale.exempt_years).toBe(TAX.CM_EXEMPT_YEARS);
		expect(d.withholding_individual).toBe(TAX.WITHHOLDING_INDIVIDUAL);
		expect(d.depreciation.building_share).toBe(TAX.DEPRECIATION_BUILDING_SHARE);
		expect(d.depreciation.rate).toBe(TAX.DEPRECIATION_RATE);
		expect(d.raise_mad).toBe(LIMITS.MAX_RAISE_MAD);
		expect(d.hold_years).toBe(LIMITS.HOLD_YEARS);
		expect(d.acquisition_costs).toBe(LIMITS.ACQUISITION_COSTS);
		expect(d.bank_deposit_benchmark).toBe(LIMITS.BANK_DEPOSIT_RATE);
	});
});
