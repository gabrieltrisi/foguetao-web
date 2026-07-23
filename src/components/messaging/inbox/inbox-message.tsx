"use client";

import { AlertCircle, Check, CheckCheck, Clock, Eye, FileText, ImageIcon, Loader2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { messageTime, publicStatus, type PublicStatusIcon } from "@/lib/messaging/display";
import type { ApiPublicMessage } from "@/types/api/messaging";

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

export function InboxMessage({ message: m }: { message: ApiPublicMessage }) {
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
