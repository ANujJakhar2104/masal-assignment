import { convertToModelMessages, createUIMessageStreamResponse, streamText, toUIMessageStream } from "ai";
import { z } from "zod";
import { chatInstructions } from "@/lib/ai/chat";
import { model } from "@/lib/ai/model";
import { describeAiError, invalidInput, leadNotFound, readJson } from "@/lib/api";
import { db } from "@/lib/db";
import { getChatHistory, getLead } from "@/lib/leads";
import { messageText, textMessage } from "@/lib/messages";

// The client sends only the new question. History and lead context come from the
// database, so the conversation can't drift from what is actually stored.
const chatRequestSchema = z.object({
  text: z.string().trim().min(1).max(2000),
  draft: z.string().max(4000).default(""),
});

export async function POST(request: Request, ctx: RouteContext<"/api/leads/[id]/chat">) {
  const { id } = await ctx.params;
  const parsed = chatRequestSchema.safeParse(await readJson(request));
  if (!parsed.success) return invalidInput(parsed.error);

  const [lead, history] = await Promise.all([getLead(id), getChatHistory(id)]);
  if (!lead) return leadNotFound();

  const askedAt = new Date();
  const messages = [...history, textMessage(crypto.randomUUID(), "user", parsed.data.text)];

  const result = streamText({
    model,
    instructions: chatInstructions(lead, parsed.data.draft),
    messages: await convertToModelMessages(messages),
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      originalMessages: messages,
      onError: (error) => {
        console.error(error);
        return describeAiError(error).message;
      },
      onEnd: async ({ responseMessage, outcome }) => {
        const answer = messageText(responseMessage);
        if (outcome.status !== "completed" || !answer) return;

        await db.chatMessage.createMany({
          data: [
            { leadId: id, role: "user", content: parsed.data.text, createdAt: askedAt },
            { leadId: id, role: "assistant", content: answer, createdAt: new Date() },
          ],
        });
      },
    }),
  });
}
