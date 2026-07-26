"use client";

import * as React from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/providers/session-provider";
import { useConversationsInfinite } from "@/hooks/messaging/use-conversations";
import { useContacts } from "@/hooks/crm/use-contacts";
import { conversationName } from "@/lib/messaging/display";
import { toUserErrorMessage } from "@/lib/api/user-error-message";
import { SEARCH_DEBOUNCE_MS } from "@/features/inbox/constants";
import { toConversationListItem } from "@/features/inbox/view-models";
import { activeAdvancedCount, resolveFilters } from "@/features/inbox/url-state";
import { useInboxUrlState } from "@/features/inbox/hooks/use-inbox-url-state";
import { useInboxLabels } from "@/features/inbox/hooks/use-inbox-labels";
import { ConversationListItem } from "./conversation-list-item";
import { InboxAdvancedFiltersPanel } from "../filters/advanced-filters-panel";

const PAGE = 30;
const QUICK = [
  { value: "all", label: "Todas" },
  { value: "mine", label: "Minhas" },
  { value: "unread", label: "Não lidas" },
  { value: "open", label: "Abertas" },
  { value: "closed", label: "Fechadas" },
];

/** Lista de conversas da Inbox (F1). Filtros/seleção vêm da URL; realtime via dispatcher. */
export function ConversationList({ selectedId }: { selectedId?: string }) {
  const { user, can } = useSession();
  const url = useInboxUrlState();
  const labels = useInboxLabels();

  const [query, setQuery] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [showFilters, setShowFilters] = React.useState(false);
  React.useEffect(() => {
    const t = setTimeout(() => setSearch(query.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query]);

  const filters = React.useMemo(
    () => resolveFilters(url, user?.id ?? null, search || undefined),
    [url, user?.id, search],
  );

  const list = useConversationsInfinite({ ...filters, limit: PAGE });
  // Estável por montagem (evita rerender dos itens memoizados). F8 pode adicionar ticker.
  const now = React.useMemo(() => new Date(), []);

  const contacts = useContacts({ limit: 100 });
  const contactName = React.useCallback(
    (contactId: string | null) =>
      contactId ? (contacts.data?.items.find((c) => c.id === contactId)?.fullName ?? null) : null,
    [contacts.data],
  );

  if (!can("messaging.conversations.read")) {
    return (
      <p className="p-6 text-center text-body2 text-ink-3">
        Você não tem permissão para ver conversas.
      </p>
    );
  }

  const items = list.data?.pages.flatMap((p) => p.items) ?? [];
  const advancedCount = activeAdvancedCount(url.advanced);
  const isFiltered = url.view !== "all" || advancedCount > 0 || Boolean(search);

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex flex-col gap-2 border-b border-line p-3">
        <div className="flex items-center gap-2">
          <SearchInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar conversas…"
            aria-label="Buscar conversas"
            className="flex-1"
          />
          <Button
            size="sm"
            variant={advancedCount > 0 ? "primary" : "secondary"}
            onClick={() => setShowFilters((s) => !s)}
            aria-expanded={showFilters}
            aria-label="Filtros avançados"
          >
            <SlidersHorizontal className="size-4" aria-hidden />
            {advancedCount > 0 ? <span className="ml-1">{advancedCount}</span> : null}
          </Button>
        </div>
        <SegmentedControl
          size="sm"
          options={QUICK}
          value={url.view}
          onValueChange={(v) => url.setView(v as (typeof QUICK)[number]["value"] as never)}
          className="w-full"
          ariaLabel="Filtro rápido de conversas"
        />
        {showFilters ? (
          <InboxAdvancedFiltersPanel
            value={url.advanced}
            labels={labels.data ?? []}
            onApply={(a) => {
              url.setAdvanced(a);
              setShowFilters(false);
            }}
            onClear={() => {
              url.clearAdvanced();
              setShowFilters(false);
            }}
          />
        ) : null}
      </div>

      {/* Lista */}
      <ul className="no-scrollbar flex-1 overflow-y-auto" aria-label="Conversas">
        {list.isLoading ? (
          <li className="flex flex-col gap-3 p-3" aria-hidden>
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </li>
        ) : list.isError ? (
          <li role="alert" className="flex flex-col items-center gap-3 p-6 text-center">
            <p className="text-body2 text-danger">{toUserErrorMessage(list.error)}</p>
            <Button size="sm" variant="secondary" onClick={() => list.refetch()}>
              Tentar novamente
            </Button>
          </li>
        ) : items.length === 0 ? (
          <EmptyState filtered={isFiltered} view={url.view} />
        ) : (
          items.map((c) => {
            const vm = toConversationListItem(c);
            return (
              <li key={c.id}>
                <ConversationListItem
                  item={vm}
                  name={conversationName(c, contactName(c.contactId))}
                  active={c.id === selectedId}
                  onSelect={url.select}
                  now={now}
                />
              </li>
            );
          })
        )}

        {list.hasNextPage ? (
          <li className="p-3">
            <Button
              size="sm"
              variant="secondary"
              className="w-full"
              loading={list.isFetchingNextPage}
              onClick={() => void list.fetchNextPage()}
            >
              Carregar mais
            </Button>
          </li>
        ) : null}

        {/* Erro ao paginar não limpa a lista existente. */}
        {list.isError && items.length > 0 ? (
          <li role="alert" className="flex items-center justify-between gap-2 p-3 text-caption text-danger">
            <span>Falha ao carregar mais.</span>
            <button type="button" className="underline" onClick={() => list.fetchNextPage()}>
              tentar
            </button>
          </li>
        ) : null}
      </ul>
    </div>
  );
}

function EmptyState({ filtered, view }: { filtered: boolean; view: string }) {
  const message = !filtered
    ? "Nenhuma conversa ainda."
    : view === "mine"
      ? "Nenhuma conversa atribuída a você."
      : view === "unread"
        ? "Nenhuma conversa não lida."
        : "Nenhuma conversa neste filtro.";
  return (
    <li className="flex flex-col items-center gap-2 p-8 text-center">
      <X className="size-6 text-ink-3" aria-hidden />
      <p className="text-body2 text-ink-3">{message}</p>
    </li>
  );
}
