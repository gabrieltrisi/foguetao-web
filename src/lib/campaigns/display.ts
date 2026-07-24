import type { CampaignStatus } from "@/types/api/campaigns";

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
