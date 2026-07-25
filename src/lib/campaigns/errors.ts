import { isApiError } from "@/types/api/error";

/**
 * Mensagens humanas para erros OPERACIONAIS de campanha (Sprint C2B). Nunca expõe
 * stack/segredo. Cobre transição inválida, público vazio, conta/conexão,
 * rate limit, conflito de versão e permissão. Reutiliza `isApiError`.
 */
export function messageForCampaignError(error: unknown): string {
  if (isApiError(error)) {
    // Códigos de domínio conhecidos primeiro.
    switch (error.code) {
      case "VALIDATION_ERROR":
        // Transições inválidas e "sem destinatários elegíveis" vêm como validação.
        return error.message || "Ação inválida para o estado atual da campanha.";
      case "MESSAGING_ACCOUNT_INACTIVE":
        return "A conta de mensageria não está conectada.";
      case "MESSAGING_ACCOUNT_NOT_FOUND":
        return "Conta de mensageria não encontrada.";
      case "INSUFFICIENT_PERMISSION":
      case "INSUFFICIENT_ROLE":
        return "Você não tem permissão para esta ação.";
      case "COMPANY_CONTEXT_REQUIRED":
        return "Nenhuma empresa ativa selecionada.";
    }
    // Por status HTTP.
    switch (error.statusCode) {
      case 400:
        return error.message || "Não é possível executar esta ação agora.";
      case 403:
        return "Você não tem permissão para esta ação.";
      case 404:
        return "Campanha não encontrada.";
      case 409:
        return "A campanha mudou de estado. Recarregue e tente novamente.";
      case 422:
        return "A conexão precisa ser configurada antes de enviar.";
      case 429:
        return "Muitas tentativas. Aguarde um momento.";
      default:
        if (error.statusCode >= 500 || error.statusCode === 0) {
          return "Não foi possível concluir a ação agora.";
        }
        return error.message || "Não foi possível concluir a ação.";
    }
  }
  return "Não foi possível concluir a ação.";
}
