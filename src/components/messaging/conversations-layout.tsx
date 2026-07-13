import { MessagesSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConversationList } from "@/components/messaging/conversation-list";
import { ChatView } from "@/components/messaging/chat-view";
import type { Conversation } from "@/types/messaging";

function EmptyChat() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 bg-surface p-6 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-brand-soft text-brand">
        <MessagesSquare className="size-7" aria-hidden />
      </span>
      <div>
        <p className="font-display text-h3 font-semibold text-ink">Selecione uma conversa</p>
        <p className="mt-1 max-w-xs text-body2 text-ink-2">
          Escolha uma conversa à esquerda para ver as mensagens e responder.
        </p>
      </div>
    </div>
  );
}

/** Split pane de comunicação: lista à esquerda, chat/estado vazio à direita. */
export function ConversationsLayout({
  selectedId,
  conversation,
}: {
  selectedId?: string;
  conversation?: Conversation;
}) {
  return (
    <div className="flex h-[calc(100dvh-12rem)] min-h-[500px] overflow-hidden rounded-xl border border-line bg-white">
      <aside
        className={cn(
          "flex w-full flex-col lg:w-[340px] lg:shrink-0 lg:border-r lg:border-line",
          selectedId && "hidden lg:flex",
        )}
      >
        <ConversationList selectedId={selectedId} />
      </aside>
      <main className={cn("min-w-0 flex-1", !selectedId && "hidden lg:block")}>
        {conversation ? <ChatView conversation={conversation} /> : <EmptyChat />}
      </main>
    </div>
  );
}
