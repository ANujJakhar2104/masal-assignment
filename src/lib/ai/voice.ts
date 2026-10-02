import { generateText, Output } from "ai";
import { voiceIntakeSchema, type VoiceIntake } from "@/lib/schemas";
import { model } from "./model";

const INSTRUCTIONS = `You turn a voice recording about a property enquiry into a lead form. The recording is either the customer's own voice note or a salesperson dictating notes after a call.

- Transcribe faithfully. Write Hindi in Devanagari and keep English words in English.
- Fill a field only if it is said or clearly implied. Otherwise return null. Never guess.
- The name is the customer's, never the salesperson's.
- Map the timeline to the closest option.`;

export async function extractLeadFromAudio(audio: Uint8Array, mediaType: string): Promise<VoiceIntake> {
  const { output } = await generateText({
    model,
    instructions: INSTRUCTIONS,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "Extract the lead from this recording." },
          { type: "file", mediaType, data: audio },
        ],
      },
    ],
    output: Output.object({ name: "voice_intake", schema: voiceIntakeSchema }),
  });
  return output;
}
