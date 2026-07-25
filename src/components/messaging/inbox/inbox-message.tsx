"use client";

import {
  AlertCircle,
  Ban,
  CalendarClock,
  Check,
  CheckCheck,
  Clock,
  Eye,
  FileText,
  ImageIcon,
  Loader2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { messageTime, publicStatus, type PublicStatusIcon } from "@/lib/messaging/display";
import type { ApiPublicMessage } from "@/types/api/messaging";

/** Formata o instante agendado no fuso local (dd/mm às hh:mm). */
function formatScheduled(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/**
 * Balão de mensagem da Inbox (Fase 6.2). Consome APENAS o DTO público
 * (`text`/`status`/`failure`) — nunca externalMessageId, clientMessageId ou
 * qualquer campo de provider. Texto é renderizado como texto puro (sem
 * dangerouslySetInnerHTML), preservando quebras de linha.
 */

const STATUS_ICON: Record<PublicStatusIcon, LucideIcon> = {
  clock: Clock,
  loader: Loader2,
  check: Check,
  "check-check": CheckCheck,
  eye: Eye,
  alert: AlertCircle,
};

/** Rótulo neutro quando o backend não mandou texto para uma mídia. */
const MEDIA_FALLBACK: Record<string, string> = {
  IMAGE: "Imagem",
  DOCUMENT: "Documento",
  AUDIO: "Áudio",
  VIDEO: "Vídeo",
};

export function InboxMessage({
  message: m,
  onCancel,
  canceling,
}: {
  message: ApiPublicMessage;
  onCancel?: (id: string) => void;
  canceling?: boolean;
}) {
  if (m.direction === "SYSTEM") {
    return (
      <div className="my-2 flex justify-center">
        <span className="max-w-[80%] rounded-full bg-line/60 px-3 py-1 text-center text-caption text-ink-2">
          {m.text ?? ""}
        </span>
      </div>
    );
  }

  const isOut = m.direction === "OUTBOUND";
  const failed = m.status === "FAILED";
  const canceled = m.status === "CANCELED";
  // Agendada = ainda na fila (QUEUED) com horário definido. Ao despachar, o status
  // sai de QUEUED (SENDING/SENT/FAILED) e o badge some — sem checar o relógio aqui.
  const scheduled = m.status === "QUEUED" && m.scheduledAt !== null;
  const isMedia = m.type !== "TEXT" && m.type !== "SYSTEM";
  const mediaLabel = m.text ?? MEDIA_FALLBACK[m.type] ?? "Anexo";

  return (
    <div className={cn("flex", isOut ? "justify-end" : "justify-start")} data-direction={m.direction}>
      <div
        className={cn(
          "max-w-[78%] rounded-2xl px-3 py-2 text-body2 shadow-sm sm:max-w-[65%]",
          isOut ? "rounded-br-md bg-brand text-white" : "rounded-bl-md border border-line bg-white text-ink",
          failed && "opacity-90 ring-1 ring-danger",
        )}
      >
        {isMedia ? (
          <MediaPlaceholder type={m.type} isOut={isOut} label={mediaLabel} />
        ) : m.text ? (
          <p className="whitespace-pre-wrap break-words">{m.text}</p>
        ) : null}

        {failed ? (
          <p className={cn("mt-1 text-caption", isOut ? "text-white/90" : "text-danger")} role="alert">
            {m.failure?.message ?? "Não foi possível enviar esta mensagem."}
          </p>
        ) : null}

        {scheduled ? (
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span
              className={cn(
                "inline-flex items-center gap-1 text-caption",
                isOut ? "text-white/90" : "text-ink-2",
              )}
            >
              <CalendarClock className="size-3.5" aria-hidden />
              Agendada • {formatScheduled(m.scheduledAt as string)}
            </span>
            {onCancel ? (
              <button
                type="button"
                disabled={canceling}
                onClick={() => onCancel(m.id)}
                className={cn(
                  "text-caption font-medium underline underline-offset-2 disabled:opacity-50",
                  isOut ? "text-white/90 hover:text-white" : "text-danger hover:opacity-80",
                )}
              >
                Cancelar
              </button>
            ) : null}
          </div>
        ) : null}

        {canceled ? (
          <p
            className={cn(
              "mt-1 inline-flex items-center gap-1 text-caption",
              isOut ? "text-white/80" : "text-ink-3",
            )}
          >
            <Ban className="size-3.5" aria-hidden /> Cancelada
          </p>
        ) : null}

        <div
          className={cn(
            "mt-1 flex items-center justify-end gap-1 text-[10px]",
            isOut ? "text-white/70" : "text-ink-3",
          )}
        >
          <span className="tabular-nums">
            {messageTime({ createdAt: m.createdAt, sentAt: m.sentAt, receivedAt: null })}
          </span>
          {isOut ? <StatusIcon status={m.status} /> : null}
        </div>
      </div>
    </div>
  );
}

/** Ícone do status PÚBLICO (outbound). O ícone vem do mapper central. */
function StatusIcon({ status }: { status: string }) {
  const meta = publicStatus(status);
  const Icon = STATUS_ICON[meta.icon];
  const spin = meta.icon === "loader";
  return <Icon className={cn("size-3", spin && "animate-spin")} aria-label={meta.label} />;
}

/** Placeholder de mídia — o texto/placeholder real vem do backend. */
function MediaPlaceholder({ type, isOut, label }: { type: string; isOut: boolean; label: string }) {
  const Icon = type === "IMAGE" ? ImageIcon : FileText;
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-lg p-2",
        isOut ? "bg-white/15" : "bg-surface",
      )}
    >
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg",
          isOut ? "bg-white/20 text-white" : "bg-brand-soft text-brand",
        )}
      >
        <Icon className="size-4" aria-hidden />
      </span>
      <span className="min-w-0 break-words font-medium">{label}</span>
    </div>
  );
}
