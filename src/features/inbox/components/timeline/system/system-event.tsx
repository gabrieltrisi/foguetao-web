"use client";

import { fullTimestamp } from "@/features/inbox/format";

const time = (iso: string) =>
  new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

/**
 * Evento de sistema (F2B) — elemento CENTRALIZADO e discreto (nunca bolha, nunca
 * agrupado com mensagens). Ex.: conversa atribuída/encerrada/reaberta, label
 * adicionada. Renderiza só o que o backend fornece; sem inventar eventos.
 */
export function SystemEvent({ text, at }: { text: string | null; at: string }) {
  return (
    <div className="my-2 flex justify-center px-4" role="listitem">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-0.5 text-micro text-ink-2">
        {text ?? "Evento"}
        <span className="opacity-70" title={fullTimestamp(at)}>
          · {time(at)}
        </span>
      </span>
    </div>
  );
}
