import { humanize } from "@/lib/format";
import type { LeadRecord } from "@/lib/leads";
import { maxPointsFor, pointsFor, type Factor } from "@/lib/scoring";
import { SectionLabel } from "./ui";

const FACTOR_LABELS: Record<Factor, string> = {
  urgency: "Urgency",
  commitment: "Commitment",
  budgetFit: "Budget fit",
  objectionSeverity: "Objections",
};

export function AnalysisPanel({ lead }: { lead: LeadRecord }) {
  const { analysis } = lead;

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-stone-900 p-5 text-white">
        <p className="text-xs font-semibold tracking-wide text-stone-400 uppercase">Next action</p>
        <p className="mt-1 text-lg leading-snug font-medium">{analysis.nextAction}</p>
      </div>

      <section className="space-y-2">
        <SectionLabel>Summary</SectionLabel>
        <p className="leading-relaxed">{analysis.summary}</p>
        <p className="text-stone-600">
          <span className="font-medium text-stone-900">What they really want: </span>
          {analysis.intent}
        </p>
      </section>

      <div className="grid gap-6 sm:grid-cols-2">
        <section className="space-y-2">
          <SectionLabel>Key requirements</SectionLabel>
          <BulletList items={analysis.keyRequirements} empty="None stated" />
        </section>
        <section className="space-y-2">
          <SectionLabel>Objections and concerns</SectionLabel>
          <BulletList items={analysis.objections} empty="None raised" tone="warning" />
        </section>
      </div>

      <section className="space-y-3">
        <SectionLabel>Why this score</SectionLabel>
        <ul className="divide-y divide-stone-200 rounded-lg border border-stone-200 bg-white">
          {(Object.keys(FACTOR_LABELS) as Factor[]).map((factor) => {
            const signal = analysis.signals[factor];
            const points = pointsFor(analysis.signals, factor);
            const max = maxPointsFor(factor);
            return (
              <li
                key={factor}
                className="grid grid-cols-[7rem_minmax(0,1fr)_auto] items-start gap-3 px-4 py-3 text-sm"
              >
                <span className="text-stone-500">{FACTOR_LABELS[factor]}</span>
                <div className="min-w-0">
                  <p className="font-medium">{humanize(signal.level)}</p>
                  <p className="text-stone-500">{signal.evidence}</p>
                </div>
                <span className="font-mono text-stone-700 tabular-nums">
                  +{points}
                  <span className="text-stone-400">/{max}</span>
                </span>
              </li>
            );
          })}
        </ul>
        <p className="text-xs text-stone-500">
          The model classifies each signal. Points and the total are calculated in code, so the same signals
          always give the same score.
        </p>
      </section>

      <details className="group rounded-lg border border-stone-200 bg-white">
        <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-stone-700 select-none">
          Original customer message
        </summary>
        <p className="border-t border-stone-200 px-4 py-3 text-sm whitespace-pre-wrap text-stone-700">
          {lead.message}
        </p>
      </details>
    </div>
  );
}

function BulletList({ items, empty, tone }: { items: string[]; empty: string; tone?: "warning" }) {
  if (items.length === 0) return <p className="text-sm text-stone-500">{empty}</p>;
  const marker = tone === "warning" ? "bg-amber-500" : "bg-stone-400";
  return (
    <ul className="space-y-1.5">
      {items.map((item) => (
        <li key={item} className="flex gap-2.5 text-sm">
          <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${marker}`} />
          {item}
        </li>
      ))}
    </ul>
  );
}
