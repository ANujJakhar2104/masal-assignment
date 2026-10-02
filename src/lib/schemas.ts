import { z } from "zod";
import { toWhatsAppNumber } from "./whatsapp";

export const TIMELINES = ["Within 1 month", "1–3 months", "3–6 months", "6+ months", "Not decided"] as const;

export const LANGUAGES = ["english", "hindi", "hinglish"] as const;
export type Language = (typeof LANGUAGES)[number];

const required = (max: number) =>
  z.string({ error: "Required" }).trim().min(1, "Required").max(max, `Keep it under ${max} characters`);

export const leadInputSchema = z.object({
  name: required(100),
  phone: z
    .string()
    .trim()
    .max(20)
    .refine((v) => v === "" || toWhatsAppNumber(v) !== null, "Enter a valid phone number")
    .transform((v) => v || undefined)
    .optional(),
  location: required(120),
  requirement: required(300),
  budget: required(60),
  timeline: z.enum(TIMELINES, "Pick a timeline"),
  message: required(5000),
});

export type LeadInput = z.output<typeof leadInputSchema>;

// The model classifies each signal into a fixed level; scoring.ts turns levels into points.
// Asking for labels instead of a number keeps the ranking stable across runs and auditable.
const signal = <const T extends readonly [string, ...string[]]>(levels: T, rubric: string) =>
  z.object({
    level: z.enum(levels).describe(rubric),
    evidence: z.string().describe("A short quote or close paraphrase from the lead that justifies the level"),
  });

export const leadSignalsSchema = z.object({
  urgency: signal(
    ["immediate", "within_3_months", "within_6_months", "exploring"],
    "How soon they will buy. immediate: within ~1 month or a hard deadline (lease ending, school admission). exploring: no timeline or just looking.",
  ),
  commitment: signal(
    ["high", "medium", "low"],
    "How serious they are, judged by actions not deadlines. high: asks for a site visit, has loan approval or down payment ready, or has shortlisted. medium: specific needs and questions but still comparing. low: generic enquiry, 'send brochures', or will look later.",
  ),
  budgetFit: signal(
    ["strong", "stretch", "unrealistic", "unknown"],
    "Whether the budget matches typical current prices for that property type and area in India. stretch: possible but tight. If any budget figure is given, pick strong, stretch or unrealistic; unknown is only for when no budget is given at all.",
  ),
  objectionSeverity: signal(
    ["none", "minor", "major"],
    "Worst concern raised. Timing alone is not an objection; urgency covers it. minor: negotiable (price, floor, amenities, possession date). major: blocks the purchase (must sell another property first, family not on board, loan rejected).",
  ),
});

export type LeadSignals = z.infer<typeof leadSignalsSchema>;

export const leadAnalysisSchema = z.object({
  summary: z.string().describe("Two sentences: who they are and what they want"),
  intent: z
    .string()
    .describe(
      "The real goal behind the enquiry in one line, e.g. 'Upgrade to a bigger home before the baby arrives'",
    ),
  keyRequirements: z.array(z.string()).describe("3–6 short must-haves, each under 8 words"),
  objections: z
    .array(z.string())
    .describe("Concerns or hesitations they raised or clearly implied. Empty if none."),
  nextAction: z
    .string()
    .describe(
      "One concrete action for the salesperson: what to do, by when, and the angle to lead with. One sentence.",
    ),
  language: z
    .enum(LANGUAGES)
    .describe("Language the customer wrote in. hinglish = Hindi in Latin script mixed with English."),
  suggestedReply: z.string().describe("WhatsApp message to the customer, in their language"),
  signals: leadSignalsSchema,
});

export type LeadAnalysis = z.infer<typeof leadAnalysisSchema>;

export const voiceIntakeSchema = z.object({
  transcript: z.string().describe("Faithful transcript of the recording in the language spoken"),
  name: z.string().nullable().describe("Customer's name, or null if not mentioned"),
  phone: z.string().nullable().describe("Customer's phone number, or null if not mentioned"),
  location: z.string().nullable().describe("Preferred area or city, or null"),
  requirement: z
    .string()
    .nullable()
    .describe("Property type and must-haves in a few words, e.g. '3BHK apartment, near metro', or null"),
  budget: z.string().nullable().describe("Budget as said, e.g. '₹90L–1Cr', or null"),
  timeline: z.enum(TIMELINES).nullable().describe("Closest buying timeline, or null if not mentioned"),
});

export type VoiceIntake = z.infer<typeof voiceIntakeSchema>;
