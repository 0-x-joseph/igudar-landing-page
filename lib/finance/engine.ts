/**
 * Simulation engine: fees, taxes, cash flows and investor returns.
 * Implements FINANCE_ENGINE_SPEC.md section 4 verbatim. Full floating point
 * throughout; rounding happens only in format.ts.
 */
import { FEE_GRID, FEE_LINES, LIMITS, TAX, type FeeLine } from './fee-grid';
import { formatMad } from './format';
import { irr } from './irr';
import { MODEL_SCENARIOS, SCENARIO_KEYS, type ScenarioAssumptions, type ScenarioKey } from './scenarios';

/** Upper bound on the hold, so a typo cannot allocate a huge cash-flow array. */
const MAX_HOLD_YEARS = 50;

export interface SimulationInput {
	ticketMad: number;
	scenario: ScenarioKey | ScenarioAssumptions;
	/** Defaults to 5 (LIMITS.HOLD_YEARS). */
	holdYears?: number;
	/** Capital raised by the SAS. Defaults to 5,000,000 (LIMITS.MAX_RAISE_MAD). */
	raiseMad?: number;
}

/** Per-SAS figures for one year, except investorNetMad which is the investor's share. */
export interface YearRow {
	readonly year: number;
	readonly rentMad: number;
	readonly cashMad: number;
	readonly depreciationMad: number;
	readonly cotisationMinimaleMad: number;
	readonly isMad: number;
	readonly dividendMad: number;
	readonly investorNetMad: number;
}

/** Per-SAS exit figures, except investorNetMad which is the investor's share. */
export interface ExitBlock {
	readonly saleMad: number;
	readonly costsMad: number;
	readonly gainMad: number;
	readonly proceedsMad: number;
	readonly performanceFeeMad: number;
	readonly surplusMad: number;
	readonly investorNetMad: number;
}

/** Where each 100 MAD of year-1 gross rent goes. */
export interface RentBridge {
	readonly reserveVacancy: number;
	readonly platformFee: number;
	readonly is: number;
	readonly withholding: number;
	readonly investor: number;
}

export type FeeLineWithAmount = FeeLine & { amountMad: number | null };

export interface SimulationResult {
	readonly input: Readonly<
		Required<SimulationInput> & {
			scenarioKey: ScenarioKey | 'custom';
			assumptions: Readonly<ScenarioAssumptions>;
		}
	>;
	readonly share: number;
	readonly perYear: readonly YearRow[];
	readonly exit: ExitBlock;
	/** Index 0 is the outlay (negative); index t is year t. */
	readonly cashFlows: readonly number[];
	readonly netIrr: number | null;
	readonly netCashYear1Mad: number;
	readonly netCashYieldYear1: number;
	readonly netExitProceedsMad: number;
	readonly netProfitMad: number;
	readonly moneyMultiple: number;
	readonly bankDepositProfitMad: number;
	readonly beatsBankDeposit: boolean;
	readonly rentBridge: RentBridge;
	readonly feeLines: readonly FeeLineWithAmount[];
}

const TVA_FACTOR = 1 + TAX.TVA_ON_FEES;

function assertPositiveFinite(value: number, name: string): void {
	if (!Number.isFinite(value) || value <= 0) {
		throw new RangeError(`${name} must be a finite number greater than 0`);
	}
}

function assertHoldYears(holdYears: number): void {
	if (!Number.isInteger(holdYears) || holdYears < 1 || holdYears > MAX_HOLD_YEARS) {
		throw new RangeError(`holdYears must be an integer between 1 and ${MAX_HOLD_YEARS}`);
	}
}

function assertAssumptions(a: ScenarioAssumptions): void {
	const numeric: ReadonlyArray<keyof ScenarioAssumptions> = [
		'grossYield',
		'rentIndexation',
		'vacancy',
		'rentReserve',
		'priceGrowth',
		'sellerCostsAtExit',
	];
	for (const field of numeric) {
		const value = a[field];
		if (typeof value !== 'number' || !Number.isFinite(value)) {
			throw new RangeError(`scenario.${field} must be a finite number`);
		}
	}
	if (typeof a.useDepreciation !== 'boolean') {
		throw new RangeError('scenario.useDepreciation must be a boolean');
	}
	if (a.vacancy + a.rentReserve >= 1) {
		throw new RangeError('scenario.vacancy + scenario.rentReserve must be below 1');
	}
	if (a.priceGrowth <= -1 || a.rentIndexation <= -1) {
		throw new RangeError('scenario.priceGrowth and scenario.rentIndexation must be above -1');
	}
}

/** Resolves a key or custom assumptions to a private copy, rejecting prototype names like 'toString'. */
function resolveScenario(scenario: SimulationInput['scenario']): {
	key: ScenarioKey | 'custom';
	assumptions: ScenarioAssumptions;
} {
	if (typeof scenario === 'string') {
		if (!Object.hasOwn(MODEL_SCENARIOS, scenario)) throw new RangeError(`unknown scenario: ${scenario}`);
		return { key: scenario, assumptions: { ...MODEL_SCENARIOS[scenario] } };
	}
	if (typeof scenario !== 'object' || scenario === null) throw new RangeError('scenario must be a key or assumptions');
	assertAssumptions(scenario);
	return { key: 'custom', assumptions: { ...scenario } };
}

/**
 * Runs the full per-SAS calculation, then the investor's share (spec section 4).
 * Does not enforce the ticket minimum or caps (use fee-grid for that), so the
 * 10,000 MAD reference vectors can be reproduced.
 * @throws RangeError on a non-positive ticket or raise, a ticket above the raise,
 * a hold that is not an integer in 1..50, or invalid scenario assumptions.
 */
export function simulate(input: SimulationInput): SimulationResult {
	return run(input);
}

/** Shared implementation; `keyOverride` lets simulateAll label a run with its slot key. */
function run(input: SimulationInput, keyOverride?: ScenarioKey): SimulationResult {
	const ticket = input.ticketMad;
	const holdYears = input.holdYears ?? LIMITS.HOLD_YEARS;
	const raise = input.raiseMad ?? LIMITS.MAX_RAISE_MAD;
	assertPositiveFinite(ticket, 'ticketMad');
	assertPositiveFinite(raise, 'raiseMad');
	assertHoldYears(holdYears);
	if (ticket > raise) throw new RangeError('ticketMad cannot exceed raiseMad');

	const resolved = resolveScenario(input.scenario);
	const a = resolved.assumptions;
	const scenarioKey = keyOverride ?? resolved.key;

	const price = raise / (1 + LIMITS.ACQUISITION_COSTS);
	const share = ticket / raise;
	const platformFeeYear = raise * FEE_GRID.D2_PLATFORM_HT * TVA_FACTOR;
	const depreciationYear = a.useDepreciation
		? price * TAX.DEPRECIATION_BUILDING_SHARE * TAX.DEPRECIATION_RATE
		: 0;

	const perYear: YearRow[] = [];
	let sumDep = 0;
	let sumDiv = 0;
	for (let t = 1; t <= holdYears; t++) {
		const rent = price * a.grossYield * Math.pow(1 + a.rentIndexation, t - 1);
		const cash = rent * (1 - a.vacancy - a.rentReserve) - platformFeeYear;
		const cm = t > TAX.CM_EXEMPT_YEARS ? Math.max(TAX.CM_FLOOR_MAD, TAX.CM_RATE * rent) : 0;
		const is = Math.max(TAX.IS_RATE * Math.max(0, cash - depreciationYear), cm);
		const dividend = cash - is;
		sumDep += depreciationYear;
		sumDiv += dividend;
		perYear.push({
			year: t,
			rentMad: rent,
			cashMad: cash,
			depreciationMad: depreciationYear,
			cotisationMinimaleMad: cm,
			isMad: is,
			dividendMad: dividend,
			// Spec-literal: withholding is applied even when the dividend is negative
			// (a loss year), which understates the loss. Revisit if the model changes.
			investorNetMad: share * dividend * (1 - TAX.WITHHOLDING_INDIVIDUAL),
		});
	}

	const sale = price * Math.pow(1 + a.priceGrowth, holdYears);
	const costs = sale * a.sellerCostsAtExit + sale * FEE_GRID.D3_EXIT_HT * TVA_FACTOR;
	const gain = Math.max(0, sale - costs - (raise - sumDep));
	const proceeds = sale - costs - TAX.IS_RATE * gain;
	const hurdleValue = raise * Math.pow(1 + FEE_GRID.D5_HURDLE, holdYears);
	const performanceFee = FEE_GRID.D5_PERFORMANCE * TVA_FACTOR * Math.max(0, sumDiv + proceeds - hurdleValue);
	const surplus = Math.max(0, proceeds - performanceFee - raise);
	const exitInvestorNet = share * (proceeds - performanceFee - surplus * TAX.WITHHOLDING_INDIVIDUAL);

	// D1 and any dossier/onboarding fee are 0 today, so upfront = ticket.
	const cashFlows: number[] = [-ticket * (1 + FEE_GRID.D1_ENTRY * TVA_FACTOR)];
	for (const row of perYear) {
		cashFlows.push(row.investorNetMad + (row.year === holdYears ? exitInvestorNet : 0));
	}

	// Profit and multiple are measured against the ticket, which equals the upfront
	// outlay while D1 = 0. If an entry fee is introduced, switch these to -cashFlows[0].
	const netProfit = cashFlows.slice(1).reduce((sum, cf) => sum + cf, 0) - ticket;
	const bankProfit = ticket * (Math.pow(1 + LIMITS.BANK_DEPOSIT_RATE, holdYears) - 1);
	const year1 = perYear[0];

	return {
		input: {
			ticketMad: ticket,
			scenario: input.scenario,
			holdYears,
			raiseMad: raise,
			scenarioKey,
			assumptions: a,
		},
		share,
		perYear,
		exit: {
			saleMad: sale,
			costsMad: costs,
			gainMad: gain,
			proceedsMad: proceeds,
			performanceFeeMad: performanceFee,
			surplusMad: surplus,
			investorNetMad: exitInvestorNet,
		},
		cashFlows,
		netIrr: irr(cashFlows),
		// From the year row, not cashFlows[1]: with a 1-year hold that entry includes the exit.
		netCashYear1Mad: year1.investorNetMad,
		netCashYieldYear1: year1.investorNetMad / ticket,
		netExitProceedsMad: exitInvestorNet,
		netProfitMad: netProfit,
		moneyMultiple: (ticket + netProfit) / ticket,
		bankDepositProfitMad: bankProfit,
		beatsBankDeposit: netProfit > bankProfit,
		rentBridge: rentBridge(a, year1, raise),
		feeLines: feeLinesForTicket(ticket, holdYears),
	};
}

function rentBridge(a: ScenarioAssumptions, year1: YearRow, raise: number): RentBridge {
	const rent = year1.rentMad;
	// A zero-rent property has no meaningful split; report zeros rather than NaN.
	if (rent <= 0) {
		return { reserveVacancy: 0, platformFee: 0, is: 0, withholding: 0, investor: 0 };
	}
	const per100 = 100 / rent;
	return {
		reserveVacancy: (a.vacancy + a.rentReserve) * 100,
		platformFee: raise * FEE_GRID.D2_PLATFORM_HT * TVA_FACTOR * per100,
		is: year1.isMad * per100,
		withholding: TAX.WITHHOLDING_INDIVIDUAL * year1.dividendMad * per100,
		investor: (1 - TAX.WITHHOLDING_INDIVIDUAL) * year1.dividendMad * per100,
	};
}

/**
 * Simulates all three scenarios side by side (the pessimistic case is never hidden, spec section 6).
 * @param scenarios Defaults to MODEL_SCENARIOS; pass scenariosForGrossYield(...) for a property.
 */
export function simulateAll(
	ticketMad: number,
	scenarios: Readonly<Record<ScenarioKey, ScenarioAssumptions>> = MODEL_SCENARIOS,
	opts: { holdYears?: number; raiseMad?: number } = {},
): Record<ScenarioKey, SimulationResult> {
	const out = {} as Record<ScenarioKey, SimulationResult>;
	for (const key of SCENARIO_KEYS) {
		out[key] = run({ ticketMad, scenario: scenarios[key], ...opts }, key);
	}
	return out;
}

/**
 * D4 secondary-transfer fee paid by the selling associate: 1.5 % of the amount traded.
 * Spec section 2 / 4. Computed HT: the vectors' definition applies no TVA, so TVA is
 * not added here. Registration duty and tax on gain are "to confirm with counsel" and excluded.
 */
export function earlyExitFeeMad(amountMad: number): number {
	if (!Number.isFinite(amountMad) || amountMad < 0) {
		throw new RangeError('amountMad must be a finite number of at least 0');
	}
	return amountMad * FEE_GRID.D4_TRANSFER_HT;
}

/**
 * Fee table for one ticket (spec section 2). D2 is the yearly amount on the ticket,
 * HT, with the TTC figure in the label. D3 and D5 depend on the sale, S1 and S2 are
 * not paid by the investor, so their amounts are null.
 */
export function feeLinesForTicket(ticketMad: number, holdYears: number = LIMITS.HOLD_YEARS): FeeLineWithAmount[] {
	assertPositiveFinite(ticketMad, 'ticketMad');
	assertHoldYears(holdYears);
	return FEE_LINES.map((line): FeeLineWithAmount => {
		switch (line.code) {
			case 'D1':
				return { ...line, amountMad: ticketMad * FEE_GRID.D1_ENTRY };
			case 'D2': {
				const ht = ticketMad * FEE_GRID.D2_PLATFORM_HT;
				const ttc = ht * TVA_FACTOR;
				return {
					...line,
					label: `${line.label}: ${formatMad(ht)}/yr HT (${formatMad(ttc)} TTC) over ${holdYears} years`,
					amountMad: ht,
				};
			}
			case 'D3':
			case 'D5':
				return { ...line, when: 'At exit, depends on sale price', amountMad: null };
			default:
				return { ...line, amountMad: null };
		}
	});
}
