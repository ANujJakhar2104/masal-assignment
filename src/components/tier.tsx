import type { Tier } from "@/lib/scoring";

export const TIERS: Record<Tier, { label: string; action: string; badge: string; score: string }> = {
  HOT: {
    label: "Hot",
    action: "Call today",
    badge: "bg-red-50 text-red-700 ring-red-600/20",
    score: "bg-red-600 text-white",
  },
  WARM: {
    label: "Warm",
    action: "Follow up this week",
    badge: "bg-amber-50 text-amber-800 ring-amber-600/20",
    score: "bg-amber-400 text-amber-950",
  },
  COLD: {
    label: "Cold",
    action: "Nurture",
    badge: "bg-sky-50 text-sky-800 ring-sky-600/20",
    score: "bg-sky-100 text-sky-900",
  },
};

export function TierBadge({ tier }: { tier: Tier }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${TIERS[tier].badge}`}
    >
      {TIERS[tier].label}
    </span>
  );
}

export function ScoreBadge({ score, tier, size = "md" }: { score: number; tier: Tier; size?: "md" | "lg" }) {
  const dimensions = size === "lg" ? "h-12 w-12 text-lg" : "h-10 w-10 text-sm";
  return (
    <span
      title={`Score ${score} of 100`}
      className={`inline-flex shrink-0 items-center justify-center rounded-md font-mono font-semibold tabular-nums ${dimensions} ${TIERS[tier].score}`}
    >
      {score}
    </span>
  );
}
