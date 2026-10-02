import { generateText } from "ai";
import type { Language } from "@/lib/schemas";
import { model } from "./model";

const TARGETS: Record<Language, { name: string; rule: string }> = {
  english: { name: "English", rule: "Simple, warm Indian English." },
  hindi: {
    name: "Hindi in Devanagari script",
    rule: "Hindi written entirely in Devanagari script (देवनागरी). Only BHK, EMI and names of people, places or projects may stay in Latin letters.",
  },
  hinglish: {
    name: "Hinglish",
    rule: "Hinglish: Hindi written in Latin script, mixed naturally with English, the way people text on WhatsApp in India.",
  },
};

export async function translateReply(draft: string, language: Language): Promise<string> {
  const target = TARGETS[language];
  const { text } = await generateText({
    model,
    instructions: `You rewrite a WhatsApp message from a real-estate salesperson to a customer.
- Target language: ${target.rule}
- Keep the meaning, every fact and the proposed next step. Do not add new claims.
- Keep tense and commitments exactly: "we will shortlist" must not become "we have shortlisted".
- In Hindi and Hinglish, write as "hum" (the team) so the message works whoever sends it.
- Same length or shorter. Plain text: no markdown, no quotes around the message.
Return only the rewritten message.`,
    prompt: `Rewrite this message in ${target.name}:\n\n${draft}`,
  });
  return text.trim();
}
