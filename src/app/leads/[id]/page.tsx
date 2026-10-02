import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AnalysisPanel } from "@/components/analysis-panel";
import { LeadWorkspace } from "@/components/lead-workspace";
import { ScoreBadge, TierBadge } from "@/components/tier";
import { timeAgo } from "@/lib/format";
import { getChatHistory, getLead } from "@/lib/leads";

export const metadata: Metadata = { title: "Lead" };

export default async function LeadPage({ params }: PageProps<"/leads/[id]">) {
  const { id } = await params;
  const [lead, history] = await Promise.all([getLead(id), getChatHistory(id)]);
  if (!lead) notFound();

  const details = [lead.location, lead.requirement, lead.budget, lead.timeline, lead.phone].filter(Boolean);

  return (
    <div className="space-y-6">
      <Link href="/" className="text-sm text-stone-500 hover:text-stone-900">
        ← All leads
      </Link>

      <header className="flex items-start gap-4">
        <ScoreBadge score={lead.score} tier={lead.tier} size="lg" />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{lead.name}</h1>
            <TierBadge tier={lead.tier} />
          </div>
          <p className="mt-1 text-sm text-stone-600">
            {details.join(" · ")} · added {timeAgo(lead.createdAt)}
          </p>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_26rem]">
        <AnalysisPanel lead={lead} />
        <LeadWorkspace
          leadId={lead.id}
          phone={lead.phone}
          suggestedReply={lead.analysis.suggestedReply}
          language={lead.analysis.language}
          initialMessages={history}
        />
      </div>
    </div>
  );
}
