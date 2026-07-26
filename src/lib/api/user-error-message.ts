import { ApiError, ErrorCode, isApiError } from "@/types/api/error";

/**
 * Mapeia um erro (ApiError ou desconhecido) para uma mensagem AMIGÁVEL ao usuário
 * (nunca a mensagem técnica bruta) + o `requestId` para suporte. Centraliza o
 * tratamento do envelope padrão do backend no frontend (C3.1E, §17).
 */
export interface UserFacingError {
  /** Título curto para toast/alert. */
  title: string;
  /** Descrição amigável (sem detalhe técnico). */
  message: string;
  /** Para o usuário citar ao suporte (quando houver). */
  requestId?: string;
  /** Conflito de concorrência → a UI oferece recarregar/mesclar. */
  isConflict: boolean;
  /** Retryable de forma segura (indisponível/timeout/429). */
  retryable: boolean;
}

const BY_CODE: Partial<Record<string, string>> = {
  [ErrorCode.CONVERSATION_VERSION_CONFLICT]:
    "Esta conversa foi alterada por outra pessoa. Recarregue e tente novamente.",
  [ErrorCode.CONVERSATION_DRAFT_CONFLICT]:
    "O rascunho foi alterado em outra aba/dispositivo. Recarregue para não perder texto.",
  [ErrorCode.INSUFFICIENT_PERMISSION]: "Você não tem permissão para esta ação.",
  [ErrorCode.INSUFFICIENT_ROLE]: "Seu perfil não permite esta ação.",
  [ErrorCode.COMPANY_ACCESS_DENIED]: "Você não tem acesso a esta empresa.",
  [ErrorCode.MEMBERSHIP_INACTIVE]: "Seu acesso a esta empresa está inativo.",
  [ErrorCode.MESSAGING_REALTIME_DISABLED]:
    "O tempo real está indisponível no momento; os dados serão atualizados periodicamente.",
};

const BY_STATUS: Partial<Record<number, { title: string; message: string }>> = {
  0: { title: "Sem conexão", message: "Não foi possível conectar. Verifique sua internet." },
  400: { title: "Dados inválidos", message: "Revise os campos e tente novamente." },
  401: { title: "Sessão expirada", message: "Faça login novamente para continuar." },
  403: { title: "Sem permissão", message: "Você não tem permissão para esta ação." },
  404: { title: "Não encontrado", message: "O item não foi encontrado ou não está mais disponível." },
  409: { title: "Conflito", message: "Este item foi alterado. Recarregue e tente novamente." },
  422: { title: "Não foi possível concluir", message: "A operação não pôde ser concluída no estado atual." },
  429: { title: "Muitas tentativas", message: "Aguarde alguns instantes e tente novamente." },
  503: { title: "Serviço indisponível", message: "Estamos com instabilidade. Tente novamente em instantes." },
};

export function toUserError(error: unknown): UserFacingError {
  if (isApiError(error)) {
    const byCode = BY_CODE[error.code];
    const byStatus = BY_STATUS[error.statusCode];
    const retryable = error.isUnavailable || error.isRateLimited;
    return {
      title: byStatus?.title ?? (error.isServerError ? "Erro no servidor" : "Erro"),
      message:
        byCode ??
        byStatus?.message ??
        (error.isServerError
          ? "Ocorreu um erro inesperado. Tente novamente."
          : "Não foi possível concluir a ação."),
      requestId: error.requestId,
      isConflict: error.isConflict || error.isVersionConflict,
      retryable,
    };
  }
  // Desconhecido / erro de rede lançado fora do ApiError.
  return {
    title: "Erro",
    message: "Ocorreu um erro inesperado. Tente novamente.",
    isConflict: false,
    retryable: true,
  };
}

/** Açúcar: só o texto (título + mensagem) para toasts simples. */
export function toUserErrorMessage(error: unknown): string {
  const e = toUserError(error);
  return e.requestId ? `${e.message} (ref: ${e.requestId})` : e.message;
}

/** É um conflito de versão/rascunho? (para acionar UI de recarregar/mesclar). */
export function isConflictError(error: unknown): boolean {
  return isApiError(error) && (error.isConflict || error.isVersionConflict);
}

export { ApiError };
