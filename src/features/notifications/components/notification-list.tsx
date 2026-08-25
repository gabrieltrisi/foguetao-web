"use client";

import { BellOff } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import type { ApiNotification } from "@/types/api/notifications";
import { NotificationCard } from "./notification-card";

export interface NotificationListProps {
  items: ApiNotification[];
  now: Date;
  canManage: boolean;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  onMarkRead: (id: string) => void;
  onArchive: (id: string) => void;
  onOpen?: (notification: ApiNotification) => void;
  busyId?: string | null;
}

/** LoadingState — esqueleto de linhas. */
function LoadingState() {
  return (
    <div className="space-y-2" aria-hidden>
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex gap-3 rounded-lg border border-line p-3">
          <Skeleton className="size-9 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3.5 w-3/4" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Lista de notificações + estados (loading/erro/vazio) e "carregar mais".
 * Apresentacional: recebe dados e handlers do painel.
 */
export function NotificationList({
  items,
  now,
  canManage,
  isLoading,
  isError,
  onRetry,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  onMarkRead,
  onArchive,
  onOpen,
  busyId,
}: NotificationListProps) {
  if (isLoading) return <LoadingState />;

  if (isError) {
    return (
      <ErrorState
        variant="card"
        title="Não foi possível carregar"
        message="Tente novamente em instantes."
        onRetry={onRetry}
      />
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        compact
        icon={BellOff}
        title="Você está em dia"
        description="Nenhuma notificação por aqui."
      />
    );
  }

  return (
    <div className="space-y-2">
      {items.map((notification) => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          now={now}
          canManage={canManage}
          onMarkRead={onMarkRead}
          onArchive={onArchive}
          onOpen={onOpen}
          busy={busyId === notification.id}
        />
      ))}
      {hasNextPage ? (
        <button
          type="button"
          onClick={onLoadMore}
          disabled={isFetchingNextPage}
          className="w-full rounded-lg border border-line py-2 text-caption font-medium text-ink-2 hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-50"
        >
          {isFetchingNextPage ? "Carregando…" : "Carregar mais"}
        </button>
      ) : null}
    </div>
  );
}
