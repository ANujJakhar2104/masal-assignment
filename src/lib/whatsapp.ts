const DEFAULT_COUNTRY_CODE = "91";

/**
 * Normalizes a phone number into the digits-only international form wa.me expects.
 * Numbers without a "+" are assumed Indian, the way sales teams usually write them.
 */
export function toWhatsAppNumber(phone: string): string | null {
  const raw = phone.trim();
  if (!/^\+?[\d\s()-]+$/.test(raw)) return null;

  const digits = raw.replace(/\D/g, "");
  if (raw.startsWith("+")) {
    return digits.length >= 8 && digits.length <= 15 ? digits : null;
  }

  const local = digits.replace(/^0+/, "");
  if (local.length === 10) return DEFAULT_COUNTRY_CODE + local;
  if (local.length === 12 && local.startsWith(DEFAULT_COUNTRY_CODE)) return local;
  return null;
}

/**
 * Builds a click-to-chat link. Without a valid number WhatsApp still opens with the
 * text prefilled and lets the salesperson pick the contact.
 */
export function whatsAppLink(text: string, phone?: string | null): string {
  const number = phone ? toWhatsAppNumber(phone) : null;
  const query = `text=${encodeURIComponent(text)}`;
  return number ? `https://wa.me/${number}?${query}` : `https://wa.me/?${query}`;
}
