"use client";

import * as React from "react";
import { AlertTriangle, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Skeleton } from "@/components/ui/skeleton";
import { EntityAvatar } from "@/components/business/entity-avatar";
import { useSession } from "@/providers/session-provider";
import { useConversationsInfinite } from "@/hooks/messaging/use-conversations";
import { useContacts } from "@/hooks/crm/use-contacts";
import { conversationName, conversationTime, sendability } from "@/lib/messaging/display";
import type { ApiConversation } from "@/types/api/messaging";

const PAGE = 30;

/**
 * "Não lidas" não é um status — é o parâmetro `unreadOnly` do backend. As demais
 * opções mapeiam para `status`. A tradução vive no componente; o backend filtra.
 */
const FILTER_TABS = [
  { value: "all", label: "Todas" },
  { value: "unread", label: "Não lidas" },
  { value: "OPEN", label: "Abertas" },
  { value: "PENDING", label: "Pendentes" },
  { value: "RESOLVED", label: "Resolvidas" },
];

/**
 * Lista de conversas da Inbox. O filtro (busca + status) é do BACKEND — a
 * queryKey muda e o `useInfiniteQuery` reinicia a paginação por cursor sozinho;
 * não há filtro local paralelo.
 *
 * O summary NÃO traz preview da última mensagem nem telefone (só o detalhe/
 * participantes trazem) — por isso a lista não os inventa; eles aparecem no
 * cabeçalho da thread. Dívida técnica registrada no relatório do bloco.
 */
export function InboxConversationList({
  selectedId,
  onSelect,
}: {
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  const { can } = useSession();
  const [query, setQuery] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState("all");

  React.useEffect(() => {
    const t = setTimeout(() => setSearch(query), 350);
    return () => clearTimeout(t);
  }, [query]);

  // "Não lidas" → unreadOnly=true (nunca envia false); demais → status. A troca
  // muda a queryKey e o useInfiniteQuery reinicia a paginação por cursor sozinho.
  const list = useConversationsInfinite({
    limit: PAGE,
    search: search || undefined,
    status: filter === "all" || filter === "unread" ? undefined : filter,
    unreadOnly: filter === "unread" ? true : undefined,
  });

  const contacts = useContacts({ limit: 100 });
  const contactName = (contactId: string | null) =>
    contactId ? (contacts.data?.items.find((c) => c.id === contactId)?.fullName ?? null) : null;

  if (!can("messaging.conversations.read")) {
    return (
      <p className="p-6 text-center text-body2 text-ink-3">
        Você não tem permissão para ver conversas.
      </p>
    );
  }

  const items = list.data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-col gap-2 border-b border-line p-3">
        <SearchInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar conversas…"
        />
        <SegmentedControl
          size="sm"
          options={FILTER_TABS}
          value={filter}
          onValueChange={setFilter}
          className="w-full"
          ariaLabel="Filtrar conversas"
        />
      </div>

      <ul className="no-scrollbar flex-1 overflow-y-auto">
        {list.isLoading ? (
          <li className="flex flex-col gap-3 p-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </li>
        ) : list.isError ? (
          <li role="alert" className="p-6 text-center text-body2 text-danger">
            Não foi possível carregar as conversas.
          </li>
        ) : items.length === 0 ? (
          <li className="p-6 text-center text-body2 text-ink-3">Nenhuma conversa encontrada.</li>
        ) : (
          items.map((c) => (
            <li key={c.id}>
              <ConversationRow
                conversation={c}
                name={conversationName(c, contactName(c.contactId))}
                active={c.id === selectedId}
                onSelect={() => onSelect(c.id)}
              />
            </li>
          ))
        )}

        {list.hasNextPage ? (
          <li className="p-3">
            <Button
              size="sm"
              variant="secondary"
              className="w-full"
              loading={list.isFetchingNextPage}
              onClick={() => list.fetchNextPage()}
            >
              Carregar mais
            </Button>
          </li>
        ) : null}
      </ul>
    </div>
  );
}

function ConversationRow({
  conversation: c,
  name,
  active,
  onSelect,
}: {
  conversation: ApiConversation;
  name: string;
  active: boolean;
  onSelect: () => void;
}) {
  const unread = c.unreadCount > 0;
  const view = sendability(c.canSend, c.sendabilityReason);

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={active ? "true" : undefined}
      className={cn(
        "flex w-full gap-3 border-b border-line px-3 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand",
        active ? "bg-brand-soft/50" : "hover:bg-surface",
      )}
    >
      <EntityAvatar name={name} size="md" className="shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className={cn("flex min-w-0 items-center gap-1.5", unread ? "font-semibold text-ink" : "font-medium text-ink")}>
            <MessageCircle className="size-3.5 shrink-0 text-ink-3" aria-hidden />
            <span className="truncate">{name}</span>
          </span>
          <span className={cn("shrink-0 text-caption", unread ? "font-semibold text-brand" : "text-ink-3")}>
            {conversationTime(c.lastMessageAt)}
          </span>
        </div>
        <div className="mt-0.5 flex items-center justify-between gap-2">
          {!view.canSend ? (
            <span
              className="flex items-center gap-1 truncate text-caption text-ink-3"
              title={view.message}
            >
              <AlertTriangle
                className={cn("size-3 shrink-0", view.tone === "danger" ? "text-danger" : "text-warning")}
                aria-hidden
              />
              <span className="truncate">{view.label}</span>
            </span>
          ) : (
            <span aria-hidden />
          )}
          {unread ? (
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-brand text-micro font-bold text-white">
              {c.unreadCount > 99 ? "99+" : c.unreadCount}
            </span>
          ) : null}
        </div>
      </div>
    </button>
  );
}
