import { google, type GoogleLanguageModelOptions } from "@ai-sdk/google";
import { APICallError, defaultSettingsMiddleware, wrapLanguageModel, type LanguageModelMiddleware } from "ai";

// Pinned rather than "-latest" so prompt behaviour doesn't change under us.
const PRIMARY_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash";

// Free-tier quotas are counted per model (5 requests/min on 3.5 Flash), so when the
// primary model is rate-limited or overloaded we retry once on Flash-Lite, which has
// its own quota.
const FALLBACK_MODEL = "gemini-3.5-flash-lite";

function isCapacityError(error: unknown) {
  return APICallError.isInstance(error) && (error.statusCode === 429 || error.statusCode === 503);
}

const fallback = google(FALLBACK_MODEL);

const fallbackOnCapacityError: LanguageModelMiddleware = {
  specificationVersion: "v4",
  wrapGenerate: async ({ doGenerate, params }) => {
    try {
      return await doGenerate();
    } catch (error) {
      if (!isCapacityError(error)) throw error;
      console.warn(`${PRIMARY_MODEL} at capacity, falling back to ${FALLBACK_MODEL}`);
      return fallback.doGenerate(params);
    }
  },
  wrapStream: async ({ doStream, params }) => {
    try {
      return await doStream();
    } catch (error) {
      if (!isCapacityError(error)) throw error;
      console.warn(`${PRIMARY_MODEL} at capacity, falling back to ${FALLBACK_MODEL}`);
      return fallback.doStream(params);
    }
  },
};

// The tasks here are extraction and short writing, not multi-step reasoning, so low
// thinking keeps responses fast without hurting quality.
const lowThinking = defaultSettingsMiddleware({
  settings: {
    providerOptions: {
      google: { thinkingConfig: { thinkingLevel: "low" } } satisfies GoogleLanguageModelOptions,
    },
  },
});

export const model = wrapLanguageModel({
  model: google(PRIMARY_MODEL),
  middleware: [lowThinking, fallbackOnCapacityError],
});
