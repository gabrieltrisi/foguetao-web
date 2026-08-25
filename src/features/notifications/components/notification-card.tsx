"use client";

import * as React from "react";
import { Archive, Check, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ApiNotification } from "@/types/api/notifications";
import { priorityMeta, typeMeta } from "../presentation";
import { formatNotificationTime, fullNotificationTimestamp } from "../format";
import { NotificationTypeIcon } from "./notification-icon";

export interface NotificationCardProps {
  notification: ApiNotification;
  now: Date;
  canManage: boolean;
  onMarkRead: (id: string) => void;
  onArchive: (id: string) => void;
  onOpen?: (notification: ApiNotification) => void;
  busy?: boolean;
}

/**
 * Card de uma notificação. Ícone (por tipo) + prioridade + tipo + título +
 * mensagem + tempo relativo + status (não lida). Ações: marcar lida, arquivar,
 * abrir recurso (quando há `actionUrl`). `React.memo` — a lista não re-renderiza
 * um card por causa de outro.
 */
export const NotificationCard = React.memo(function NotificationCard({
  notification,
  now,
  canManage,
  onMarkRead,
  onArchive,
  onOpen,
  busy = false,
}: NotificationCardProps) {
  const { tone, label: priorityLabel } = priorityMeta(notification.priority);
  const { label: typeLabel } = typeMeta(notification.type);
  const unread = !notification.read;

  return (
    <article
      className={cn(
        "flex gap-3 rounded-lg border border-line p-3 transition-colors",
        unread ? "bg-brand-soft/30" : "bg-white",
      )}
      aria-label={`Notificação: ${notification.title}`}
    >
      <div
        className={cn(
          "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg",
          unread ? "bg-brand text-white" : "bg-surface text-ink-2",
        )}
      >
        <NotificationTypeIcon type={notification.type} className="size-4.5" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Badge tone={tone} size="sm">
            {priorityLabel}
          </Badge>
          <span className="text-micro font-medium uppercase tracking-wide text-ink-3">
            {typeLabel}
          </span>
          {unread ? (
            <span className="size-2 rounded-full bg-brand" aria-label="Não lida" />
          ) : null}
          <time
            className="ml-auto shrink-0 text-caption text-ink-3"
            dateTime={notification.createdAt}
            title={fullNotificationTimestamp(notification.createdAt)}
          >
            {formatNotificationTime(notification.createdAt, now)}
          </time>
        </div>

        <h4 className="mt-1 truncate text-body2 font-semibold text-ink">{notification.title}</h4>
        <p className="mt-0.5 line-clamp-2 text-caption text-ink-2">{notification.message}</p>

        <div className="mt-2 flex items-center gap-1.5">
          {notification.actionUrl && onOpen ? (
            <button
              type="button"
              onClick={() => onOpen(notification)}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-caption font-medium text-brand-dark hover:bg-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <ExternalLink className="size-3.5" aria-hidden />
              Abrir
            </button>
          ) : null}
          {canManage && unread ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => onMarkRead(notification.id)}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-caption font-medium text-ink-2 hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-50"
            >
              <Check className="size-3.5" aria-hidden />
              Marcar lida
            </button>
          ) : null}
          {canManage && !notification.archived ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => onArchive(notification.id)}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-caption font-medium text-ink-2 hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-50"
            >
              <Archive className="size-3.5" aria-hidden />
              Arquivar
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
});
