import type {
  ApiCampaignMetrics,
  CampaignStatus,
  RecipientStatus,
} from "@/types/api/campaigns";

type Tone = "neutral" | "info" | "success" | "warning" | "danger";

/** Único ponto de apresentação do status da campanha (rótulo + tom do badge). */
export const campaignStatusMeta: Record<CampaignStatus, { label: string; tone: Tone }> = {
  DRAFT: { label: "Rascunho", tone: "neutral" },
  SCHEDULED: { label: "Agendada", tone: "info" },
  PREPARING: { label: "Preparando", tone: "info" },
  SENDING: { label: "Enviando", tone: "info" },
  PAUSED: { label: "Pausada", tone: "warning" },
  COMPLETED: { label: "Concluída", tone: "success" },
  COMPLETED_WITH_ERRORS: { label: "Concluída c/ falhas", tone: "warning" },
  CANCELED: { label: "Cancelada", tone: "neutral" },
};

export function campaignStatusMetaOf(status: string): { label: string; tone: Tone } {
  return campaignStatusMeta[status as CampaignStatus] ?? { label: status, tone: "neutral" };
}

/** Rótulos humanos por motivo de exclusão (resumo executivo). */
export const EXCLUSION_LABELS: Record<string, string> = {
  NO_PHONE: "Sem telefone",
  INVALID_PHONE: "Telefone inválido",
  OPT_OUT: "Opt-out",
  SUPPRESSED: "Na supressão",
  DUPLICATE: "Duplicado",
  SELF: "Próprio número",
  NOT_IN_ALLOWLIST: "Fora da allowlist",
};

/** Instante ISO → dd/mm/aaaa HH:mm no fuso informado (empresa). */
export function formatDateTime(iso: string | null, timeZone?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...(timeZone ? { timeZone } : {}),
  }).format(d);
}

/**
 * Rótulo AMIGÁVEL de uma conta de WhatsApp — nunca o UUID interno. Preferência:
 * displayName → name → "Conta de WhatsApp", com o número quando houver.
 */
export function accountLabel(
  a?: { name?: string | null; displayName?: string | null; phoneNumber?: string | null } | null,
): string {
  if (!a) return "—";
  const name = a.displayName || a.name || "Conta de WhatsApp";
  return a.phoneNumber ? `${name} · ${a.phoneNumber}` : name;
}

/* ---------- Destinatários (Sprint C2B) ---------- */

/** Ponto único de apresentação do status do destinatário. */
export const recipientStatusMeta: Record<RecipientStatus, { label: string; tone: Tone }> = {
  PENDING: { label: "Pendente", tone: "neutral" },
  EXCLUDED: { label: "Excluído", tone: "neutral" },
  QUEUED: { label: "Enfileirado", tone: "info" },
  SENDING: { label: "Enviando", tone: "info" },
  SENT: { label: "Enviado", tone: "info" },
  DELIVERED: { label: "Entregue", tone: "success" },
  READ: { label: "Lido", tone: "success" },
  FAILED: { label: "Falhou", tone: "danger" },
  CANCELED: { label: "Cancelado", tone: "neutral" },
};

export function recipientStatusMetaOf(status: string): { label: string; tone: Tone } {
  return recipientStatusMeta[status as RecipientStatus] ?? { label: status, tone: "neutral" };
}

/* ---------- Timeline (Sprint C2B) ---------- */

/** Rótulo humano por evento de AuditLog (nunca expor a constante crua). */
export const TIMELINE_EVENT_LABELS: Record<string, string> = {
  MESSAGE_CAMPAIGN_CREATED: "Campanha criada",
  MESSAGE_CAMPAIGN_UPDATED: "Campanha editada",
  MESSAGE_CAMPAIGN_SCHEDULED: "Público congelado e agendada",
  MESSAGE_CAMPAIGN_STARTED: "Execução iniciada",
  MESSAGE_CAMPAIGN_PAUSED: "Execução pausada",
  MESSAGE_CAMPAIGN_RESUMED: "Execução retomada",
  MESSAGE_CAMPAIGN_CANCELED: "Campanha cancelada",
  MESSAGE_CAMPAIGN_COMPLETED: "Processamento concluído",
  MESSAGE_CAMPAIGN_DUPLICATED: "Campanha duplicada",
  MESSAGE_CAMPAIGN_DELETED: "Campanha excluída",
};

export function timelineEventLabel(event: string): string {
  return TIMELINE_EVENT_LABELS[event] ?? event;
}

/* ---------- Métricas (Sprint C2B) ---------- */

/** Percentual de progresso (0–100) já pronto do backend → "45%". */
export function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return `${Math.round(value)}%`;
}

/** Taxa fracionária (0–1, ex.: deliveryRate) → "80%". Sem NaN. */
export function formatRate(rate: number): string {
  if (!Number.isFinite(rate)) return "—";
  return `${Math.round(Math.min(1, Math.max(0, rate)) * 100)}%`;
}

/** Duração amigável a partir de segundos. */
export function formatDuration(seconds: number | null): string {
  if (seconds == null || !Number.isFinite(seconds) || seconds < 0) return "—";
  const s = Math.round(seconds);
  if (s < 60) return `${s} s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem > 0 ? `${h} h ${rem} min` : `${h} h`;
}

/**
 * ETA para exibição, robusto a cada estado (nunca contagem enganosa):
 * pausada/cancelada não mostram contagem; concluída mostra duração total;
 * em execução mostra tempo restante ou "Calculando..." quando faltam dados.
 */
export function etaDisplay(
  status: string,
  metrics: Pick<ApiCampaignMetrics, "remainingSeconds" | "startedAt" | "completedAt"> | undefined,
): { label: string; value: string } {
  if (status === "CANCELED") return { label: "Situação", value: "Cancelada" };
  if (status === "PAUSED") return { label: "Situação", value: "Pausada" };
  if (status === "COMPLETED" || status === "COMPLETED_WITH_ERRORS") {
    const total = totalDurationSeconds(metrics?.startedAt, metrics?.completedAt);
    return { label: "Duração total", value: total != null ? formatDuration(total) : "—" };
  }
  // SCHEDULED / PREPARING / SENDING
  if (metrics?.remainingSeconds != null) {
    return { label: "Conclusão estimada", value: formatDuration(metrics.remainingSeconds) };
  }
  return { label: "Conclusão estimada", value: "Calculando…" };
}

function totalDurationSeconds(startedAt?: string | null, completedAt?: string | null): number | null {
  if (!startedAt || !completedAt) return null;
  const a = new Date(startedAt).getTime();
  const b = new Date(completedAt).getTime();
  if (Number.isNaN(a) || Number.isNaN(b) || b < a) return null;
  return (b - a) / 1000;
}
