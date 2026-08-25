"use client";

import * as React from "react";
import { AlertTriangle, FileText, Pencil, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { EntityAvatar } from "@/components/business/entity-avatar";
import { channelPresentation, formatConversationTime, fullTimestamp, previewText, statusMeta } from "@/features/inbox/format";
import type { ConversationListItemVM } from "@/features/inbox/view-models";

const STATUS_DOT: Record<string, string> = {
  neutral: "bg-ink-3",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  brand: "bg-brand",
};

/**
 * Item da lista de conversas (F1). Componente PURO de apresentação — recebe o
 * view model + o nome resolvido; não busca dados. Hierarquia: contato > preview >
 * tempo > unread/status > metadados. Acessível: `aria-current`, foco visível,
 * unread anunciado, sem nested buttons. Estilo final fica para F8.
 */
export const ConversationListItem = React.memo(function ConversationListItem({
  item,
  name,
  active,
  hasDraft,
  onSelect,
  now,
}: {
  item: ConversationListItemVM;
  name: string;
  active: boolean;
  hasDraft?: boolean;
  onSelect: (id: string) => void;
  now: Date;
}) {
  const unread = item.unread > 0;
  const channel = channelPresentation(item.channel);
  const preview = previewText(
    item.preview !== null || item.previewType !== null
      ? { preview: item.preview, type: item.previewType ?? "TEXT" }
      : null,
  );
  const status = statusMeta(item.status);
  const time = formatConversationTime(item.lastActivityAt, now);
  const visibleLabels = item.labels.slice(0, 2);
  const extraLabels = item.labels.length - visibleLabels.length;

  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      aria-current={active ? "true" : undefined}
      aria-label={`${name}${unread ? `, ${item.unread} não lidas` : ""}`}
      className={cn(
        "flex w-full gap-3 border-b border-line px-3 py-3 text-left transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand",
        active ? "bg-brand-soft/50" : "hover:bg-surface",
      )}
    >
      <EntityAvatar name={name} size="md" className="shrink-0" />

      <div className="min-w-0 flex-1">
        {/* Linha 1: nome + canal + tempo */}
        <div className="flex items-center justify-between gap-2">
          <span className={cn("flex min-w-0 items-center gap-1.5", unread ? "font-semibold text-ink" : "font-medium text-ink")}>
            <span
              className="shrink-0 rounded bg-surface px-1 py-0.5 text-micro font-medium text-ink-3"
              title={channel.label}
              aria-label={channel.label}
            >
              {channel.label}
            </span>
            <span className="truncate">{name}</span>
          </span>
          <span
            className={cn("shrink-0 text-caption", unread ? "font-semibold text-brand" : "text-ink-3")}
            title={fullTimestamp(item.lastActivityAt)}
          >
            {time}
          </span>
        </div>

        {/* Linha 2: preview + unread */}
        <div className="mt-0.5 flex items-center justify-between gap-2">
          <span className="min-w-0 flex-1 truncate text-caption text-ink-3">
            {hasDraft ? (
              <span className="inline-flex items-center gap-1 text-warning">
                <Pencil className="size-3 shrink-0" aria-hidden />
                Rascunho
              </span>
            ) : preview ? (
              preview
            ) : (
              <span className="italic text-ink-3">Sem mensagens</span>
            )}
          </span>
          {unread ? (
            <span
              className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-brand px-1.5 text-micro font-bold text-white"
              aria-hidden
            >
              {item.unread > 99 ? "99+" : item.unread}
            </span>
          ) : null}
        </div>

        {/* Linha 3: status + labels + assignment/falha (metadados secundários) */}
        <div className="mt-1 flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 text-micro text-ink-3" title={status.label}>
            <span className={cn("size-1.5 rounded-full", STATUS_DOT[status.tone] ?? STATUS_DOT.neutral)} aria-hidden />
            {status.label}
          </span>
          {visibleLabels.map((l) => (
            <span
              key={l.id}
              className="inline-flex max-w-[6rem] items-center gap-1 truncate rounded px-1 text-micro"
              style={{ backgroundColor: `${l.color}22`, color: l.color }}
              title={l.name}
            >
              <span className="truncate">{l.name}</span>
            </span>
          ))}
          {extraLabels > 0 ? <span className="text-micro text-ink-3">+{extraLabels}</span> : null}
          <span className="ml-auto flex items-center gap-1.5">
            {item.assignedToUserId ? (
              <User className="size-3 text-ink-3" aria-label="Atribuída" />
            ) : null}
            {!item.canSend ? (
              <AlertTriangle className="size-3 text-warning" aria-label="Envio indisponível" />
            ) : null}
            {item.previewType && ["DOCUMENT", "IMAGE", "VIDEO", "AUDIO"].includes(item.previewType) ? (
              <FileText className="size-3 text-ink-3" aria-hidden />
            ) : null}
          </span>
        </div>
      </div>
    </button>
  );
});
