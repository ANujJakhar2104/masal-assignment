import { describe, expect, it } from "vitest";
import { leadInputSchema } from "@/lib/schemas";

const valid = {
  name: "  Priya Sharma ",
  phone: "98765 43210",
  location: "Whitefield, Bengaluru",
  requirement: "3BHK apartment near a good school",
  budget: "₹1.2 Cr",
  timeline: "1–3 months",
  message: "Hi, we are relocating from Pune in March and need a 3BHK.",
};

describe("leadInputSchema", () => {
  it("accepts a complete lead and trims text", () => {
    const result = leadInputSchema.parse(valid);
    expect(result.name).toBe("Priya Sharma");
    expect(result.phone).toBe("98765 43210");
  });

  it("treats a blank phone as missing rather than invalid", () => {
    expect(leadInputSchema.parse({ ...valid, phone: "  " }).phone).toBeUndefined();
    expect(leadInputSchema.parse({ ...valid, phone: undefined }).phone).toBeUndefined();
  });

  it("rejects a malformed phone with a readable message", () => {
    const result = leadInputSchema.safeParse({ ...valid, phone: "call me" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]).toMatchObject({ path: ["phone"], message: "Enter a valid phone number" });
  });

  it("requires every core field", () => {
    for (const field of ["name", "location", "requirement", "budget", "message"] as const) {
      const result = leadInputSchema.safeParse({ ...valid, [field]: "   " });
      expect(result.success, field).toBe(false);
    }
  });

  it("only allows known timelines", () => {
    expect(leadInputSchema.safeParse({ ...valid, timeline: "soon" }).success).toBe(false);
  });

  it("caps the customer message length", () => {
    expect(leadInputSchema.safeParse({ ...valid, message: "a".repeat(5001) }).success).toBe(false);
  });
});
