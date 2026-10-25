import { LIMITS, simulate, type SimulationResult } from "@/lib/finance";

/**
 * The ticket the pricing card is worked out for. Only the Individual plan is shown: Family Circle,
 * institutional and analytics plans are out of scope until Gate 3, so the landing does not advertise them.
 *
 * Labels and one-liners live in `messages/<locale>/pricing.json` under `plans.items.<id>`.
 */
export type PlanId = "individual";

export interface Plan {
  id: PlanId;
  ticketMad: number;
}

export const PLANS: readonly Plan[] = [{ id: "individual", ticketMad: LIMITS.MIN_TICKET_MAD }];

export interface PlanFigures {
  base: SimulationResult;
  pessimistic: SimulationResult;
}

/** Every plan figure comes from the engine at the plan's own ticket: Base, with Pessimistic beside it. */
export function planFigures(plan: Plan): PlanFigures {
  return {
    base: simulate({ ticketMad: plan.ticketMad, scenario: "base" }),
    pessimistic: simulate({ ticketMad: plan.ticketMad, scenario: "pessimistic" }),
  };
}
