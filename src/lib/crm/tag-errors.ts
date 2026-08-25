import { isApiError } from "@/types/api/error";

/**
 * Mensagens dos erros REAIS do módulo de tags. Os códigos abaixo são os que o
 * `TagsService` de fato lança — nada é inventado:
 * `TAG_ALREADY_EXISTS` (409, nome duplicado por normalizedName), `TAG_NOT_FOUND`
 * (404) e `CONTACT_NOT_FOUND` (404, ao associar). Attach/detach são idempotentes
 * no backend, então não existe erro de "já associada".
 */
export function messageForTagError(error: unknown): string {
  if (isApiError(error)) {
    switch (error.code) {
      case "TAG_ALREADY_EXISTS":
        return "Já existe uma tag com esse nome.";
      case "TAG_NOT_FOUND":
        return "Tag não encontrada.";
      case "CONTACT_NOT_FOUND":
        return "Contato não encontrado.";
      case "INSUFFICIENT_PERMISSION":
      case "INSUFFICIENT_ROLE":
        return "Você não tem permissão para esta ação.";
      case "COMPANY_CONTEXT_REQUIRED":
        return "Nenhuma empresa ativa selecionada.";
      case "VALIDATION_ERROR":
        return error.message || "Dados da tag inválidos.";
      default:
        if (error.isForbidden) return "Você não tem permissão para esta ação.";
        if (error.isUnavailable) return "Servidor indisponível. Tente novamente em instantes.";
        return error.message;
    }
  }
  return "Não foi possível concluir a ação.";
}
