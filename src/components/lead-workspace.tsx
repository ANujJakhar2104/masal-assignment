"use client";

import type { UIMessage } from "ai";
import type { Language } from "@/lib/schemas";
import { LeadChat } from "./lead-chat";
import { ReplyComposer, useReplyDraft } from "./reply-composer";

// The chat and the reply composer share one draft: the chat can see it ("make my reply
// more assertive") and any chat answer can be dropped back into it.
export function LeadWorkspace({
  leadId,
  phone,
  suggestedReply,
  language,
  initialMessages,
}: {
  leadId: string;
  phone: string | null;
  suggestedReply: string;
  language: Language;
  initialMessages: UIMessage[];
}) {
  const reply = useReplyDraft(leadId, suggestedReply, language);

  return (
    <div className="space-y-6">
      <ReplyComposer reply={reply} phone={phone} />
      <LeadChat
        leadId={leadId}
        initialMessages={initialMessages}
        draft={reply.draft}
        onUseAsReply={reply.edit}
      />
    </div>
  );
}
