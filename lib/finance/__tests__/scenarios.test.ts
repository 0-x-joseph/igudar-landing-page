import { describe, expect, it } from 'vitest';
import vectors from './test-vectors.json';
import { MODEL_SCENARIOS, SCENARIO_KEYS, scenariosForGrossYield } from '../scenarios';

describe('MODEL_SCENARIOS', () => {
	it('matches the scenarios block of the test vectors', () => {
		expect(Object.keys(vectors.scenarios).sort()).toEqual([...SCENARIO_KEYS].sort());
		for (const key of SCENARIO_KEYS) {
			const v = vectors.scenarios[key];
			expect(MODEL_SCENARIOS[key]).toEqual({
				grossYield: v.gross_yield,
				rentIndexation: v.rent_indexation,
				vacancy: v.vacancy,
				rentReserve: v.rent_reserve,
				priceGrowth: v.price_growth,
				sellerCostsAtExit: v.seller_costs_at_exit,
				useDepreciation: v.use_depreciation,
			});
		}
	});

	it('lists keys in display order', () => {
		expect(SCENARIO_KEYS).toEqual(['pessimistic', 'base', 'optimistic']);
	});
});

describe('scenariosForGrossYield', () => {
	it('deep-equals the model scenarios at 8 %', () => {
		expect(scenariosForGrossYield(0.08)).toEqual(MODEL_SCENARIOS);
	});

	it('uses the property yield as Base and shifts the others by the model spreads', () => {
		const s = scenariosForGrossYield(0.09);
		expect(s.base.grossYield).toBe(0.09);
		expect(s.pessimistic.grossYield).toBeCloseTo(0.09 - 0.0069, 12);
		expect(s.optimistic.grossYield).toBeCloseTo(0.09 + 0.008, 12);
		expect(s.optimistic.useDepreciation).toBe(true);
		expect(s.pessimistic.vacancy).toBe(0.05);
	});

	it('clamps at zero', () => {
		expect(scenariosForGrossYield(0.003).pessimistic.grossYield).toBe(0);
		expect(scenariosForGrossYield(0).base.grossYield).toBe(0);
	});

	it('returns independent copies and never exposes the frozen model objects', () => {
		const s = scenariosForGrossYield(0.08);
		expect(s.base).not.toBe(MODEL_SCENARIOS.base);
		expect(Object.isFrozen(MODEL_SCENARIOS)).toBe(true);
		for (const key of SCENARIO_KEYS) {
			expect(Object.isFrozen(MODEL_SCENARIOS[key])).toBe(true);
		}
	});
});
