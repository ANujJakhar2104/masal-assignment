import { describe, expect, it } from "vitest";
import { toWhatsAppNumber, whatsAppLink } from "@/lib/whatsapp";

describe("toWhatsAppNumber", () => {
  it.each([
    ["9876543210", "919876543210"],
    ["98765 43210", "919876543210"],
    ["098765-43210", "919876543210"],
    ["+91 98765 43210", "919876543210"],
    ["919876543210", "919876543210"],
    ["+1 (415) 555-0134", "14155550134"],
  ])("normalizes %s", (input, expected) => {
    expect(toWhatsAppNumber(input)).toBe(expected);
  });

  it.each(["", "12345", "98765abc10", "+12", "98765432101234"])("rejects %j", (input) => {
    expect(toWhatsAppNumber(input)).toBeNull();
  });
});

describe("whatsAppLink", () => {
  it("targets the number when one is given", () => {
    expect(whatsAppLink("Hi", "9876543210")).toBe("https://wa.me/919876543210?text=Hi");
  });

  it("falls back to the contact picker without a usable number", () => {
    expect(whatsAppLink("Hi")).toBe("https://wa.me/?text=Hi");
    expect(whatsAppLink("Hi", "not a phone")).toBe("https://wa.me/?text=Hi");
  });

  it("encodes spaces, newlines and Devanagari so the message survives the URL", () => {
    const text = "नमस्ते Priya,\nSaturday 11am?";
    const url = new URL(whatsAppLink(text, "9876543210"));
    expect(url.searchParams.get("text")).toBe(text);
    expect(url.search).not.toContain(" ");
  });
});
