"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { Skeleton } from "@/components/ui/skeleton";
import { EntityAvatar } from "@/components/business/entity-avatar";
import { useSession } from "@/providers/session-provider";
import { useConversations } from "@/hooks/messaging/use-conversations";
import { useContacts } from "@/hooks/crm/use-contacts";
import { conversationName, conversationTime } from "@/lib/messaging/display";

const LIMIT = 4;

/**
 * Conversas recentes — REAL, consumindo exatamente a mesma fonte do módulo de
 * Comunicação (`GET /messaging/conversations` via `useConversations`). Dashboard
 * e Conversas compartilham a mesma verdade: mesmo hook, mesmo contrato, mesmo
 * cache do TanStack Query.
 */
export function RecentConversations() {
  const { can } = useSession();
  const { data, isLoading, isError } = useConversations({ limit: LIMIT });
  const contacts = useContacts({ limit: 100 });

  const header = (
    <SectionHeader
      title="Conversas recentes"
      action={
        <Link href="/conversations" className="text-body2 font-medium text-brand hover:text-brand-dark">
          Abrir inbox
        </Link>
      }
    />
  );

  if (!can("messaging.conversations.read")) {
    return (
      <Card className="flex flex-col p-5">
        {header}
        <p className="mt-6 text-body2 text-ink-3">
          Você não tem permissão para ver conversas.
        </p>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="flex flex-col gap-3 p-5">
        {header}
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="flex flex-col p-5">
        {header}
        <p role="alert" className="mt-6 text-body2 text-danger">
          Não foi possível carregar as conversas.
        </p>
      </Card>
    );
  }

  const items = data?.items ?? [];

  if (items.length === 0) {
    return (
      <Card className="flex flex-col p-5">
        {header}
        <p className="mt-6 text-body2 text-ink-3">Nenhuma conversa ainda.</p>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col p-5">
      {header}
      <ul className="mt-4 flex flex-col gap-4">
        {items.map((c) => {
          const name = conversationName(
            c,
            c.contactId
              ? (contacts.data?.items.find((x) => x.id === c.contactId)?.fullName ?? null)
              : null,
          );
          return (
            <li key={c.id}>
              <Link href={`/conversations/${c.id}`} className="flex items-start gap-3">
                <EntityAvatar name={name} size="sm" className="size-9" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-body2 font-semibold text-ink">{name}</p>
                    <span className="shrink-0 text-caption text-ink-3">
                      {conversationTime(c.lastMessageAt)}
                    </span>
                  </div>
                  {/* O contrato não traz preview na LISTAGEM — não inventamos um. */}
                </div>
                {c.unreadCount > 0 ? (
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-brand text-micro font-bold text-white">
                    {c.unreadCount}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
