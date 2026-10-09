import { describe, expect, it } from 'vitest';
import { irr, npv } from '../irr';

describe('npv', () => {
	it('discounts cash flows at the given rate', () => {
		expect(npv(0.1, [-100, 110])).toBeCloseTo(0, 10);
		expect(npv(0, [-100, 50, 60])).toBeCloseTo(10, 10);
	});

	it('returns 0 for an empty list', () => {
		expect(npv(0.05, [])).toBe(0);
	});
});

describe('irr', () => {
	it('solves a simple one-period return', () => {
		expect(irr([-100, 110])).toBeCloseTo(0.1, 8);
	});

	it('solves a multi-period stream and zeroes the NPV', () => {
		const flows = [-1000, 100, 100, 100, 100, 1100];
		const r = irr(flows);
		expect(r).not.toBeNull();
		expect(npv(r as number, flows)).toBeCloseTo(0, 6);
		expect(r as number).toBeCloseTo(0.1, 8);
	});

	it('handles negative IRRs', () => {
		const r = irr([-100, 50, 20]);
		expect(r).not.toBeNull();
		expect(r as number).toBeLessThan(0);
		expect(npv(r as number, [-100, 50, 20])).toBeCloseTo(0, 6);
	});

	it('falls back to bisection when Newton from the guess diverges', () => {
		const flows = [-100, 1000];
		const r = irr(flows, 5);
		expect(r).not.toBeNull();
		expect(r as number).toBeCloseTo(9, 6);
	});

	it('falls back to bisection when the derivative is flat or the guess is out of range', () => {
		const flows = [-100, 20, 20, 20, 20, 20, 20];
		const r = irr(flows, -5);
		expect(r).not.toBeNull();
		expect(npv(r as number, flows)).toBeCloseTo(0, 6);
	});

	it('returns null for empty input', () => {
		expect(irr([])).toBeNull();
	});

	it('returns null when there is no sign change', () => {
		expect(irr([100, 50])).toBeNull();
		expect(irr([-100, -50])).toBeNull();
		expect(irr([0, 0])).toBeNull();
	});

	it('returns null when the root is outside the bracket', () => {
		expect(irr([-100, 0.0001])).toBeNull();
	});

	it('returns null for non-finite cash flows', () => {
		expect(irr([-100, Number.NaN])).toBeNull();
	});
});
