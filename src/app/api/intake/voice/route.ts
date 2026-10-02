import { extractLeadFromAudio } from "@/lib/ai/voice";
import { aiErrorResponse } from "@/lib/api";

// Vercel rejects request bodies over 4.5 MB; 4 MB of compressed audio is several minutes.
const MAX_AUDIO_BYTES = 4 * 1024 * 1024;

// Browsers often leave File.type empty for WhatsApp exports (.opus), so fall back to the extension.
const TYPES_BY_EXTENSION: Record<string, string> = {
  opus: "audio/ogg",
  ogg: "audio/ogg",
  mp3: "audio/mpeg",
  m4a: "audio/mp4",
  aac: "audio/aac",
  wav: "audio/wav",
  webm: "audio/webm",
  flac: "audio/flac",
};

function audioType(file: File): string | null {
  const declared = file.type.split(";")[0];
  if (declared.startsWith("audio/")) return declared;
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  return TYPES_BY_EXTENSION[extension] ?? null;
}

export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  const file = form?.get("audio");
  const mediaType = file instanceof File ? audioType(file) : null;

  if (!(file instanceof File) || !mediaType) {
    return Response.json({ error: "Attach an audio recording." }, { status: 400 });
  }
  if (file.size > MAX_AUDIO_BYTES) {
    return Response.json({ error: "That recording is over 4 MB. Trim it and try again." }, { status: 413 });
  }

  try {
    const intake = await extractLeadFromAudio(new Uint8Array(await file.arrayBuffer()), mediaType);
    return Response.json(intake);
  } catch (error) {
    return aiErrorResponse(error);
  }
}
