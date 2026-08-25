"use client";

import * as React from "react";
import { ArrowDown, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fullTimestamp } from "@/features/inbox/format";
import type { TimelineMessageVM } from "@/features/inbox/view-models";
import type { GroupMeta } from "@/features/inbox/timeline";

/** Separador de dia (centralizado, acessível). */
export function DaySeparator({ label }: { label: string }) {
  return (
    <div className="my-2 flex items-center gap-3 px-4" role="separator" aria-label={label}>
      <span className="h-px flex-1 bg-line" />
      <span className="rounded-full bg-surface px-2 py-0.5 text-caption text-ink-3">{label}</span>
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}

/** Separador de mensagens não lidas (só quando há não lidas do usuário atual). */
export function UnreadSeparator() {
  return (
    <div className="my-2 flex items-center gap-3 px-4" role="separator" aria-label="Novas mensagens">
      <span className="h-px flex-1 bg-brand/40" />
      <span className="rounded-full bg-brand-soft px-2 py-0.5 text-caption font-medium text-brand">
        Não lidas
      </span>
      <span className="h-px flex-1 bg-brand/40" />
    </div>
  );
}

/** Indicador discreto de novas mensagens (usuário lendo histórico). */
export function NewMessagesIndicator({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
      <button
        type="button"
        onClick={onClick}
        className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1.5 text-caption font-medium text-white shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
      >
        <ArrowDown className="size-3.5" aria-hidden />
        {count > 1 ? `${count} novas mensagens` : "Nova mensagem"}
      </button>
    </div>
  );
}

/** Skeleton inicial da timeline (simula in/out, alturas variadas). */
export function TimelineSkeleton() {
  return (
    <div className="flex flex-col gap-3 p-4" aria-hidden>
      {[
        "h-10 w-1/2",
        "h-10 w-2/3 self-end",
        "h-16 w-3/5",
        "h-8 w-1/3 self-end",
        "h-12 w-1/2",
      ].map((c, i) => (
        <Skeleton key={i} className={c} />
      ))}
    </div>
  );
}

/** Estado vazio (conversa válida sem mensagens). */
export function TimelineEmpty() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center text-ink-3">
      <p className="text-body2">Ainda não há mensagens nesta conversa.</p>
    </div>
  );
}

/** Erro inicial (central, com retry). */
export function TimelineError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div role="alert" className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
      <AlertTriangle className="size-6 text-danger" aria-hidden />
      <p className="text-body2 text-danger">{message}</p>
      <Button size="sm" variant="secondary" onClick={onRetry}>
        Tentar novamente
      </Button>
    </div>
  );
}

/**
 * Linha ESTRUTURAL de mensagem (F2A) — placeholder funcional; a renderização final
 * (bolhas/mídia/status/ações) vem em F2B. Distingue nota interna (nunca confundida
 * com mensagem pública) e alinha por direção. Sistema fica centralizado.
 */
export const TimelineMessageRow = React.memo(function TimelineMessageRow({
  message: m,
  group,
}: {
  message: TimelineMessageVM;
  group: GroupMeta;
}) {
  if (m.kind === "system") {
    return (
      <div className="my-1 flex justify-center px-4">
        <span className="rounded-full bg-surface px-2 py-0.5 text-micro text-ink-3">{m.text}</span>
      </div>
    );
  }
  const outbound = m.direction === "OUTBOUND";
  const internal = m.kind === "internal";
  return (
    <div className={cn("flex px-4", outbound ? "justify-end" : "justify-start", group.firstInGroup ? "mt-2" : "mt-0.5")}>
      <div
        className={cn(
          "max-w-[75%] rounded-lg px-3 py-1.5 text-body2",
          internal
            ? "border border-warning/40 bg-warning/10 text-ink"
            : outbound
              ? "bg-brand text-white"
              : "bg-surface text-ink",
        )}
      >
        {internal ? (
          <span className="mb-0.5 block text-micro font-semibold uppercase text-warning">Nota interna</span>
        ) : null}
        <span className="whitespace-pre-wrap break-words">
          {m.text ?? <span className="italic opacity-70">(sem texto)</span>}
        </span>
        {group.showTimestamp ? (
          <span
            className={cn("ml-2 align-baseline text-micro", internal ? "text-ink-3" : outbound ? "text-white/70" : "text-ink-3")}
            title={fullTimestamp(m.createdAt)}
          >
            {new Date(m.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
          </span>
        ) : null}
      </div>
    </div>
  );
});
