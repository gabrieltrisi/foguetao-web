import { ApiError } from "@/types/api/error";

/**
 * Tradução de erros do onboarding Evolution para mensagens amigáveis (§12).
 * NUNCA expõe stack, payload cru, apiKey/segredo ou detalhes internos: códigos
 * conhecidos viram texto fixo; o resto cai num fallback genérico (jamais o
 * `message` cru do backend, que poderia carregar dados sensíveis).
 */

const FRIENDLY: Record<string, string> = {
  EVOLUTION_CONNECTION_NOT_FOUND: "Conexão não encontrada.",
  EVOLUTION_HOST_NOT_ALLOWED:
    "A URL informada não está na lista de hosts permitidos para a Evolution.",
  EVOLUTION_PROVISION_FAILED:
    "Não foi possível provisionar a instância. Confira a URL base e a API key.",
  EVOLUTION_CONNECT_FAILED: "Não foi possível iniciar a conexão. Tente novamente em instantes.",
  EVOLUTION_QR_NOT_AVAILABLE:
    "O QR code ainda não está disponível. Aguarde alguns segundos e tente de novo.",
  EVOLUTION_WEBHOOK_CONFIG_FAILED:
    "Não foi possível configurar o webhook. Tente novamente em instantes.",
  RATE_LIMITED: "Muitas tentativas em pouco tempo. Aguarde um instante e tente novamente.",
  VALIDATION_ERROR: "Alguns campos estão inválidos. Revise as informações e tente novamente.",
  FORBIDDEN: "Você não tem permissão para realizar esta ação.",
  UNAUTHORIZED: "Sua sessão expirou. Faça login novamente.",
  SERVICE_UNAVAILABLE: "Serviço indisponível no momento. Tente novamente em instantes.",
};

const DEFAULT_MESSAGE = "Algo deu errado. Tente novamente.";

export function evolutionErrorMessage(err: unknown, fallback = DEFAULT_MESSAGE): string {
  if (err instanceof ApiError) {
    return FRIENDLY[err.code] ?? fallback;
  }
  return fallback;
}
