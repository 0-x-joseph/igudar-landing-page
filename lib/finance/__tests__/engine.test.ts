import { describe, expect, it } from 'vitest';
import vectors from './test-vectors.json';
import {
	earlyExitFeeMad,
	feeLinesForTicket,
	simulate,
	simulateAll,
	type SimulationInput,
	type SimulationResult,
} from '../engine';
import { MODEL_SCENARIOS, SCENARIO_KEYS, scenariosForGrossYield, type ScenarioKey } from '../scenarios';

type VectorCase = (typeof vectors.cases)[number];

function expectMatchesVector(result: SimulationResult, c: VectorCase): void {
	expect(Math.abs((result.netIrr as number) - c.net_irr)).toBeLessThanOrEqual(0.0001);
	expect(result.netCashYear1Mad).toBeCloseTo(c.net_cash_year1_mad, 2);
	expect(result.netExitProceedsMad).toBeCloseTo(c.net_exit_proceeds_mad, 2);
	expect(result.netProfitMad).toBeCloseTo(c.net_profit_mad, 2);
	expect(result.bankDepositProfitMad).toBeCloseTo(c.bank_deposit_profit_mad, 2);
	expect(Math.abs(result.netCashYieldYear1 - c.net_cash_yield_year1)).toBeLessThanOrEqual(0.0001);
	expect(Math.abs(result.moneyMultiple - c.money_multiple)).toBeLessThanOrEqual(0.0001);
	expect(result.cashFlows).toHaveLength(c.cash_flows_mad.length);
	c.cash_flows_mad.forEach((expected, i) => {
		expect(Math.abs(result.cashFlows[i] - expected)).toBeLessThanOrEqual(0.01);
	});
}

describe('test vectors', () => {
	it('has the 15 expected cases, generated from the v6 workbook', () => {
		expect(vectors.cases).toHaveLength(15);
		expect(vectors.source).toBe('IGUDAR_Financial_Model_Gate2_v6.xlsx');
	});

	for (const c of vectors.cases) {
		const scenario = c.scenario as ScenarioKey;

		it(`${scenario} @ ${c.ticket_mad} MAD (named scenario)`, () => {
			expectMatchesVector(simulate({ ticketMad: c.ticket_mad, scenario }), c);
		});
	}

	it('scenariosForGrossYield(0.08) reproduces the base vectors', () => {
		const custom = scenariosForGrossYield(0.08).base;
		for (const c of vectors.cases.filter((v) => v.scenario === 'base')) {
			expectMatchesVector(simulate({ ticketMad: c.ticket_mad, scenario: custom }), c);
		}
	});
});

describe('Base 25,000 MAD hand check', () => {
	const r = simulate({ ticketMad: 25_000, scenario: 'base' });

	it('matches the per-SAS intermediate figures', () => {
		expect(r.perYear[0].rentMad).toBeCloseTo(375_586.85, 2);
		expect(r.perYear[0].cashMad).toBeCloseTo(311_807.51, 2);
		expect(r.perYear[0].isMad).toBeCloseTo(62_361.5, 2);
		expect(r.perYear[0].dividendMad).toBeCloseTo(249_446.01, 2);
		expect(r.perYear[0].investorNetMad).toBeCloseTo(1_122.51, 2);
		expect(r.netExitProceedsMad).toBeCloseTo(23_633.73, 2);
	});

	it('has the rent bridge of spec section 5', () => {
		expect(r.rentBridge.reserveVacancy).toBeCloseTo(5, 1);
		expect(r.rentBridge.platformFee).toBeCloseTo(12, 1);
		expect(r.rentBridge.is).toBeCloseTo(16.6, 1);
		expect(r.rentBridge.withholding).toBeCloseTo(6.6, 1);
		expect(r.rentBridge.investor).toBeCloseTo(59.8, 1);
	});

	it('shows the five-year structure', () => {
		expect(r.perYear).toHaveLength(5);
		expect(r.share).toBeCloseTo(0.005, 12);
		expect(r.input.scenarioKey).toBe('base');
		expect(r.input.holdYears).toBe(5);
		expect(r.input.raiseMad).toBe(5_000_000);
		expect(r.cashFlows).toHaveLength(6);
		expect(r.cashFlows[0]).toBeCloseTo(-25_450, 10);
		expect(r.exit.surplusMad).toBe(0);
	});

	it('applies the cotisation minimale only from year 4', () => {
		expect(r.perYear[2].cotisationMinimaleMad).toBe(0);
		expect(r.perYear[3].cotisationMinimaleMad).toBeCloseTo(3000, 6);
		expect(r.perYear[3].isMad).toBeGreaterThan(r.perYear[3].cotisationMinimaleMad);
	});
});

describe('v6 check figures (workbook IGUDAR_Financial_Model_Gate2_v6.xlsx, 25,000 MAD, 5 years)', () => {
	const all = simulateAll(25_000);

	it('base: 1,122.51 MAD a year, 4.49 % cash yield, +3,796.26 MAD, net IRR 3.07 %, exit 23,633.73 MAD', () => {
		const b = all.base;
		expect(b.entryFeeMad).toBeCloseTo(450, 10);
		expect(b.outlayMad).toBeCloseTo(25_450, 10);
		expect(b.netCashYear1Mad).toBeCloseTo(1_122.51, 2);
		expect(b.netCashYieldYear1).toBeCloseTo(0.0449, 4);
		expect(b.netProfitMad).toBeCloseTo(3_796.26, 2);
		expect(b.netIrr as number).toBeCloseTo(0.030683, 6);
		expect(b.netExitProceedsMad).toBeCloseTo(23_633.73, 2);
		expect(b.moneyMultiple).toBeCloseTo(1.149165, 6);
	});

	it('pessimistic: 912.88 MAD a year, +1,696.55 MAD, net IRR 1.395 %', () => {
		const p = all.pessimistic;
		expect(p.netCashYear1Mad).toBeCloseTo(912.88, 2);
		expect(p.netProfitMad).toBeCloseTo(1_696.55, 2);
		expect(p.netIrr as number).toBeCloseTo(0.013953, 6);
	});

	it('optimistic has no purchase discount: only the D1 fee moves it from the previous grid', () => {
		const o = all.optimistic;
		expect(o.netCashYear1Mad).toBeCloseTo(1_369.27, 2);
		expect(o.netProfitMad).toBeCloseTo(6_198.31 - 450, 2);
		expect(o.netIrr as number).toBeLessThan(0.050134);
		expect(o.netIrr as number).toBeCloseTo(0.045979, 6);
	});

	it('bank deposit at 1.82 %: 2,359.33 MAD over 5 years on the ticket (the fee is not deposited)', () => {
		expect(all.base.bankDepositProfitMad).toBeCloseTo(2_359.33, 2);
	});

	it('the fee only touches year 0: dividends and exit are the same as without it', () => {
		const b = all.base;
		expect(b.cashFlows.slice(1).reduce((s, x) => s + x, 0) - b.outlayMad).toBeCloseTo(b.netProfitMad, 8);
		expect(b.cashFlows[1]).toBeCloseTo(1_122.51, 2);
	});
});

describe('bank deposit comparison', () => {
	it('pessimistic does not beat the deposit, base and optimistic do', () => {
		const all = simulateAll(25_000);
		expect(all.pessimistic.beatsBankDeposit).toBe(false);
		expect(all.base.beatsBankDeposit).toBe(true);
		expect(all.optimistic.beatsBankDeposit).toBe(true);
	});
});

describe('simulateAll', () => {
	it('returns the three scenarios', () => {
		const all = simulateAll(50_000);
		expect(Object.keys(all).sort()).toEqual([...SCENARIO_KEYS].sort());
		for (const key of SCENARIO_KEYS) {
			expect(all[key].input.scenarioKey).toBe(key);
			expect(all[key].input.ticketMad).toBe(50_000);
		}
	});

	it('accepts custom scenarios and options', () => {
		const all = simulateAll(25_000, scenariosForGrossYield(0.09), { holdYears: 7 });
		expect(all.base.perYear).toHaveLength(7);
		expect(all.base.input.assumptions.grossYield).toBe(0.09);
	});
});

describe('custom assumptions', () => {
	it('marks the scenario key as custom and exercises indexation and depreciation', () => {
		const r = simulate({ ticketMad: 25_000, scenario: { ...MODEL_SCENARIOS.optimistic, grossYield: 0.1 } });
		expect(r.input.scenarioKey).toBe('custom');
		expect(r.perYear[1].rentMad).toBeCloseTo(r.perYear[0].rentMad * 1.01, 6);
		expect(r.perYear[0].depreciationMad).toBeCloseTo((5_000_000 / 1.065) * 0.7 * 0.04, 6);
	});

	it('gives a different hold length a different cash-flow shape', () => {
		const r = simulate({ ticketMad: 25_000, scenario: 'base', holdYears: 3 });
		expect(r.cashFlows).toHaveLength(4);
		expect(r.perYear.every((y) => y.cotisationMinimaleMad === 0)).toBe(true);
	});

	it('has a null IRR when nothing is ever returned', () => {
		const r = simulate({
			ticketMad: 25_000,
			scenario: { ...MODEL_SCENARIOS.base, grossYield: 0, priceGrowth: -0.99 },
		});
		expect(r.netIrr).toBeNull();
	});

	it('charges the performance fee when returns exceed the hurdle', () => {
		const r = simulate({
			ticketMad: 25_000,
			scenario: { ...MODEL_SCENARIOS.base, grossYield: 0.12, priceGrowth: 0.05 },
		});
		expect(r.exit.performanceFeeMad).toBeGreaterThan(0);
		expect(r.exit.surplusMad).toBeGreaterThan(0);
	});

	it('scales linearly with the ticket', () => {
		const a = simulate({ ticketMad: 25_000, scenario: 'base' });
		const b = simulate({ ticketMad: 250_000, scenario: 'base' });
		expect(b.netProfitMad).toBeCloseTo(a.netProfitMad * 10, 6);
		expect(b.netIrr).toBeCloseTo(a.netIrr as number, 10);
	});
});

describe('input validation', () => {
	it.each([
		['zero ticket', { ticketMad: 0, scenario: 'base' as const }],
		['negative ticket', { ticketMad: -1, scenario: 'base' as const }],
		['NaN ticket', { ticketMad: Number.NaN, scenario: 'base' as const }],
		['infinite ticket', { ticketMad: Infinity, scenario: 'base' as const }],
		['fractional hold', { ticketMad: 25_000, scenario: 'base' as const, holdYears: 2.5 }],
		['zero hold', { ticketMad: 25_000, scenario: 'base' as const, holdYears: 0 }],
		['zero raise', { ticketMad: 25_000, scenario: 'base' as const, raiseMad: 0 }],
		['NaN raise', { ticketMad: 25_000, scenario: 'base' as const, raiseMad: Number.NaN }],
	])('throws RangeError for %s', (_name, input) => {
		expect(() => simulate(input)).toThrow(RangeError);
	});
});

describe('earlyExitFeeMad', () => {
	it('is 1 % of the amount traded, HT (D4, grid v6)', () => {
		expect(earlyExitFeeMad(100_000)).toBeCloseTo(1_000, 10);
		expect(earlyExitFeeMad(0)).toBe(0);
	});

	it('rejects negative or non-finite amounts', () => {
		expect(() => earlyExitFeeMad(-1)).toThrow(RangeError);
		expect(() => earlyExitFeeMad(Number.NaN)).toThrow(RangeError);
	});
});

describe('feeLinesForTicket', () => {
	const lines = feeLinesForTicket(25_000);
	const byCode = (code: string) => lines.find((l) => l.code === code);

	it('returns the seven v6 lines', () => {
		expect(lines.map((l) => l.code)).toEqual(['S1', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6']);
	});

	it('computes D2 per year on the ticket and shows the TTC figure', () => {
		expect(byCode('D2')?.amountMad).toBeCloseTo(187.5, 10);
		expect(byCode('D2')?.label).toContain('225.00');
	});

	it('has a 450 MAD structuring fee (VAT incl.), no dossier fee, null S1 and exit-dependent D3 / D5', () => {
		expect(byCode('D1')?.amountMad).toBeCloseTo(450, 10);
		expect(byCode('D1')?.label).toContain('375.00');
		expect(byCode('D1')?.label).toContain('450.00');
		expect(byCode('D6')?.amountMad).toBe(0);
		expect(byCode('S1')?.amountMad).toBeNull();
		expect(byCode('S2')).toBeUndefined();
		expect(byCode('D3')?.amountMad).toBeNull();
		expect(byCode('D5')?.amountMad).toBeNull();
		expect(byCode('D3')?.when.toLowerCase()).toContain('exit');
	});

	it('rejects invalid tickets and hold lengths', () => {
		expect(() => feeLinesForTicket(0)).toThrow(RangeError);
		expect(() => feeLinesForTicket(25_000, 0)).toThrow(RangeError);
	});

	it('mentions the hold in the D2 label', () => {
		expect(feeLinesForTicket(25_000, 7).find((l) => l.code === 'D2')?.label).toContain('7');
	});
});

describe('cotisation minimale floor', () => {
	it('binds from year 4 when the low-yield SAS has little taxable cash', () => {
		const r = simulate({ ticketMad: 25_000, scenario: { ...MODEL_SCENARIOS.base, grossYield: 0.0112 } });
		const [y1, , y3, y4] = r.perYear;
		expect(y1.cashMad).toBeGreaterThan(0);
		// 20 % of this cash is well below the 3,000 floor, so the floor decides year 4 only.
		expect(TAX_IS(y4.cashMad)).toBeLessThan(3000);
		expect(y3.isMad).toBeCloseTo(0.2 * y3.cashMad, 6);
		expect(y4.cotisationMinimaleMad).toBe(3000);
		expect(y4.isMad).toBe(3000);
		expect(y4.dividendMad).toBeCloseTo(y4.cashMad - 3000, 6);
	});
});

function TAX_IS(cash: number): number {
	return 0.2 * Math.max(0, cash);
}

describe('exit block (optimistic 25,000 MAD, hand-computed)', () => {
	// P = 5,000,000 / 1.065; sale = P x 1.015^5; costs = sale x 1.5 % x 1.2;
	// dep = P x 0.7 x 0.04 per year, 5 years; gain = sale - costs - (R - 5 dep);
	// proceeds = sale - costs - 20 % gain. Hurdle and surplus are both out of reach.
	const { exit, perYear } = simulate({ ticketMad: 25_000, scenario: 'optimistic' });

	it('matches the closed-form figures', () => {
		expect(exit.saleMad).toBeCloseTo(5_057_671.38, 2);
		expect(exit.costsMad).toBeCloseTo(91_038.08, 2);
		expect(exit.gainMad).toBeCloseTo(623_910.29, 2);
		expect(exit.proceedsMad).toBeCloseTo(4_841_851.24, 2);
		expect(exit.performanceFeeMad).toBe(0);
		expect(exit.surplusMad).toBe(0);
	});

	it('lets depreciation lower the tax base and raise the exit gain', () => {
		expect(perYear[0].depreciationMad).toBeCloseTo(131_455.4, 1);
		// Year 1: IS is 20 % of (cash - depreciation), not of cash.
		expect(perYear[0].isMad).toBeCloseTo(0.2 * (perYear[0].cashMad - perYear[0].depreciationMad), 6);
		// Without depreciation sale - costs is below R, so the gain floors at 0.
		const noDep = simulate({ ticketMad: 25_000, scenario: { ...MODEL_SCENARIOS.optimistic, useDepreciation: false } });
		expect(noDep.exit.gainMad).toBe(0);
		expect(exit.gainMad).toBeCloseTo(exit.saleMad - exit.costsMad - (5_000_000 - 5 * perYear[0].depreciationMad), 6);
	});
});

describe('year-1 metrics with a one-year hold', () => {
	it('excludes exit proceeds from net cash year 1', () => {
		const r = simulate({ ticketMad: 25_000, scenario: 'base', holdYears: 1 });
		expect(r.netCashYear1Mad).toBeCloseTo(r.perYear[0].investorNetMad, 10);
		expect(r.netCashYear1Mad).toBeCloseTo(1_122.51, 2);
		expect(r.netCashYieldYear1).toBeCloseTo(0.0449, 4);
		expect(r.cashFlows[1]).toBeGreaterThan(r.netCashYear1Mad * 10);
	});
});

describe('immutability', () => {
	it('copies the assumptions instead of sharing the model objects', () => {
		const r = simulate({ ticketMad: 25_000, scenario: 'base' });
		expect(r.input.assumptions).toEqual(MODEL_SCENARIOS.base);
		expect(r.input.assumptions).not.toBe(MODEL_SCENARIOS.base);
	});

	it('simulateAll labels slots with their key and leaves custom runs custom', () => {
		const all = simulateAll(25_000);
		expect(all.base.input.scenarioKey).toBe('base');
		expect(simulate({ ticketMad: 25_000, scenario: MODEL_SCENARIOS.base }).input.scenarioKey).toBe('custom');
	});
});

describe('extra input validation', () => {
	const bad = (patch: Record<string, unknown>) =>
		({ ticketMad: 25_000, scenario: { ...MODEL_SCENARIOS.base, ...patch } }) as unknown as SimulationInput;

	it.each([
		['hold above 50', { ticketMad: 25_000, scenario: 'base', holdYears: 51 } as SimulationInput],
		['ticket above raise', { ticketMad: 6_000_000, scenario: 'base' } as SimulationInput],
		['inherited key toString', { ticketMad: 25_000, scenario: 'toString' } as unknown as SimulationInput],
		['inherited key constructor', { ticketMad: 25_000, scenario: 'constructor' } as unknown as SimulationInput],
		['unknown key', { ticketMad: 25_000, scenario: 'wild' } as unknown as SimulationInput],
		['null scenario', { ticketMad: 25_000, scenario: null } as unknown as SimulationInput],
		['NaN yield', bad({ grossYield: Number.NaN })],
		['string yield', bad({ grossYield: '0.08' })],
		['vacancy + reserve at 1', bad({ vacancy: 0.5, rentReserve: 0.5 })],
		['priceGrowth at -1', bad({ priceGrowth: -1 })],
		['rentIndexation below -1', bad({ rentIndexation: -2 })],
		['non-boolean depreciation', bad({ useDepreciation: 'yes' })],
	])('throws RangeError for %s', (_name, input) => {
		expect(() => simulate(input)).toThrow(RangeError);
	});

	it('accepts a hold of exactly 50 and a ticket equal to the raise', () => {
		expect(simulate({ ticketMad: 25_000, scenario: 'base', holdYears: 50 }).perYear).toHaveLength(50);
		expect(simulate({ ticketMad: 5_000_000, scenario: 'base' }).share).toBe(1);
	});
});
