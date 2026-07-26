"use client";

import { Lock } from "lucide-react";
import { fullTimestamp } from "@/features/inbox/format";
import type { TimelineMessageVM } from "@/features/inbox/view-models";
import type { GroupMeta } from "@/features/inbox/timeline";
import { MessageText } from "../message/message-text";

const time = (iso: string) =>
  new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

/**
 * Nota interna (F2B) — IMPOSSÍVEL de confundir com mensagem pública. Estilo/cor
 * semânticos EXCLUSIVOS (âmbar), rótulo "Nota interna" sempre visível (mesmo
 * agrupada), autor e horário. Nunca usa o estilo de outbound público. Centralizada
 * com largura própria. Nunca vaza para preview/notificações do cliente (backend).
 */
export function InternalNote({
  message: m,
  senderName,
  group,
}: {
  message: TimelineMessageVM;
  senderName: string;
  group: GroupMeta;
}) {
  return (
    <div className={group.firstInGroup ? "mt-3 px-4" : "mt-0.5 px-4"} role="listitem" aria-label={`Nota interna de ${senderName}`}>
      <div className="mx-auto max-w-[90%] rounded-lg border border-warning/40 bg-warning/10 px-3 py-2">
        <div className="mb-0.5 flex items-center gap-1.5 text-micro font-semibold uppercase tracking-wide text-warning">
          <Lock className="size-3" aria-hidden />
          Nota interna
          <span className="ml-auto font-normal normal-case text-ink-3">{senderName}</span>
        </div>
        {m.text ? (
          <div className="text-body2 text-ink">
            <MessageText text={m.text} onLink="underline decoration-warning/60 underline-offset-2" />
          </div>
        ) : (
          <span className="text-caption italic text-ink-3">(sem texto)</span>
        )}
        <span className="mt-0.5 block text-right text-micro text-ink-3" title={fullTimestamp(m.createdAt)}>
          {time(m.createdAt)}
        </span>
      </div>
    </div>
  );
}
