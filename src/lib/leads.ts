import type { UIMessage } from "ai";
import type { Lead } from "@/generated/prisma/client";
import { db } from "./db";
import { textMessage } from "./messages";
import { leadAnalysisSchema, type LeadAnalysis } from "./schemas";

export type LeadRecord = Omit<Lead, "analysis"> & { analysis: LeadAnalysis };

const CHAT_HISTORY_LIMIT = 30;

// The analysis column is plain JSON to Postgres; parse it on the way out so the rest of
// the app can rely on its shape.
function toRecord(lead: Lead): LeadRecord {
  return { ...lead, analysis: leadAnalysisSchema.parse(lead.analysis) };
}

export async function listLeads(): Promise<LeadRecord[]> {
  const leads = await db.lead.findMany({
    orderBy: [{ score: "desc" }, { createdAt: "desc" }],
  });
  return leads.map(toRecord);
}

export async function getLead(id: string): Promise<LeadRecord | null> {
  const lead = await db.lead.findUnique({ where: { id } });
  return lead && toRecord(lead);
}

export async function getChatHistory(leadId: string): Promise<UIMessage[]> {
  const latest = await db.chatMessage.findMany({
    where: { leadId },
    orderBy: { createdAt: "desc" },
    take: CHAT_HISTORY_LIMIT,
  });
  return latest.reverse().map((m) => textMessage(m.id, m.role === "user" ? "user" : "assistant", m.content));
}
