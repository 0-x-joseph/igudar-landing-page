/**
 * Pessimistic / Base / Optimistic assumptions. Implements FINANCE_ENGINE_SPEC.md section 3.
 */

export type ScenarioKey = 'pessimistic' | 'base' | 'optimistic';

export interface ScenarioAssumptions {
	readonly grossYield: number;
	readonly rentIndexation: number;
	readonly vacancy: number;
	readonly rentReserve: number;
	readonly priceGrowth: number;
	readonly sellerCostsAtExit: number;
	readonly useDepreciation: boolean;
}

export const MODEL_SCENARIOS: Readonly<Record<ScenarioKey, Readonly<ScenarioAssumptions>>> = Object.freeze({
	pessimistic: Object.freeze({
		grossYield: 0.0731,
		rentIndexation: 0,
		vacancy: 0.05,
		rentReserve: 0.08,
		priceGrowth: 0,
		sellerCostsAtExit: 0.02,
		useDepreciation: false,
	}),
	base: Object.freeze({
		grossYield: 0.08,
		rentIndexation: 0,
		vacancy: 0,
		rentReserve: 0.05,
		priceGrowth: 0.005,
		sellerCostsAtExit: 0,
		useDepreciation: false,
	}),
	optimistic: Object.freeze({
		grossYield: 0.088,
		rentIndexation: 0.01,
		vacancy: 0,
		rentReserve: 0.05,
		priceGrowth: 0.015,
		sellerCostsAtExit: 0,
		useDepreciation: true,
	}),
});

/** Display order: the pessimistic case always comes first (spec section 6). */
export const SCENARIO_KEYS: readonly ScenarioKey[] = ['pessimistic', 'base', 'optimistic'];

// Spreads of the model's pessimistic / optimistic yields around its 8 % base.
const PESSIMISTIC_YIELD_SPREAD = 0.08 - 0.0731;
const OPTIMISTIC_YIELD_SPREAD = 0.088 - 0.08;

/**
 * Scenarios for a property with its own gross yield: that yield becomes Base and the
 * other two keep the model's spreads around it (clamped at 0). Every other
 * assumption is copied from MODEL_SCENARIOS. At 8 % this equals MODEL_SCENARIOS.
 * Extension of spec section 3 (design decision for per-property ROI cards).
 */
export function scenariosForGrossYield(baseGrossYield: number): Record<ScenarioKey, ScenarioAssumptions> {
	const yields: Record<ScenarioKey, number> = {
		pessimistic: baseGrossYield - PESSIMISTIC_YIELD_SPREAD,
		base: baseGrossYield,
		optimistic: baseGrossYield + OPTIMISTIC_YIELD_SPREAD,
	};
	const out = {} as Record<ScenarioKey, ScenarioAssumptions>;
	for (const key of SCENARIO_KEYS) {
		out[key] = { ...MODEL_SCENARIOS[key], grossYield: Math.max(0, yields[key]) };
	}
	return out;
}
