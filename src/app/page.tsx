import Link from "next/link";
import { ScoreBadge, TIERS } from "@/components/tier";
import { buttonStyles } from "@/components/ui";
import { timeAgo } from "@/lib/format";
import { listLeads, type LeadRecord } from "@/lib/leads";
import type { Tier } from "@/lib/scoring";

export const dynamic = "force-dynamic";

const TIER_ORDER: Tier[] = ["HOT", "WARM", "COLD"];

export default async function LeadsPage() {
  const leads = await listLeads();

  if (leads.length === 0) {
    return (
      <div className="mx-auto max-w-md py-24 text-center">
        <h1 className="text-lg font-semibold">No leads yet</h1>
        <p className="mt-2 text-sm text-stone-600">
          Add an enquiry, paste a chat, or record a voice note. Each lead is analysed and ranked as soon as
          you save it.
        </p>
        <Link href="/leads/new" className={`${buttonStyles("primary")} mt-6`}>
          Add your first lead
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Leads</h1>
        <p className="mt-1 text-sm text-stone-600">
          {leads.length} leads, highest score first.{" "}
          {TIER_ORDER.map(
            (tier) => `${leads.filter((l) => l.tier === tier).length} ${TIERS[tier].label.toLowerCase()}`,
          ).join(" · ")}
        </p>
      </div>

      {TIER_ORDER.map((tier) => {
        const group = leads.filter((lead) => lead.tier === tier);
        if (group.length === 0) return null;
        return (
          <section key={tier} aria-labelledby={`tier-${tier}`}>
            <h2 id={`tier-${tier}`} className="mb-3 flex items-baseline gap-2">
              <span className="font-semibold">{TIERS[tier].label}</span>
              <span className="text-sm text-stone-500">{TIERS[tier].action}</span>
            </h2>
            <ul className="divide-y divide-stone-200 overflow-hidden rounded-lg border border-stone-200 bg-white">
              {group.map((lead) => (
                <LeadRow key={lead.id} lead={lead} />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function LeadRow({ lead }: { lead: LeadRecord }) {
  const { analysis } = lead;
  const blocker = analysis.signals.objectionSeverity.level === "major" ? analysis.objections[0] : null;

  return (
    <li>
      <Link
        href={`/leads/${lead.id}`}
        className="grid grid-cols-[auto_minmax(0,1fr)] gap-4 px-4 py-4 transition-colors hover:bg-stone-50 sm:grid-cols-[auto_minmax(0,1fr)_11rem]"
      >
        <ScoreBadge score={lead.score} tier={lead.tier} />

        <div className="min-w-0 space-y-1">
          <p className="flex items-baseline gap-2">
            <span className="shrink-0 font-medium">{lead.name}</span>
            <span className="truncate text-sm text-stone-500">{lead.location}</span>
          </p>
          <p className="text-sm text-stone-600">{analysis.intent}</p>
          <p className="text-sm">
            <span className="font-medium text-stone-500">Next: </span>
            {analysis.nextAction}
          </p>
          {blocker && (
            <p className="text-sm text-red-700">
              <span className="font-medium">Blocker: </span>
              {blocker}
            </p>
          )}
        </div>

        <dl className="col-start-2 flex flex-wrap gap-x-3 text-sm text-stone-500 sm:col-start-3 sm:block sm:text-right">
          <dt className="sr-only">Budget</dt>
          <dd className="text-stone-700">{lead.budget}</dd>
          <dt className="sr-only">Timeline</dt>
          <dd>{lead.timeline}</dd>
          <dt className="sr-only">Added</dt>
          <dd>{timeAgo(lead.createdAt)}</dd>
        </dl>
      </Link>
    </li>
  );
}
