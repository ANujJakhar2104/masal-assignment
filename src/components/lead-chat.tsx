"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { messageText } from "@/lib/messages";
import { buttonStyles, inputStyles } from "./ui";

const SUGGESTIONS = [
  "What should I emphasise on the call?",
  "How do I handle their biggest concern?",
  "Make my reply more assertive",
  "What should I ask to qualify them further?",
];

export function LeadChat({
  leadId,
  initialMessages,
  draft,
  onUseAsReply,
}: {
  leadId: string;
  initialMessages: UIMessage[];
  draft: string;
  onUseAsReply: (text: string) => void;
}) {
  const [input, setInput] = useState("");
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: `/api/leads/${leadId}/chat`,
        // Send only the new question plus the current draft; the server owns the history.
        prepareSendMessagesRequest: ({ messages, body }) => ({
          body: { ...body, text: messageText(messages[messages.length - 1]) },
        }),
      }),
    [leadId],
  );
  const { messages, sendMessage, status, error } = useChat({
    id: leadId,
    messages: initialMessages,
    transport,
  });
  const busy = status === "submitted" || status === "streaming";

  const scroller = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function ask(text: string) {
    if (!text.trim() || busy) return;
    void sendMessage({ text }, { body: { draft } });
    setInput("");
  }

  return (
    <section className="flex flex-col rounded-lg border border-stone-200 bg-white">
      <div className="border-b border-stone-200 px-4 py-3">
        <h2 className="font-medium">Ask about this lead</h2>
        <p className="text-sm text-stone-500">
          Answers use this lead&apos;s details, analysis and your current draft.
        </p>
      </div>

      <div ref={scroller} className="max-h-[28rem] min-h-40 space-y-4 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => ask(suggestion)}
                className="rounded-full border border-stone-300 px-3 py-1.5 text-left text-sm text-stone-700 hover:bg-stone-100"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {messages.map((message, index) => {
          const text = messageText(message);
          const isStreaming = busy && index === messages.length - 1;
          if (message.role === "user") {
            return (
              <p
                key={message.id}
                className="ml-auto w-fit max-w-[85%] rounded-lg bg-stone-900 px-3 py-2 text-sm text-white"
              >
                {text}
              </p>
            );
          }
          return (
            <div key={message.id} className="max-w-[95%] space-y-1">
              <p className="rounded-lg bg-stone-100 px-3 py-2 text-sm whitespace-pre-wrap">{text || "…"}</p>
              {!isStreaming && text && (
                <button
                  type="button"
                  onClick={() => onUseAsReply(text)}
                  className="text-xs font-medium text-stone-500 hover:text-stone-900"
                >
                  Use as WhatsApp reply
                </button>
              )}
            </div>
          );
        })}

        {status === "submitted" && <p className="text-sm text-stone-500">Thinking…</p>}
        {error && <p className="text-sm text-red-600">{error.message}</p>}
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          ask(input);
        }}
        className="flex gap-2 border-t border-stone-200 p-3"
      >
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask a follow-up…"
          aria-label="Question about this lead"
          className={inputStyles}
        />
        <button type="submit" disabled={busy || !input.trim()} className={buttonStyles("primary")}>
          Send
        </button>
      </form>
    </section>
  );
}
