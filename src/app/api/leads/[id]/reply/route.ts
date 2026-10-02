import { z } from "zod";
import { translateReply } from "@/lib/ai/reply";
import { aiErrorResponse, invalidInput, leadNotFound, readJson } from "@/lib/api";
import { db } from "@/lib/db";
import { LANGUAGES } from "@/lib/schemas";

const replyRequestSchema = z.object({
  draft: z.string().trim().min(1).max(4000),
  language: z.enum(LANGUAGES),
});

export async function POST(request: Request, ctx: RouteContext<"/api/leads/[id]/reply">) {
  const { id } = await ctx.params;
  const parsed = replyRequestSchema.safeParse(await readJson(request));
  if (!parsed.success) return invalidInput(parsed.error);

  const exists = await db.lead.count({ where: { id } });
  if (!exists) return leadNotFound();

  try {
    const text = await translateReply(parsed.data.draft, parsed.data.language);
    return Response.json({ text });
  } catch (error) {
    return aiErrorResponse(error);
  }
}
