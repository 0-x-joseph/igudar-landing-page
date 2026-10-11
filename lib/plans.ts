import { LIMITS, simulate, type SimulationResult } from "@/lib/finance";

/**
 * The three ways to invest in one property. Only the ticket differs between them (the fee grid is the
 * same for everyone). 250,000 MAD is the professional minimum from the founder's pricing mock-up; the
 * individual and family tickets are the platform minimum from the fee grid.
 */
export const PROFESSIONAL_MIN_TICKET_MAD = 250_000;

export type PlanId = "individual" | "family" | "institutional";

export interface Plan {
  id: PlanId;
  eyebrow: string;
  title: string;
  audience: string;
  ticketMad: number;
}

export const PLANS: readonly Plan[] = [
  { id: "individual", eyebrow: "RETAIL", title: "Individual", audience: "For one person investing on their own.", ticketMad: LIMITS.MIN_TICKET_MAD },
  { id: "family", eyebrow: "FAMILY CIRCLE", title: "Family", audience: "For a family putting its tickets into the same property.", ticketMad: LIMITS.MIN_TICKET_MAD },
  { id: "institutional", eyebrow: "PROFESSIONAL", title: "Institutional", audience: "For companies, funds and business angels.", ticketMad: PROFESSIONAL_MIN_TICKET_MAD },
];

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
