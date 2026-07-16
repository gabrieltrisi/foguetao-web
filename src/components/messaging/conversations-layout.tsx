"use client";

import { MessagesSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConversationList } from "@/components/messaging/conversation-list";
import { ChatView } from "@/components/messaging/chat-view";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useConversation } from "@/hooks/messaging/use-conversations";
import { isApiError } from "@/types/api/error";

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

/**
 * Split pane de comunicação: lista à esquerda, chat/estado vazio à direita.
 * O detalhe da conversa é buscado no cliente (`GET /messaging/conversations/:id`)
 * — não há mais prerender de ids mockados.
 */
export function ConversationsLayout({ selectedId }: { selectedId?: string }) {
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
        {selectedId ? <ChatPane id={selectedId} /> : <EmptyChat />}
      </main>
    </div>
  );
}

function ChatPane({ id }: { id: string }) {
  const { data, isLoading, isError, error, refetch } = useConversation(id);

  if (isLoading) {
    return (
      <div className="flex h-full flex-col gap-3 p-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-full w-full" />
      </div>
    );
  }
  if (isError || !data) {
    const notFound = isApiError(error) && error.statusCode === 404;
    return (
      <div className="flex h-full items-center justify-center p-6">
        <ErrorState
          variant="card"
          title={notFound ? "Conversa não encontrada." : "Não foi possível carregar a conversa."}
          onRetry={notFound ? undefined : () => refetch()}
        />
      </div>
    );
  }
  return <ChatView conversation={data} />;
}
