import { isApiError } from "@/types/api/error";
import type { DealStatus, DealPriority, DealActivityType } from "@/types/api/crm-deals";
import type { BadgeProps } from "@/components/ui/badge";

/** Mensagens pt-BR para os códigos REAIS de erro do backend (deals). */
export function messageForDealError(error: unknown): string {
  if (isApiError(error)) {
    switch (error.code) {
      case "DEAL_VERSION_CONFLICT":
        return "Esta oportunidade foi alterada por outra pessoa. Recarregamos a coluna — tente novamente.";
      case "DEAL_NOT_OPEN":
        return "A oportunidade não está aberta.";
      case "DEAL_ALREADY_WON":
        return "A oportunidade já foi marcada como ganha.";
      case "DEAL_ALREADY_LOST":
        return "A oportunidade já foi marcada como perdida.";
      case "DEAL_STAGE_INVALID":
        return "Etapa inválida para esta oportunidade.";
      case "DEAL_STAGE_CATEGORY_REQUIRES_ACTION":
        return "Use Ganhar ou Perder para mover a oportunidade para esta etapa.";
      case "DEAL_PIPELINE_MISMATCH":
        return "A etapa não pertence ao pipeline da oportunidade.";
      case "DEAL_CONTACT_INVALID":
        return "Contato inválido para esta empresa.";
      case "DEAL_ORGANIZATION_INVALID":
        return "Organização inválida para esta empresa.";
      case "DEAL_NOT_FOUND":
        return "Oportunidade não encontrada.";
      case "PIPELINE_SETUP_INCOMPLETE":
        return "O pipeline está incompleto. Configure as etapas antes de continuar.";
      case "VALIDATION_ERROR":
        return "Verifique os campos e tente novamente.";
      default:
        if (error.isForbidden) return "Você não tem permissão para esta ação.";
        if (error.isUnavailable) return "Servidor indisponível. Tente novamente em instantes.";
        return error.message;
    }
  }
  return "Não foi possível concluir a ação.";
}

export const dealStatusMeta: Record<DealStatus, { label: string; tone: NonNullable<BadgeProps["tone"]> }> = {
  OPEN: { label: "Aberta", tone: "info" },
  WON: { label: "Ganha", tone: "success" },
  LOST: { label: "Perdida", tone: "danger" },
  ARCHIVED: { label: "Arquivada", tone: "neutral" },
};

export const dealPriorityMeta: Record<DealPriority, { label: string; tone: NonNullable<BadgeProps["tone"]> }> = {
  LOW: { label: "Baixa", tone: "neutral" },
  MEDIUM: { label: "Média", tone: "info" },
  HIGH: { label: "Alta", tone: "warning" },
  URGENT: { label: "Urgente", tone: "danger" },
};

export const dealActivityLabel: Record<DealActivityType, string> = {
  CREATED: "Criada",
  UPDATED: "Atualizada",
  STAGE_CHANGED: "Etapa alterada",
  ASSIGNED: "Responsável definido",
  VALUE_CHANGED: "Valor alterado",
  CONTACT_LINKED: "Contato vinculado",
  CONTACT_UNLINKED: "Contato desvinculado",
  ORGANIZATION_LINKED: "Organização vinculada",
  ORGANIZATION_UNLINKED: "Organização desvinculada",
  TASK_CREATED: "Tarefa criada",
  TASK_COMPLETED: "Tarefa concluída",
  WON: "Ganha",
  LOST: "Perdida",
  REOPENED: "Reaberta",
  ARCHIVED: "Arquivada",
  RESTORED: "Restaurada",
};

/** Duração legível a partir de segundos (histórico de etapas). */
export function formatDuration(seconds: number | null): string {
  if (seconds === null || seconds < 0) return "—";
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}min`;
  return `${m}min`;
}
