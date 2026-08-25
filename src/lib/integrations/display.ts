import type { BadgeProps } from "@/components/ui/badge";
import { isApiError } from "@/types/api/error";
import type {
  Availability,
  CatalogAuthMode,
  CatalogCategory,
  IntegrationLogStatus,
  IntegrationStatus,
} from "@/types/api/integrations";

type Tone = NonNullable<BadgeProps["tone"]>;

/**
 * DOIS conceitos distintos, deliberadamente separados:
 *  - `availability`: a integração existe/opera no PRODUTO (independe da empresa);
 *  - `status`: como está a CONEXÃO desta empresa.
 * A UI nunca funde os dois num badge só.
 */

export const availabilityMeta: Record<Availability, { label: string; tone: Tone }> = {
  AVAILABLE: { label: "Disponível", tone: "success" },
  COMING_SOON: { label: "Em breve", tone: "neutral" },
  DISABLED: { label: "Desabilitada", tone: "warning" },
};

/** Status da conexão. O backend não tem PAUSED — pausar resulta em DISCONNECTED. */
export const connectionStatusMeta: Record<IntegrationStatus, { label: string; tone: Tone }> = {
  DRAFT: { label: "Rascunho", tone: "neutral" },
  CONNECTING: { label: "Conectando", tone: "info" },
  CONNECTED: { label: "Ativa", tone: "success" },
  DEGRADED: { label: "Degradada", tone: "warning" },
  ERROR: { label: "Com erro", tone: "danger" },
  DISCONNECTED: { label: "Pausada", tone: "neutral" },
  REVOKED: { label: "Revogada", tone: "danger" },
};

export const catalogCategoryMeta: Record<CatalogCategory, string> = {
  MESSAGING: "WhatsApp e Mensageria",
  ADVERTISING: "Anúncios",
  ANALYTICS: "Analytics",
  AUTOMATION: "Automação",
  PRODUCTIVITY: "Produtividade",
  STORAGE: "Armazenamento",
  WEBHOOKS: "Webhooks",
  CUSTOM: "Integrações personalizadas",
};

export const authModeMeta: Record<CatalogAuthMode, string> = {
  NONE: "Sem autenticação",
  API_KEY: "Chave de API",
  OAUTH2: "OAuth 2.0",
  CUSTOM_CREDENTIALS: "Credenciais personalizadas",
  SIGNED_WEBHOOK: "Webhook assinado",
};

export const logStatusMeta: Record<IntegrationLogStatus, { label: string; tone: Tone }> = {
  SUCCESS: { label: "Sucesso", tone: "success" },
  FAILURE: { label: "Falha", tone: "danger" },
  TIMEOUT: { label: "Tempo esgotado", tone: "warning" },
  RATE_LIMITED: { label: "Limite atingido", tone: "warning" },
  CIRCUIT_OPEN: { label: "Circuito aberto", tone: "warning" },
};

/** Rótulos das capabilities — genéricos, sem citar fornecedor. */
export const capabilityLabel: Record<string, string> = {
  CONNECTION_TEST: "Testar conexão",
  CONNECT: "Conectar",
  DISCONNECT: "Desconectar",
  HEALTH_CHECK: "Verificar saúde",
  WEBHOOK_RECEIVE: "Receber webhook",
  WEBHOOK_VERIFY: "Verificar assinatura",
  SYNC_FULL: "Sincronização completa",
  SYNC_INCREMENTAL: "Sincronização incremental",
  OUTBOUND_EXECUTE: "Executar envio",
  OAUTH: "OAuth",
  CREDENTIAL_REFRESH: "Renovar credencial",
};

/** Operações registradas no log. */
export const operationLabel: Record<string, string> = {
  TEST_CONNECTION: "Teste de conexão",
  CONNECT: "Conexão",
  DISCONNECT: "Desconexão",
  HEALTH_CHECK: "Verificação de saúde",
  SYNC_FULL: "Sincronização completa",
  SYNC_INCREMENTAL: "Sincronização incremental",
  EXECUTE_OUTBOUND: "Envio",
  VERIFY_WEBHOOK: "Verificação de webhook",
  PARSE_WEBHOOK: "Leitura de webhook",
  REFRESH_CREDENTIAL: "Renovação de credencial",
};

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDuration(ms: number | null): string {
  if (ms === null) return "—";
  return ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(2)} s`;
}

/** Erros REAIS do domínio de integrações (fonte: packages/shared/errors.ts). */
export function messageForIntegrationError(error: unknown): string {
  if (isApiError(error)) {
    switch (error.code) {
      case "INTEGRATIONS_DISABLED":
        return "As integrações estão desabilitadas nesta instalação.";
      case "INTEGRATION_PROVIDER_DISABLED":
        return "Esta integração está desabilitada pela configuração atual.";
      case "INTEGRATION_PROVIDER_NOT_IMPLEMENTED":
        return "Esta integração ainda não foi implementada.";
      case "INTEGRATION_PROVIDER_UNSUPPORTED":
        return "Integração não suportada.";
      case "INTEGRATION_NOT_FOUND":
        return "Conexão não encontrada.";
      case "INTEGRATION_ALREADY_EXISTS":
        return "Já existe uma conexão com este nome para esta integração.";
      case "INTEGRATION_INACTIVE":
        return "Conexão inativa ou revogada.";
      case "INTEGRATION_CONFIG_INVALID":
        return "Configuração inválida. Revise os campos.";
      case "INTEGRATION_CAPABILITY_UNSUPPORTED":
        return "Esta integração não suporta esta operação.";
      case "INTEGRATION_CREDENTIAL_REQUIRED":
        return "Esta operação exige uma credencial cadastrada.";
      case "INTEGRATION_TEST_FAILED":
        return "O teste falhou.";
      case "INTEGRATION_TIMEOUT":
        return "A operação excedeu o tempo limite.";
      case "INTEGRATION_RATE_LIMITED":
        return "Limite de requisições atingido. Tente novamente em instantes.";
      case "INTEGRATION_CIRCUIT_OPEN":
        return "Muitas falhas seguidas. A integração foi temporariamente suspensa.";
      case "INTEGRATION_PERMANENT_FAILURE":
        return "Falha permanente na integração.";
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
