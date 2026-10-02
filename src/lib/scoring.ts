import type { LeadSignals } from "./schemas";

export type Tier = "HOT" | "WARM" | "COLD";
export type Factor = keyof LeadSignals;

export const WEIGHTS = {
  urgency: { immediate: 35, within_3_months: 25, within_6_months: 12, exploring: 3 },
  commitment: { high: 30, medium: 18, low: 5 },
  budgetFit: { strong: 25, stretch: 15, unknown: 8, unrealistic: 0 },
  objectionSeverity: { none: 10, minor: 5, major: 0 },
} as const satisfies { [F in Factor]: Record<LeadSignals[F]["level"], number> };

export const HOT_THRESHOLD = 70;
export const WARM_THRESHOLD = 45;

export function pointsFor(signals: LeadSignals, factor: Factor): number {
  const levels: Record<string, number> = WEIGHTS[factor];
  return levels[signals[factor].level];
}

export function maxPointsFor(factor: Factor): number {
  return Math.max(...Object.values(WEIGHTS[factor]));
}

export function tierFor(score: number): Tier {
  if (score >= HOT_THRESHOLD) return "HOT";
  if (score >= WARM_THRESHOLD) return "WARM";
  return "COLD";
}

export function scoreLead(signals: LeadSignals): { score: number; tier: Tier } {
  const factors = Object.keys(WEIGHTS) as Factor[];
  const score = factors.reduce((sum, factor) => sum + pointsFor(signals, factor), 0);
  return { score, tier: tierFor(score) };
}
