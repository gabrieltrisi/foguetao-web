"use client";

import * as React from "react";
import { AlertTriangle, CornerUpLeft, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/toast";
import { fullTimestamp } from "@/features/inbox/format";
import { messageAriaLabel } from "@/features/inbox/message-format";
import type { TimelineMessageVM } from "@/features/inbox/view-models";
import type { GroupMeta } from "@/features/inbox/timeline";
import { MessageText } from "./message-text";
import { MessageStatus } from "./message-status";
import { highlightMessage } from "./highlight";
import { MediaCard } from "../media/media-card";
import { InternalNote } from "../note/internal-note";
import { SystemEvent } from "../system/system-event";

const time = (iso: string) =>
  new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

/** Prévia de resposta (F2B): autor + trecho/tipo; clique localiza a original (se carregada). */
function ReplyPreview({ replyToId, outbound }: { replyToId: string; outbound?: boolean }) {
  return (
    <button
      type="button"
      onClick={() => highlightMessage(replyToId)}
      className={cn(
        "mb-1 flex w-full items-center gap-1.5 truncate rounded border-l-2 px-2 py-1 text-left text-micro",
        outbound ? "border-white/50 bg-white/10 text-white/80" : "border-brand/50 bg-surface text-ink-2",
      )}
      title="Ir para a mensagem respondida"
    >
      <CornerUpLeft className="size-3 shrink-0" aria-hidden />
      <span className="truncate">Resposta a uma mensagem</span>
    </button>
  );
}

/**
 * Renderiza UMA mensagem da timeline (F2B): nota interna, evento de sistema ou bolha
 * pública (inbound/outbound) com reply, mídia (card de metadados), texto seguro,
 * horário, status e ações (copiar/responder). Agrupamento pelos metadados da F2A
 * (espaçamento/cantos/horário). Componente PURO de apresentação (recebe VM + nome).
 */
export const MessageRow = React.memo(function MessageRow({
  message: m,
  group,
  senderName,
  onReply,
  onRetry,
}: {
  message: TimelineMessageVM;
  group: GroupMeta;
  senderName: string;
  onReply?: (id: string) => void;
  onRetry?: (message: TimelineMessageVM) => void;
}) {
  const { toast } = useToast();
  if (m.kind === "system") return <SystemEvent text={m.text} at={m.createdAt} />;
  if (m.kind === "internal") {
    return <InternalNote message={m} senderName={senderName} group={group} />;
  }

  const outbound = m.direction === "OUTBOUND";
  const noContent = !m.text && !m.hasMedia;

  const copyText = async () => {
    if (!m.text) return;
    try {
      await navigator.clipboard.writeText(m.text);
      toast({ title: "Texto copiado", variant: "success" });
    } catch {
      toast({ title: "Não foi possível copiar", variant: "error" });
    }
  };

  return (
    <div
      data-message-id={m.id}
      className={cn("group/msg flex px-4", outbound ? "justify-end" : "justify-start", group.firstInGroup ? "mt-3" : "mt-0.5")}
      aria-label={messageAriaLabel(m, senderName)}
    >
      <div className={cn("flex max-w-[85%] items-end gap-1 sm:max-w-[75%]", outbound && "flex-row-reverse")}>
        <div
          className={cn(
            "min-w-0 rounded-2xl px-3 py-2 text-body2",
            outbound ? "bg-brand-soft text-ink" : "bg-white text-ink ring-1 ring-line",
            group.position === "first" && (outbound ? "rounded-br-md" : "rounded-bl-md"),
            group.position === "middle" && (outbound ? "rounded-r-md" : "rounded-l-md"),
            group.position === "last" && (outbound ? "rounded-tr-md" : "rounded-tl-md"),
          )}
        >
          {group.showSender && !outbound ? (
            <p className="mb-0.5 text-micro font-semibold text-ink-2">{senderName}</p>
          ) : null}

          {m.replyToMessageId ? <ReplyPreview replyToId={m.replyToMessageId} /> : null}
          {m.hasMedia && m.mediaId ? (
            <div className="my-1">
              <MediaCard mediaId={m.mediaId} messageType={m.type} />
            </div>
          ) : null}

          {m.text ? (
            <MessageText text={m.text} />
          ) : noContent ? (
            <span className="text-caption italic text-ink-3">Tipo de mensagem não suportado</span>
          ) : null}

          <span className="ml-2 inline-flex items-center gap-1 align-baseline">
            {group.showTimestamp ? (
              <span className="text-micro text-ink-3" title={fullTimestamp(m.createdAt)}>
                {time(m.createdAt)}
              </span>
            ) : null}
            {outbound ? <MessageStatus status={m.status} muted /> : null}
          </span>

          {m.isFailed ? (
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span className="inline-flex items-center gap-1 text-micro text-danger">
                <AlertTriangle className="size-3" aria-hidden />
                {m.failure?.message ?? "Falha no envio"}
              </span>
              {outbound && onRetry ? (
                <button
                  type="button"
                  onClick={() => onRetry(m)}
                  className="text-micro font-semibold text-danger underline underline-offset-2 hover:text-danger/80"
                >
                  Tentar novamente
                </button>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* Ações (hover no desktop; sempre acessível por teclado). */}
        {m.text || onReply ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="shrink-0 opacity-0 transition-opacity focus-visible:opacity-100 group-hover/msg:opacity-100"
                aria-label="Ações da mensagem"
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={outbound ? "end" : "start"}>
              {onReply ? (
                <DropdownMenuItem onSelect={() => onReply(m.id)}>Responder</DropdownMenuItem>
              ) : null}
              {m.text ? <DropdownMenuItem onSelect={copyText}>Copiar texto</DropdownMenuItem> : null}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>
    </div>
  );
});
