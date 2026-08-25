"use client";

import * as React from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Skeleton } from "@/components/ui/skeleton";
import { EntityAvatar } from "@/components/business/entity-avatar";
import { useSession } from "@/providers/session-provider";
import { useConversationsInfinite } from "@/hooks/messaging/use-conversations";
import { useContacts } from "@/hooks/crm/use-contacts";
import { conversationName, conversationTime } from "@/lib/messaging/display";

/**
 * Lista real de conversas (`GET /messaging/conversations`, cursor).
 *
 * O contrato NÃO traz na listagem: preview da última mensagem (só o detalhe
 * traz), etiquetas (não existem no backend) nem presença/online (seria
 * realtime). Esses elementos foram removidos em vez de simulados.
 *
 * O `search` do backend filtra apenas por `title`.
 */
const PAGE = 30;

const STATUS_TABS = [
  { value: "all", label: "Todas" },
  { value: "OPEN", label: "Abertas" },
  { value: "PENDING", label: "Pendentes" },
  { value: "RESOLVED", label: "Resolvidas" },
];

export function ConversationList({ selectedId }: { selectedId?: string }) {
  const { can } = useSession();
  const [query, setQuery] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState("all");

  // Busca com debounce. Trocar busca/status muda a queryKey e o
  // useInfiniteQuery reinicia a paginação sozinho — sem estado manual.
  React.useEffect(() => {
    const t = setTimeout(() => setSearch(query), 350);
    return () => clearTimeout(t);
  }, [query]);

  const list = useConversationsInfinite({
    limit: PAGE,
    search: search || undefined,
    status: status === "all" ? undefined : status,
  });

  // Nomes reais dos contatos vinculados (o summary só traz contactId).
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
          options={STATUS_TABS}
          value={status}
          onValueChange={setStatus}
          className="w-full"
          ariaLabel="Filtrar por status"
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
          items.map((c) => {
            const active = c.id === selectedId;
            const name = conversationName(c, contactName(c.contactId));
            return (
              <li key={c.id}>
                <Link
                  href={`/conversations/${c.id}`}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex gap-3 border-b border-line px-3 py-3 transition-colors",
                    active ? "bg-brand-soft/50" : "hover:bg-surface",
                  )}
                >
                  <EntityAvatar name={name} size="md" className="shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          "flex items-center gap-1.5 truncate",
                          c.unreadCount > 0 ? "font-semibold text-ink" : "font-medium text-ink",
                        )}
                      >
                        <MessageCircle className="size-3.5 shrink-0 text-ink-3" aria-hidden />
                        <span className="truncate">{name}</span>
                      </span>
                      <span
                        className={cn(
                          "shrink-0 text-caption",
                          c.unreadCount > 0 ? "font-semibold text-brand" : "text-ink-3",
                        )}
                      >
                        {conversationTime(c.lastMessageAt)}
                      </span>
                    </div>
                    {c.unreadCount > 0 ? (
                      <div className="mt-0.5 flex justify-end">
                        <span className="flex size-5 items-center justify-center rounded-full bg-brand text-micro font-bold text-white">
                          {c.unreadCount}
                        </span>
                      </div>
                    ) : null}
                  </div>
                </Link>
              </li>
            );
          })
        )}

        {/* Cursor real: o botão só existe quando o backend diz que há mais. */}
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
