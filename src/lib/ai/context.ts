import type { LeadInput } from "@/lib/schemas";

// Accepts both fresh form input and stored leads (where timeline is a plain string).
type LeadFields = Pick<LeadInput, "name" | "location" | "requirement" | "budget" | "message"> & {
  timeline: string;
};

/**
 * The lead as the model sees it. The customer's text is fenced in tags so the prompt can
 * tell the model to treat it as data, not as instructions.
 */
export function describeLead(lead: LeadFields): string {
  return [
    `Name: ${lead.name}`,
    `Location: ${lead.location}`,
    `Property requirement: ${lead.requirement}`,
    `Budget: ${lead.budget}`,
    `Buying timeline: ${lead.timeline}`,
    "",
    "<customer_message>",
    lead.message,
    "</customer_message>",
  ].join("\n");
}
