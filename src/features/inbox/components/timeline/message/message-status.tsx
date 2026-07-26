"use client";

import { AlertCircle, Ban, Check, CheckCheck, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Status PÚBLICO de mensagem outbound (F2B). Mapeamento CENTRAL (ícone/label/tom) —
 * nunca espalhar switch. Renderiza o estado vindo do cache/API (atualização fina é
 * F2C). READ ganha destaque; FAILED/CANCELED têm tom próprio.
 */
const META: Record<string, { label: string; Icon: typeof Check; tone: string }> = {
  QUEUED: { label: "Na fila", Icon: Clock, tone: "text-white/60" },
  SENDING: { label: "Enviando", Icon: Loader2, tone: "text-white/60" },
  SENT: { label: "Enviada", Icon: Check, tone: "text-white/60" },
  DELIVERED: { label: "Entregue", Icon: CheckCheck, tone: "text-white/70" },
  READ: { label: "Lida", Icon: CheckCheck, tone: "text-info" },
  FAILED: { label: "Falhou", Icon: AlertCircle, tone: "text-danger" },
  CANCELED: { label: "Cancelada", Icon: Ban, tone: "text-white/50" },
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
