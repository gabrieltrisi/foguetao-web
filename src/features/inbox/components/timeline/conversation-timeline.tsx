"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { toUserErrorMessage } from "@/lib/api/user-error-message";
import { useSession } from "@/providers/session-provider";
import { useConversationMessages } from "@/features/inbox/hooks/use-conversation-messages";
import { useTimelineScroll } from "@/features/inbox/hooks/use-timeline-scroll";
import { useMarkConversationReadOnView } from "@/features/inbox/hooks/use-mark-read";
import { buildTimeline, findFirstUnreadId, flattenTimelinePages } from "@/features/inbox/timeline";
import { isTempId } from "@/features/inbox/optimistic";
import type { TimelineMessageVM } from "@/features/inbox/view-models";
import {
  DaySeparator,
  NewMessagesIndicator,
  TimelineEmpty,
  TimelineError,
  TimelineSkeleton,
  UnreadSeparator,
} from "./timeline-parts";
import { MessageRow } from "./message/message-row";

const PAGE = 30;
const UNREAD_ANCHOR_ID = "timeline-unread-anchor";

/**
 * Timeline de UMA conversa (F2A) — estrutura, paginação reversa e comportamento de
 * scroll. O PAI (`InboxThread`) é montado com `key={conversationId}` (inbox-shell/
 * inbox.tsx), então toda a subárvore — incl. este componente e seus refs/estado — é
 * remontada por conversa. NÃO reutilizar sem uma `key` de conversa (vazaria refs de
 * scroll/inicialização). Ordem visual (antigo→novo) e agrupamento vêm de `timeline.ts`
 * (puro). A renderização final de mensagens/mídia é F2B; aqui a linha é estrutural.
 */
export const ConversationTimeline = React.memo(function ConversationTimeline({
  conversationId,
  unreadForUser,
  counterpartName = "Contato",
  onRetry,
  onReply,
}: {
  conversationId: string;
  unreadForUser?: number | null;
  counterpartName?: string;
  onRetry?: (message: TimelineMessageVM) => void;
  onReply?: (message: TimelineMessageVM) => void;
}) {
  const { user } = useSession();
  const q = useConversationMessages(conversationId, { limit: PAGE });
  const now = React.useMemo(() => new Date(), []);

  const senderName = React.useCallback(
    (m: TimelineMessageVM) =>
      m.direction === "OUTBOUND"
        ? m.senderUserId && m.senderUserId === user?.id
          ? "Você"
          : "Atendente"
        : counterpartName,
    [user?.id, counterpartName],
  );

  const ordered = React.useMemo(() => flattenTimelinePages(q.data?.pages), [q.data?.pages]);
  const topItemId = ordered[0]?.id;
  const lastItem = ordered[ordered.length - 1];
  const lastItemId = lastItem?.id;
  // Envio PRÓPRIO em voo (temp OUTBOUND): deve rolar ao fim mesmo lendo histórico
  // (F2D A) — sua mensagem nunca fica escondida atrás do indicador de "novas".
  const lastIsOwnOptimistic = Boolean(lastItem && isTempId(lastItem.id) && lastItem.direction === "OUTBOUND");

  const { ref: scrollRef, isAtBottom, unseenCount, scrollToBottom, beforePrepend, addUnseen } =
    useTimelineScroll({ topItemId });

  // Leitura REAL (F2C): marca lida só quando o atendente vê as novas (no final +
  // janela ativa), com debounce. Não marca só por abrir (decisão F2A preservada).
  useMarkConversationReadOnView({
    conversationId,
    hasUnread: (unreadForUser ?? 0) > 0,
    isAtBottom,
  });

  // Primeira não-lida: calculada UMA vez ao carregar (não pula ao marcar lida).
  const [firstUnreadId, setFirstUnreadId] = React.useState<string | null>(null);
  const initializedRef = React.useRef(false);
  const lastSeenIdRef = React.useRef<string | undefined>(undefined);

  const items = React.useMemo(
    () => buildTimeline(ordered, { now, firstUnreadId }),
    [ordered, now, firstUnreadId],
  );

  // Posicionamento inicial: separador de não-lidas se houver; senão, final.
  React.useLayoutEffect(() => {
    if (initializedRef.current || q.isLoading || ordered.length === 0) return;
    initializedRef.current = true;
    const unread = findFirstUnreadId(ordered, unreadForUser);
    setFirstUnreadId(unread);
    lastSeenIdRef.current = ordered[ordered.length - 1]?.id;
    // Espera o layout com o separador para ancorar.
    requestAnimationFrame(() => {
      const anchor = unread ? document.getElementById(UNREAD_ANCHOR_ID) : null;
      if (anchor) anchor.scrollIntoView({ block: "center" });
      else scrollToBottom("auto");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q.isLoading, ordered.length]);

  // Novas mensagens (após inicializar): no final (ou envio próprio) → acompanha; lendo
  // histórico → indicador. O envio otimista próprio sempre rola ao fim (F2D A).
  React.useEffect(() => {
    if (!initializedRef.current || !lastItemId) return;
    if (lastSeenIdRef.current === lastItemId) return;
    const isNewer = lastSeenIdRef.current !== undefined;
    lastSeenIdRef.current = lastItemId;
    if (!isNewer) return;
    if (isAtBottom || lastIsOwnOptimistic) scrollToBottom("smooth");
    else addUnseen(1);
  }, [lastItemId, isAtBottom, lastIsOwnOptimistic, scrollToBottom, addUnseen]);

  // Paginação reversa: sentinel no topo (IntersectionObserver) + guarda de concorrência.
  // Deps: só os campos ESTÁVEIS da query (não o objeto `q` inteiro — F2D perf#2), para
  // não recriar o observer a cada render.
  const topSentinelRef = React.useRef<HTMLDivElement>(null);
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = q;
  React.useEffect(() => {
    const el = topSentinelRef.current;
    if (!el || !hasNextPage) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          beforePrepend();
          void fetchNextPage();
        }
      },
      { root: scrollRef.current, rootMargin: "120px 0px 0px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, beforePrepend, scrollRef]);

  if (q.isLoading) return <TimelineSkeleton />;
  if (q.isError && ordered.length === 0) {
    return <TimelineError message={toUserErrorMessage(q.error)} onRetry={() => void q.refetch()} />;
  }
  if (ordered.length === 0) return <TimelineEmpty />;

  return (
    <div className="relative flex-1 overflow-hidden">
      <div
        ref={scrollRef}
        className="h-full overflow-y-auto bg-surface"
        role="log"
        aria-label="Histórico da conversa"
        aria-busy={q.isFetchingNextPage}
      >
        {/* Topo: sentinel + loading/erro de páginas anteriores (não remove a lista). */}
        <div ref={topSentinelRef} />
        {q.hasNextPage ? (
          <div className="flex justify-center py-2">
            {q.isFetchingNextPage ? (
              <span className="text-caption text-ink-3">Carregando anteriores…</span>
            ) : (
              <Button size="sm" variant="ghost" onClick={() => {
                beforePrepend();
                void q.fetchNextPage();
              }}>
                Carregar mensagens anteriores
              </Button>
            )}
          </div>
        ) : null}
        {q.isError && ordered.length > 0 ? (
          <div role="alert" className="flex items-center justify-center gap-2 py-1 text-caption text-danger">
            Falha ao carregar anteriores.
            <button type="button" className="underline" onClick={() => q.fetchNextPage()}>
              tentar
            </button>
          </div>
        ) : null}

        <div className="pb-3" role="list">
          {items.map((it) =>
            it.kind === "day" ? (
              <DaySeparator key={it.id} label={it.label} />
            ) : it.kind === "unread" ? (
              <div key={it.id} id={UNREAD_ANCHOR_ID}>
                <UnreadSeparator />
              </div>
            ) : (
              <MessageRow
                key={it.id}
                message={it.message}
                group={it.group}
                senderName={senderName(it.message)}
                onRetry={onRetry}
                onReply={onReply}
              />
            ),
          )}
        </div>
      </div>

      {unseenCount > 0 ? (
        <NewMessagesIndicator count={unseenCount} onClick={() => scrollToBottom("smooth")} />
      ) : null}
    </div>
  );
});
