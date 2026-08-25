"use client";

import { AlertCircle, Ban, Check, CheckCheck, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Status PÚBLICO de mensagem outbound (F2B/F2D). Mapeamento CENTRAL (ícone/label/tom)
 * — nunca espalhar switch. Renderiza o estado vindo do cache/API. Os tons são para a
 * bolha CLARA (`bg-brand-soft`): tons de tinta (não `text-white/*`, que sumia no modo
 * claro — F2D H1). READ ganha destaque (info); FAILED/CANCELED têm tom próprio.
 */
const META: Record<string, { label: string; Icon: typeof Check; tone: string }> = {
  QUEUED: { label: "Na fila", Icon: Clock, tone: "text-ink-3" },
  SENDING: { label: "Enviando", Icon: Loader2, tone: "text-ink-3" },
  SENT: { label: "Enviada", Icon: Check, tone: "text-ink-3" },
  DELIVERED: { label: "Entregue", Icon: CheckCheck, tone: "text-ink-2" },
  READ: { label: "Lida", Icon: CheckCheck, tone: "text-info" },
  FAILED: { label: "Falhou", Icon: AlertCircle, tone: "text-danger" },
  CANCELED: { label: "Cancelada", Icon: Ban, tone: "text-ink-3" },
};

export function MessageStatus({ status, muted }: { status: string; muted?: boolean }) {
  const meta = META[status];
  if (!meta) return null;
  const { label, Icon, tone } = meta;
  return (
    <span
      className={cn("inline-flex items-center", muted && status !== "READ" && status !== "FAILED" ? "opacity-80" : "", tone)}
      title={label}
      aria-label={label}
      role="img"
    >
      <Icon className={cn("size-3.5", status === "SENDING" && "animate-spin")} aria-hidden />
    </span>
  );
}
