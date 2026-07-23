"use client";

import * as React from "react";
import { MessagesSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { InboxConversationList } from "@/components/messaging/inbox/inbox-conversation-list";
import { InboxThread } from "@/components/messaging/inbox/inbox-thread";

/**
 * Inbox real (Fase 6.2) — split pane: lista à esquerda, thread/estado vazio à
 * direita. A seleção é estado LOCAL (sem nova rota): no desktop os dois painéis
 * convivem; no mobile mostra-se um de cada vez, com "voltar" na thread.
 *
 * React Query é a fonte única: a lista e a thread leem do cache; não há store
 * paralela nem cópia de mensagens entre os painéis.
 */
export function Inbox() {
  const [selectedId, setSelectedId] = React.useState<string | undefined>(undefined);

  return (
    <div className="flex h-[calc(100dvh-14rem)] min-h-[520px] overflow-hidden rounded-xl border border-line bg-white">
      <aside
        className={cn(
          "flex w-full flex-col lg:w-[340px] lg:shrink-0 lg:border-r lg:border-line",
          selectedId && "hidden lg:flex",
        )}
      >
        <InboxConversationList selectedId={selectedId} onSelect={setSelectedId} />
      </aside>
      <main className={cn("min-w-0 flex-1", !selectedId && "hidden lg:block")}>
        {selectedId ? (
          <InboxThread
            key={selectedId}
            conversationId={selectedId}
            onBack={() => setSelectedId(undefined)}
            onNotFound={() => setSelectedId(undefined)}
          />
        ) : (
          <EmptyThread />
        )}
      </main>
    </div>
  );
}

function EmptyThread() {
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
