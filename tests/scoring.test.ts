import { describe, expect, it } from "vitest";
import type { LeadSignals } from "@/lib/schemas";
import { HOT_THRESHOLD, maxPointsFor, scoreLead, tierFor, WEIGHTS, WARM_THRESHOLD } from "@/lib/scoring";

function signals(levels: {
  urgency: LeadSignals["urgency"]["level"];
  commitment: LeadSignals["commitment"]["level"];
  budgetFit: LeadSignals["budgetFit"]["level"];
  objectionSeverity: LeadSignals["objectionSeverity"]["level"];
}): LeadSignals {
  return {
    urgency: { level: levels.urgency, evidence: "" },
    commitment: { level: levels.commitment, evidence: "" },
    budgetFit: { level: levels.budgetFit, evidence: "" },
    objectionSeverity: { level: levels.objectionSeverity, evidence: "" },
  };
}

describe("scoreLead", () => {
  it("gives the best possible lead 100 and marks it HOT", () => {
    const result = scoreLead(
      signals({ urgency: "immediate", commitment: "high", budgetFit: "strong", objectionSeverity: "none" }),
    );
    expect(result).toEqual({ score: 100, tier: "HOT" });
  });

  it("marks a browsing enquiry with no budget as COLD", () => {
    const result = scoreLead(
      signals({ urgency: "exploring", commitment: "low", budgetFit: "unknown", objectionSeverity: "none" }),
    );
    expect(result).toEqual({ score: 26, tier: "COLD" });
  });

  it("keeps an urgent, serious buyer with an unrealistic budget and a blocker out of HOT", () => {
    const result = scoreLead(
      signals({
        urgency: "immediate",
        commitment: "high",
        budgetFit: "unrealistic",
        objectionSeverity: "major",
      }),
    );
    expect(result).toEqual({ score: 65, tier: "WARM" });
  });

  it("is deterministic for the same signals", () => {
    const input = signals({
      urgency: "within_3_months",
      commitment: "medium",
      budgetFit: "stretch",
      objectionSeverity: "minor",
    });
    expect(scoreLead(input)).toEqual(scoreLead(input));
    expect(scoreLead(input).score).toBe(63);
  });

  it("never scores a lead lower when a single signal improves", () => {
    const base = signals({
      urgency: "within_6_months",
      commitment: "medium",
      budgetFit: "unknown",
      objectionSeverity: "minor",
    });
    const better = { ...base, urgency: { level: "immediate" as const, evidence: "" } };
    expect(scoreLead(better).score).toBeGreaterThan(scoreLead(base).score);
  });
});

describe("weights", () => {
  it("add up to a maximum of 100", () => {
    const factors = Object.keys(WEIGHTS) as (keyof typeof WEIGHTS)[];
    const max = factors.reduce((sum, factor) => sum + maxPointsFor(factor), 0);
    expect(max).toBe(100);
  });
});

describe("tierFor", () => {
  it("applies thresholds inclusively", () => {
    expect(tierFor(HOT_THRESHOLD)).toBe("HOT");
    expect(tierFor(HOT_THRESHOLD - 1)).toBe("WARM");
    expect(tierFor(WARM_THRESHOLD)).toBe("WARM");
    expect(tierFor(WARM_THRESHOLD - 1)).toBe("COLD");
  });
});
