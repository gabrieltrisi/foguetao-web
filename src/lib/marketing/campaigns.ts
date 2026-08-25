import type { BadgeProps } from "@/components/ui/badge";
import { isApiError } from "@/types/api/error";
import type {
  ApiCampaign,
  ApiCampaignChannel,
  ApiCampaignObjective,
  ApiCampaignStatus,
  CampaignAction,
} from "@/types/api/marketing";

type Tone = NonNullable<BadgeProps["tone"]>;

/**
 * Apresentação de campanhas.
 *
 * O contrato NÃO tem métrica de mídia (spent/leads/CPL/CPC/CPM/ROAS/CTR/…) —
 * esses dados são de providers externos e do domínio de Performance. Nada aqui
 * exibe ou calcula esse tipo de número.
 */

/* ---------- Rótulos ---------- */

export const campaignStatusMeta: Record<ApiCampaignStatus, { label: string; tone: Tone }> = {
  DRAFT: { label: "Rascunho", tone: "neutral" },
  SCHEDULED: { label: "Agendada", tone: "info" },
  ACTIVE: { label: "Ativa", tone: "success" },
  PAUSED: { label: "Pausada", tone: "warning" },
  COMPLETED: { label: "Concluída", tone: "info" },
  CANCELED: { label: "Cancelada", tone: "danger" },
  ARCHIVED: { label: "Arquivada", tone: "neutral" },
};

export const campaignChannelLabel: Record<ApiCampaignChannel, string> = {
  INTERNAL: "Interno",
  META_ADS: "Meta Ads",
  GOOGLE_ADS: "Google Ads",
  TIKTOK_ADS: "TikTok Ads",
  WHATSAPP: "WhatsApp",
  EMAIL: "E-mail",
  SMS: "SMS",
  LANDING_PAGE: "Landing page",
  AFFILIATE: "Afiliado",
  ORGANIC: "Orgânico",
  OTHER: "Outro",
};

export const campaignObjectiveLabel: Record<ApiCampaignObjective, string> = {
  LEAD_GENERATION: "Geração de leads",
  SALES: "Vendas",
  TRAFFIC: "Tráfego",
  ENGAGEMENT: "Engajamento",
  AWARENESS: "Reconhecimento",
  RETENTION: "Retenção",
  REACTIVATION: "Reativação",
  CUSTOM: "Personalizado",
};

export function statusMeta(status: string): { label: string; tone: Tone } {
  return campaignStatusMeta[status as ApiCampaignStatus] ?? { label: status, tone: "neutral" };
}
export function channelLabel(channel: string): string {
  return campaignChannelLabel[channel as ApiCampaignChannel] ?? channel;
}
export function objectiveLabel(objective: string): string {
  return campaignObjectiveLabel[objective as ApiCampaignObjective] ?? objective;
}

export const CAMPAIGN_STATUSES = Object.keys(campaignStatusMeta) as ApiCampaignStatus[];
export const CAMPAIGN_CHANNELS = Object.keys(campaignChannelLabel) as ApiCampaignChannel[];
export const CAMPAIGN_OBJECTIVES = Object.keys(campaignObjectiveLabel) as ApiCampaignObjective[];

/* ---------- Máquina de estados (espelho da do backend) ---------- */

/**
 * Espelha `CAMPAIGN_TRANSITIONS` do backend para a UI só oferecer ações
 * válidas. O backend continua sendo a autoridade — se divergir, ele devolve
 * 409 e o toast mostra o motivo.
 */
const TRANSITIONS: Record<ApiCampaignStatus, ApiCampaignStatus[]> = {
  DRAFT: ["SCHEDULED", "ACTIVE", "CANCELED", "ARCHIVED"],
  SCHEDULED: ["ACTIVE", "PAUSED", "CANCELED", "ARCHIVED"],
  ACTIVE: ["PAUSED", "COMPLETED", "CANCELED"],
  PAUSED: ["ACTIVE", "COMPLETED", "CANCELED"],
  COMPLETED: ["ARCHIVED"],
  CANCELED: ["ARCHIVED"],
  ARCHIVED: ["DRAFT"],
};

/** Status alvo de cada ação. */
const ACTION_TARGET: Record<CampaignAction, ApiCampaignStatus> = {
  activate: "ACTIVE",
  pause: "PAUSED",
  complete: "COMPLETED",
  cancel: "CANCELED",
  archive: "ARCHIVED",
  restore: "DRAFT",
};

export const campaignActionLabel: Record<CampaignAction, string> = {
  activate: "Ativar",
  pause: "Pausar",
  complete: "Concluir",
  cancel: "Cancelar",
  archive: "Arquivar",
  restore: "Restaurar",
};

export function canRunAction(status: string, action: CampaignAction): boolean {
  const from = status as ApiCampaignStatus;
  const allowed = TRANSITIONS[from];
  return Boolean(allowed?.includes(ACTION_TARGET[action]));
}

/** Ações possíveis a partir do status atual, na ordem em que fazem sentido. */
export function availableActions(status: string): CampaignAction[] {
  return (
    ["activate", "pause", "complete", "cancel", "archive", "restore"] as CampaignAction[]
  ).filter((a) => canRunAction(status, a));
}

/** Arquivada é somente leitura até restaurar. */
export function isArchived(campaign: Pick<ApiCampaign, "status">): boolean {
  return campaign.status === "ARCHIVED";
}

/* ---------- Formatação ---------- */

/** `budget` é string decimal do contrato — formata com a moeda REAL. */
export function formatBudget(budget: string | null, currency: string): string {
  if (budget === null) return "—";
  const num = Number(budget);
  if (!Number.isFinite(num)) return `${currency} ${budget}`;
  try {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(num);
  } catch {
    return `${currency} ${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(num)}`;
  }
}

export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

/** "01/08/2026 – 31/08/2026", ou só o lado informado. */
export function formatPeriod(startAt: string | null, endAt: string | null): string {
  if (!startAt && !endAt) return "—";
  if (startAt && endAt) return `${formatDate(startAt)} – ${formatDate(endAt)}`;
  return startAt ? `A partir de ${formatDate(startAt)}` : `Até ${formatDate(endAt)}`;
}

/** `datetime-local` do input → ISO com offset (o contrato exige offset). */
export function toIsoOrNull(local: string): string | null {
  if (!local.trim()) return null;
  const d = new Date(local);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/** ISO → valor de `<input type="date">`. */
export function toDateInput(iso: string | null): string {
  return iso ? iso.slice(0, 10) : "";
}

/* ---------- Erros ---------- */

/** Mensagens dos ErrorCodes REAIS do domínio de campanhas. */
export function messageForCampaignError(error: unknown): string {
  if (isApiError(error)) {
    switch (error.code) {
      case "CAMPAIGN_NOT_FOUND":
        return "Campanha não encontrada.";
      case "CAMPAIGN_ARCHIVED":
        return "Campanha arquivada: restaure antes de editar.";
      case "CAMPAIGN_STATUS_TRANSITION_INVALID":
        return error.message || "Essa mudança de status não é permitida agora.";
      case "CAMPAIGN_DATES_INVALID":
        return "A data de término não pode ser anterior à de início.";
      case "CAMPAIGN_PIPELINE_INVALID":
        return "Pipeline não encontrado nesta empresa.";
      case "CAMPAIGN_OWNER_INVALID":
        return (
          error.message || "Responsável inválido: precisa ser um membro ativo que veja campanhas."
        );
      case "INVALID_MONEY_VALUE":
        return "Orçamento inválido: use um número maior ou igual a zero.";
      case "INVALID_CURRENCY":
        return "Moeda inválida (use o padrão ISO, ex.: BRL).";
      case "INSUFFICIENT_PERMISSION":
      case "INSUFFICIENT_ROLE":
        return "Você não tem permissão para esta ação.";
      case "COMPANY_CONTEXT_REQUIRED":
        return "Nenhuma empresa ativa selecionada.";
      case "VALIDATION_ERROR":
        return error.message || "Dados da campanha inválidos.";
      default:
        if (error.isForbidden) return "Você não tem permissão para esta ação.";
        if (error.isUnavailable) return "Servidor indisponível. Tente novamente em instantes.";
        return error.message;
    }
  }
  return "Não foi possível concluir a ação.";
}
