import { describe, expect, it } from 'vitest';
import {
	INDICATIVE_NOTICE,
	NET_INDICATIVE_SUFFIX,
	formatMad,
	formatPercent,
	formatRate,
	irrLabel,
	rateDecimals,
	scenarioLabel,
	yieldLabel,
} from '../format';

const NB = ' ';
const DOT = '·';

describe('formatMad', () => {
	it('formats with en-US grouping and a non-breaking space', () => {
		expect(formatMad(1122.51)).toBe(`1,122.51${NB}MAD`);
		expect(formatMad(0)).toBe(`0.00${NB}MAD`);
	});

	it('rounds to the requested decimals', () => {
		expect(formatMad(1122.5149, { decimals: 0 })).toBe(`1,123${NB}MAD`);
	});

	it('handles negatives', () => {
		expect(formatMad(-10000)).toBe(`-10,000.00${NB}MAD`);
	});

	it('supports compact notation', () => {
		expect(formatMad(1_500_000, { compact: true })).toBe(`1.5M${NB}MAD`);
		expect(formatMad(25_000, { compact: true, decimals: 0 })).toBe(`25K${NB}MAD`);
	});

	it('returns an em dash for non-finite values', () => {
		expect(formatMad(Number.NaN)).toBe('—');
		expect(formatMad(Infinity)).toBe('—');
	});
});

describe('rateDecimals / formatRate (grid rates are never rounded away)', () => {
	it('uses just enough decimals: 1 %, 1.5 %, 0.75 %, 1.82 %', () => {
		expect(rateDecimals(0.01)).toBe(0);
		expect(rateDecimals(0.015)).toBe(1);
		expect(rateDecimals(0.0075)).toBe(2);
		expect(rateDecimals(0.0182)).toBe(2);
		expect(rateDecimals(0.03)).toBe(0);
		expect(formatRate(0.015)).toBe(`1.5${NB}%`);
		expect(formatRate(0.01)).toBe(`1${NB}%`);
		expect(formatRate(0.0182)).toBe(`1.82${NB}%`);
		expect(formatRate(0.009)).toBe(`0.9${NB}%`);
	});

	it('never shows the D1 structuring rate as "2 %"', () => {
		expect(formatRate(0.015)).not.toBe(`2${NB}%`);
		expect(rateDecimals(Number.NaN)).toBe(0);
	});
});

describe('formatPercent', () => {
	it('formats a rate with a non-breaking space', () => {
		expect(formatPercent(0.0449)).toBe(`4.5${NB}%`);
		expect(formatPercent(0.0347, 2)).toBe(`3.47${NB}%`);
		expect(formatPercent(0, 0)).toBe(`0${NB}%`);
		expect(formatPercent(-0.01)).toBe(`-1.0${NB}%`);
	});

	it('returns an em dash for non-finite values', () => {
		expect(formatPercent(Number.NaN)).toBe('—');
	});
});

describe('labels', () => {
	it('names the scenarios', () => {
		expect(scenarioLabel('pessimistic')).toBe('Pessimistic');
		expect(scenarioLabel('base')).toBe('Base');
		expect(scenarioLabel('optimistic')).toBe('Optimistic');
	});

	it('builds the yield label', () => {
		expect(yieldLabel(0.0449, 'base')).toBe(`4.5${NB}% indicative net cash yield (Base) ${DOT} not guaranteed`);
	});

	it('builds the IRR label', () => {
		expect(irrLabel(0.0347, 'base')).toBe(`3.5${NB}% net IRR (Base) ${DOT} indicative ${DOT} not guaranteed`);
	});

	it('handles a null IRR plainly', () => {
		expect(irrLabel(null, 'pessimistic')).toBe(
			`Net IRR not available (Pessimistic) ${DOT} indicative ${DOT} not guaranteed`
		);
	});
});

describe('notices', () => {
	it('exports the legal strings verbatim', () => {
		expect(INDICATIVE_NOTICE).toBe(
			'Indicative simulation based on the IGUDAR financial model. Returns are not guaranteed. Not an offer or solicitation; no investment is collected before the AMMC licence (Loi 15-18).'
		);
		expect(NET_INDICATIVE_SUFFIX).toBe(`net ${DOT} indicative ${DOT} not guaranteed`);
	});
});
