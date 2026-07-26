import { isApiError } from "@/types/api/error";

/** Ação operacional que originou o erro (para mensagens de conflito específicas). */
export type CampaignAction = "sendNow" | "pause" | "resume" | "cancel" | "schedule";

/** Mensagens de conflito (409) específicas por ação — o estado mudou sob o usuário. */
const CONFLICT_BY_ACTION: Record<CampaignAction, string> = {
  cancel: "Esta campanha já foi concluída e não pode mais ser cancelada.",
  pause: "A campanha não está mais em envio, então não pode ser pausada.",
  resume: "A campanha não está pausada, então não pode ser retomada.",
  sendNow: "A campanha não pode ser enviada neste estado. Recarregue e tente novamente.",
  schedule: "A campanha mudou de estado. Recarregue e tente novamente.",
};

/**
 * Mensagens humanas para erros OPERACIONAIS de campanha (Sprint C2B/.1). Nunca
 * expõe stack/segredo. Cobre conflito de estado (409, com texto específico por
 * ação), público vazio, conta/conexão, rate limit e permissão. Reutiliza
 * `isApiError`. NENHUMA mutation deve terminar sem feedback derivado daqui.
 */
export function messageForCampaignError(error: unknown, action?: CampaignAction): string {
  if (isApiError(error)) {
    // Conflito de estado tem prioridade: a campanha mudou entre abrir e confirmar.
    if (error.statusCode === 409) {
      return action
        ? CONFLICT_BY_ACTION[action]
        : "A campanha mudou de estado. Recarregue e tente novamente.";
    }
    switch (error.code) {
      case "VALIDATION_ERROR":
        // Ex.: "Nenhum destinatário elegível após as exclusões" (send-now/schedule).
        return error.message || "Ação inválida para o estado atual da campanha.";
      case "MESSAGING_ACCOUNT_INACTIVE":
        return "A conta de WhatsApp não está conectada.";
      case "MESSAGING_ACCOUNT_NOT_FOUND":
        return "Conta de WhatsApp não encontrada.";
      case "INSUFFICIENT_PERMISSION":
      case "INSUFFICIENT_ROLE":
        return "Você não tem permissão para esta ação.";
      case "COMPANY_CONTEXT_REQUIRED":
        return "Nenhuma empresa ativa selecionada.";
    }
    switch (error.statusCode) {
      case 400:
        return error.message || "Não é possível executar esta ação agora.";
      case 403:
        return "Você não tem permissão para esta ação.";
      case 404:
        return "Campanha não encontrada.";
      case 422:
        return "A conexão precisa ser configurada antes de enviar.";
      case 429:
        return "Muitas tentativas. Aguarde um momento e tente de novo.";
      default:
        if (error.statusCode >= 500 || error.statusCode === 0) {
          return "Não foi possível concluir a ação agora.";
        }
        return error.message || "Não foi possível concluir a ação.";
    }
  }
  return "Não foi possível concluir a ação.";
}
