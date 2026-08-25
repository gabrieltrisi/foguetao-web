"use client";

import * as React from "react";
import { CheckCheck } from "lucide-react";
import { useSession } from "@/providers/session-provider";
import type { ApiNotification, NotificationStatusFilter } from "@/types/api/notifications";
import { NOTIFICATION_PERMISSIONS } from "../constants";
import { useNotifications } from "../hooks/use-notifications";
import {
  useArchiveNotification,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
} from "../hooks/use-notification-mutations";
import { NotificationFilters } from "./notification-filters";
import { NotificationList } from "./notification-list";

/**
 * Painel de notificações: cabeçalho (título + marcar todas), filtros, lista
 * paginada com estados. Encapsula os hooks de dados; a lista é apresentacional.
 * `now` é fixado na montagem (o painel é lazy-montado ao abrir).
 */
export function NotificationPanel({ onOpenItem }: { onOpenItem?: (n: ApiNotification) => void }) {
  const { can } = useSession();
  const canManage = can(NOTIFICATION_PERMISSIONS.update);
  const now = React.useMemo(() => new Date(), []);
  const [status, setStatus] = React.useState<NotificationStatusFilter>("all");

  const query = useNotifications({ status });
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const archive = useArchiveNotification();

  const items = React.useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data],
  );

  const busyId = markRead.isPending
    ? (markRead.variables ?? null)
    : archive.isPending
      ? (archive.variables ?? null)
      : null;

  return (
    <div className="flex max-h-[70vh] w-[22rem] flex-col sm:w-96">
      <header className="flex items-center justify-between gap-2 border-b border-line px-3 py-2.5">
        <h2 className="text-body2 font-semibold text-ink">Notificações</h2>
        {canManage ? (
          <button
            type="button"
            onClick={() => markAll.mutate()}
            disabled={markAll.isPending}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-caption font-medium text-brand-dark hover:bg-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-50"
          >
            <CheckCheck className="size-3.5" aria-hidden />
            Marcar todas
          </button>
        ) : null}
      </header>

      <div className="border-b border-line px-3 py-2">
        <NotificationFilters value={status} onChange={setStatus} />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <NotificationList
          items={items}
          now={now}
          canManage={canManage}
          isLoading={query.isLoading}
          isError={query.isError}
          onRetry={() => query.refetch()}
          hasNextPage={Boolean(query.hasNextPage)}
          isFetchingNextPage={query.isFetchingNextPage}
          onLoadMore={() => query.fetchNextPage()}
          onMarkRead={(id) => markRead.mutate(id)}
          onArchive={(id) => archive.mutate(id)}
          onOpen={onOpenItem}
          busyId={busyId}
        />
      </div>
    </div>
  );
}
