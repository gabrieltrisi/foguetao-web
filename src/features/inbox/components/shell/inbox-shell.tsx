"use client";

import * as React from "react";
import { MessagesSquare, PanelRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { InboxThread } from "@/components/messaging/inbox/inbox-thread";
import { ConversationList } from "@/features/inbox/components/list/conversation-list";
import { useInboxUrlState } from "@/features/inbox/hooks/use-inbox-url-state";
import { InboxConnectionBadge } from "./inbox-connection-badge";

/**
 * Shell DEFINITIVO da Inbox (F1). Três áreas no desktop grande (lista • conversa •
 * contexto reservado/recolhível); lista+conversa no notebook; uma visão por vez no
 * mobile. A SELEÇÃO é a URL (`?c=`) — sem estado duplicado. A área central reusa a
 * `InboxThread` da Fase 6.2 (finalizada em F2/F3); o painel de contexto é reservado
 * (F5). O container raiz NÃO rola: cada painel tem scroll independente.
 */
export function InboxShell() {
  const { selectedId, select } = useInboxUrlState();
  const [contextOpen, setContextOpen] = React.useState(false);

  return (
    <div className="flex h-[calc(100dvh-11rem)] min-h-[520px] overflow-hidden rounded-xl border border-line bg-white">
      {/* A. Lista */}
      <aside
        className={cn(
          "flex w-full flex-col lg:w-[340px] lg:shrink-0 lg:border-r lg:border-line",
          selectedId && "hidden lg:flex",
        )}
        aria-label="Lista de conversas"
      >
        <div className="flex items-center justify-between gap-2 border-b border-line px-3 py-2">
          <h1 className="font-display text-body1 font-semibold text-ink">Inbox</h1>
          <InboxConnectionBadge />
        </div>
        <ConversationList selectedId={selectedId} />
      </aside>

      {/* B. Conversa */}
      <main className={cn("flex min-w-0 flex-1 flex-col", !selectedId && "hidden lg:flex")}>
        {selectedId ? (
          <div className="flex min-h-0 flex-1">
            <div className="min-w-0 flex-1">
              <InboxThread
                key={selectedId}
                conversationId={selectedId}
                onBack={() => select(undefined)}
                onNotFound={() => select(undefined)}
              />
            </div>
            {/* C. Contexto (reservado/recolhível — só xl). Placeholder estruturado (F5). */}
            <aside
              className={cn(
                "hidden shrink-0 border-l border-line bg-surface xl:flex xl:flex-col",
                contextOpen ? "xl:w-[340px]" : "xl:w-0 xl:overflow-hidden xl:border-l-0",
              )}
              aria-label="Painel de contexto"
              aria-hidden={!contextOpen}
            >
              {contextOpen ? (
                <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-body2 text-ink-3">
                  <PanelRight className="size-6" aria-hidden />
                  <p>Contato, negócio e atividades aparecerão aqui (F5).</p>
                </div>
              ) : null}
            </aside>
          </div>
        ) : (
          <EmptyThread />
        )}
      </main>

      {/* Alternador do contexto (só xl, quando há conversa). */}
      {selectedId ? (
        <button
          type="button"
          onClick={() => setContextOpen((o) => !o)}
          className="hidden xl:flex xl:shrink-0 xl:items-start xl:border-l xl:border-line xl:p-2 xl:text-ink-3 xl:hover:text-ink"
          aria-pressed={contextOpen}
          aria-label={contextOpen ? "Ocultar painel de contexto" : "Mostrar painel de contexto"}
          title="Painel de contexto"
        >
          <PanelRight className="size-4" aria-hidden />
        </button>
      ) : null}
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
