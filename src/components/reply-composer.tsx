"use client";

import { useState } from "react";
import { errorMessage, postJson } from "@/lib/http";
import type { Language } from "@/lib/schemas";
import { toWhatsAppNumber, whatsAppLink } from "@/lib/whatsapp";
import { buttonStyles, inputStyles } from "./ui";

const LANGUAGE_LABELS: Record<Language, string> = {
  english: "English",
  hindi: "हिंदी",
  hinglish: "Hinglish",
};

/**
 * Holds the reply draft per language. Translations are cached so switching back and forth
 * doesn't re-call the model or drift; any manual edit invalidates the other versions.
 */
export function useReplyDraft(leadId: string, initialText: string, initialLanguage: Language) {
  const [language, setLanguage] = useState(initialLanguage);
  const [versions, setVersions] = useState<Partial<Record<Language, string>>>({
    [initialLanguage]: initialText,
  });
  const [pending, setPending] = useState<Language | null>(null);
  const [error, setError] = useState<string | null>(null);

  const draft = versions[language] ?? "";

  function edit(text: string) {
    setVersions({ [language]: text });
  }

  async function switchTo(next: Language) {
    if (next === language || pending) return;
    setError(null);
    if (versions[next]) {
      setLanguage(next);
      return;
    }

    setPending(next);
    try {
      const { text } = await postJson<{ text: string }>(`/api/leads/${leadId}/reply`, {
        draft,
        language: next,
      });
      setVersions((current) => ({ ...current, [next]: text }));
      setLanguage(next);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setPending(null);
    }
  }

  return { draft, language, pending, error, edit, switchTo };
}

export type ReplyDraft = ReturnType<typeof useReplyDraft>;

export function ReplyComposer({ reply, phone }: { reply: ReplyDraft; phone: string | null }) {
  const [copied, setCopied] = useState(false);
  const number = phone ? toWhatsAppNumber(phone) : null;

  async function copy() {
    await navigator.clipboard.writeText(reply.draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className="space-y-3 rounded-lg border border-stone-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-medium">Reply on WhatsApp</h2>
        <div
          role="group"
          aria-label="Reply language"
          className="inline-flex rounded-md border border-stone-300 p-0.5"
        >
          {(Object.keys(LANGUAGE_LABELS) as Language[]).map((language) => (
            <button
              key={language}
              type="button"
              onClick={() => reply.switchTo(language)}
              disabled={reply.pending !== null}
              aria-pressed={reply.language === language}
              className="rounded px-2.5 py-1 text-xs font-medium text-stone-600 hover:text-stone-900 disabled:opacity-60 aria-pressed:bg-stone-900 aria-pressed:text-white"
            >
              {reply.pending === language ? "…" : LANGUAGE_LABELS[language]}
            </button>
          ))}
        </div>
      </div>

      <textarea
        aria-label="Reply draft"
        value={reply.draft}
        onChange={(event) => reply.edit(event.target.value)}
        rows={8}
        className={inputStyles}
      />
      {reply.error && <p className="text-sm text-red-600">{reply.error}</p>}

      <div className="flex flex-wrap items-center gap-2">
        <a
          href={whatsAppLink(reply.draft, phone)}
          target="_blank"
          rel="noreferrer"
          aria-disabled={!reply.draft.trim()}
          className={`${buttonStyles("whatsapp")} aria-disabled:pointer-events-none aria-disabled:opacity-50`}
        >
          Open in WhatsApp
        </a>
        <button type="button" onClick={copy} className={buttonStyles("secondary")}>
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p className="text-xs text-stone-500">
        {number
          ? `Opens a chat with +${number}. Nothing is sent until you press send.`
          : "No valid phone saved, so WhatsApp will ask you to pick the contact."}
      </p>
    </section>
  );
}
