import { analyzeLead } from "@/lib/ai/analyze";
import { aiErrorResponse, invalidInput, readJson } from "@/lib/api";
import { db } from "@/lib/db";
import { leadInputSchema, type LeadAnalysis } from "@/lib/schemas";
import { scoreLead } from "@/lib/scoring";

export async function POST(request: Request) {
  const parsed = leadInputSchema.safeParse(await readJson(request));
  if (!parsed.success) return invalidInput(parsed.error);

  let analysis: LeadAnalysis;
  try {
    analysis = await analyzeLead(parsed.data);
  } catch (error) {
    return aiErrorResponse(error);
  }

  const { score, tier } = scoreLead(analysis.signals);
  const lead = await db.lead.create({
    data: { ...parsed.data, analysis, score, tier },
    select: { id: true },
  });

  return Response.json(lead, { status: 201 });
}
