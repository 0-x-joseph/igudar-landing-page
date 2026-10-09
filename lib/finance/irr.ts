/**
 * Internal rate of return. Implements the "net IRR" output of
 * FINANCE_ENGINE_SPEC.md section 4: Newton-Raphson with a bisection fallback.
 */

const MAX_ITERATIONS = 100;
const TOLERANCE = 1e-10;
const RESIDUAL_TOLERANCE = 1e-6;
// Below -100 % the discount factor is undefined; the bracket is a sane product range.
const LOWER_BOUND = -0.99;
const UPPER_BOUND = 10;

/**
 * Net present value of annual cash flows, the first one at t = 0.
 * @param rate Annual discount rate as a fraction.
 */
export function npv(rate: number, cashFlows: readonly number[]): number {
	let total = 0;
	for (let t = 0; t < cashFlows.length; t++) {
		total += cashFlows[t] / Math.pow(1 + rate, t);
	}
	return total;
}

function npvDerivative(rate: number, cashFlows: readonly number[]): number {
	let total = 0;
	for (let t = 1; t < cashFlows.length; t++) {
		total -= (t * cashFlows[t]) / Math.pow(1 + rate, t + 1);
	}
	return total;
}

function hasSignChange(cashFlows: readonly number[]): boolean {
	let positive = false;
	let negative = false;
	for (const cf of cashFlows) {
		if (cf > 0) positive = true;
		if (cf < 0) negative = true;
	}
	return positive && negative;
}

function newton(cashFlows: readonly number[], guess: number): number | null {
	let rate = guess;
	for (let i = 0; i < MAX_ITERATIONS; i++) {
		if (!Number.isFinite(rate) || rate <= LOWER_BOUND || rate > UPPER_BOUND) return null;
		const derivative = npvDerivative(rate, cashFlows);
		if (derivative === 0 || !Number.isFinite(derivative)) return null;
		const next = rate - npv(rate, cashFlows) / derivative;
		if (Math.abs(next - rate) < TOLERANCE) {
			// A tiny step can also mean a flat spot, so confirm the residual is near zero,
			// scaled to the size of the flows so large tickets are not rejected by rounding.
			const scale = Math.max(1, ...cashFlows.map(Math.abs));
			const inBracket = next > LOWER_BOUND && next <= UPPER_BOUND;
			return inBracket && Math.abs(npv(next, cashFlows)) < RESIDUAL_TOLERANCE * scale ? next : null;
		}
		rate = next;
	}
	return null;
}

function bisect(cashFlows: readonly number[]): number | null {
	let lo = LOWER_BOUND;
	let hi = UPPER_BOUND;
	let fLo = npv(lo, cashFlows);
	const fHi = npv(hi, cashFlows);
	if (fLo === 0) return lo;
	if (fHi === 0) return hi;
	if (fLo * fHi > 0) return null;
	for (let i = 0; i < 200; i++) {
		const mid = (lo + hi) / 2;
		const fMid = npv(mid, cashFlows);
		if (fMid === 0 || (hi - lo) / 2 < TOLERANCE) return mid;
		if (fLo * fMid < 0) {
			hi = mid;
		} else {
			lo = mid;
			fLo = fMid;
		}
	}
	return (lo + hi) / 2;
}

/**
 * IRR of annual cash flows. Returns null when it is undefined: empty input,
 * non-finite values, no sign change, or no root inside [-99 %, 1000 %].
 */
export function irr(cashFlows: readonly number[], guess = 0.05): number | null {
	if (cashFlows.length === 0 || !cashFlows.every(Number.isFinite)) return null;
	if (!hasSignChange(cashFlows)) return null;
	return newton(cashFlows, guess) ?? bisect(cashFlows);
}
