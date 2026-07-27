"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { toUserErrorMessage } from "@/lib/api/user-error-message";
import { useSession } from "@/providers/session-provider";
import { useConversationMessages } from "@/features/inbox/hooks/use-conversation-messages";
import { useTimelineScroll } from "@/features/inbox/hooks/use-timeline-scroll";
import { useMarkConversationReadOnView } from "@/features/inbox/hooks/use-mark-read";
import { buildTimeline, findFirstUnreadId, flattenTimelinePages } from "@/features/inbox/timeline";
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
 * scroll. Montada com `key={conversationId}` pelo pai → estado reinicia por conversa.
 * Ordem visual (antigo→novo) e agrupamento vêm de `timeline.ts` (puro). A
 * renderização final de mensagens/mídia é F2B; aqui a linha é estrutural.
 */
export function ConversationTimeline({
  conversationId,
  unreadForUser,
  counterpartName = "Contato",
  onRetry,
}: {
  conversationId: string;
  unreadForUser?: number | null;
  counterpartName?: string;
  onRetry?: (message: TimelineMessageVM) => void;
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
  const lastItemId = ordered[ordered.length - 1]?.id;

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

  // Novas mensagens (após inicializar): no final → acompanha; lendo histórico → indicador.
  React.useEffect(() => {
    if (!initializedRef.current || !lastItemId) return;
    if (lastSeenIdRef.current === lastItemId) return;
    const isNewer = lastSeenIdRef.current !== undefined;
    lastSeenIdRef.current = lastItemId;
    if (!isNewer) return;
    if (isAtBottom) scrollToBottom("smooth");
    else addUnseen(1);
  }, [lastItemId, isAtBottom, scrollToBottom, addUnseen]);

  // Paginação reversa: sentinel no topo (IntersectionObserver) + guarda de concorrência.
  const topSentinelRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const el = topSentinelRef.current;
    if (!el || !q.hasNextPage) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && q.hasNextPage && !q.isFetchingNextPage) {
          beforePrepend();
          void q.fetchNextPage();
        }
      },
      { root: scrollRef.current, rootMargin: "120px 0px 0px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [q.hasNextPage, q.isFetchingNextPage, q, beforePrepend, scrollRef]);

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
}
