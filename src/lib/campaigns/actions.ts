import type { CampaignStatus } from "@/types/api/campaigns";

/**
 * Quais AÇÕES são válidas para um status de campanha (PURO, testável — espelha a
 * máquina de estados real do backend). A permissão do usuário (RBAC) é aplicada
 * DEPOIS, na UI; aqui só decidimos o que faz sentido pelo estado. Ações inválidas
 * nunca são exibidas.
 */
export interface CampaignActionAvailability {
  edit: boolean;
  duplicate: boolean;
  remove: boolean;
  sendNow: boolean;
  pause: boolean;
  resume: boolean;
  cancel: boolean;
}

export function campaignActionsByStatus(status: string): CampaignActionAvailability {
  const s = status as CampaignStatus;
  return {
    edit: s === "DRAFT" || s === "SCHEDULED",
    duplicate: true,
    remove: s === "DRAFT",
    sendNow: s === "DRAFT" || s === "SCHEDULED",
    pause: s === "SENDING",
    resume: s === "PAUSED",
    cancel: s === "SCHEDULED" || s === "PREPARING" || s === "SENDING" || s === "PAUSED",
  };
}

/** Ação PRINCIPAL contextual (botão de destaque) por estado, se houver. */
export type PrimaryActionKind = "sendNow" | "pause" | "resume" | "open" | "duplicate";

export function primaryActionForStatus(status: string): PrimaryActionKind {
  const s = status as CampaignStatus;
  if (s === "DRAFT" || s === "SCHEDULED") return "sendNow";
  if (s === "SENDING") return "pause";
  if (s === "PAUSED") return "resume";
  if (s === "COMPLETED" || s === "COMPLETED_WITH_ERRORS" || s === "CANCELED") return "duplicate";
  return "open";
}
