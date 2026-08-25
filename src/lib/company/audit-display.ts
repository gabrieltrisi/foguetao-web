import type { BadgeProps } from "@/components/ui/badge";
import { isApiError } from "@/types/api/error";
import type { ApiAuditLog } from "@/types/api/audit";

type Tone = NonNullable<BadgeProps["tone"]>;

/**
 * Apresentação da auditoria. Rótulos e tons são DERIVADOS da string da ação
 * (`DOMAIN_VERB`), com fallback determinístico — uma ação nova nunca fica sem
 * representação. Nada aqui é uma segunda fonte de dados; o backend manda a lista.
 */

/** Domínio da ação, inferido do prefixo (ou de casos conhecidos). */
export function actionDomain(action: string): string {
  if (action.startsWith("COMPANY_INVITATION")) return "invitation";
  if (action.startsWith("COMPANY_MEMBER") || action === "COMPANY_ROLE_CHANGED") return "member";
  if (action.startsWith("COMPANY")) return "company";
  if (
    action.startsWith("LOGIN") ||
    action.startsWith("LOGOUT") ||
    action.startsWith("PASSWORD") ||
    action.startsWith("SESSION") ||
    action.startsWith("REFRESH_TOKEN") ||
    action.startsWith("USER_")
  ) {
    return "auth";
  }
  if (action.startsWith("INTEGRATION")) return "integration";
  if (
    action.startsWith("MESSAGING") ||
    action.startsWith("CONVERSATION") ||
    action.startsWith("MESSAGE") ||
    action.startsWith("MEDIA")
  ) {
    return "messaging";
  }
  if (
    action.startsWith("CONTACT") ||
    action.startsWith("ORGANIZATION") ||
    action.startsWith("DEAL") ||
    action.startsWith("PIPELINE") ||
    action.startsWith("STAGE") ||
    action.startsWith("TASK") ||
    action.startsWith("TAG") ||
    action.startsWith("CUSTOM_FIELD") ||
    action.startsWith("LOST_REASON")
  ) {
    return "crm";
  }
  return "other";
}

const DOMAIN_META: Record<string, { label: string; tone: Tone }> = {
  auth: { label: "Autenticação", tone: "brand" },
  company: { label: "Empresa", tone: "info" },
  member: { label: "Equipe", tone: "info" },
  invitation: { label: "Convites", tone: "info" },
  crm: { label: "CRM", tone: "neutral" },
  integration: { label: "Integrações", tone: "neutral" },
  messaging: { label: "Mensageria", tone: "neutral" },
  other: { label: "Outros", tone: "neutral" },
};

export function domainMeta(action: string): { label: string; tone: Tone } {
  return DOMAIN_META[actionDomain(action)] ?? DOMAIN_META.other;
}

/** Ações que representam falha/negação — destacadas com tom de alerta. */
const FAILURE_ACTIONS = new Set([
  "LOGIN_FAILED",
  "COMPANY_ACCESS_DENIED",
  "REFRESH_TOKEN_REUSE_DETECTED",
  "USER_BLOCKED",
  "INTEGRATION_SYNC_FAILED",
  "INTEGRATION_OUTBOUND_FAILED",
]);

/** Tom do "resultado" do evento: falha em vermelho, resto neutro/sucesso. */
export function outcomeTone(action: string): Tone {
  return FAILURE_ACTIONS.has(action) ? "danger" : "success";
}

export function isFailure(action: string): boolean {
  return FAILURE_ACTIONS.has(action);
}

/** Rótulo legível da ação: `COMPANY_MEMBER_REMOVED` → "Membro removido". */
const ACTION_LABELS: Record<string, string> = {
  USER_REGISTERED: "Usuário registrado",
  LOGIN_SUCCESS: "Login bem-sucedido",
  LOGIN_FAILED: "Falha de login",
  LOGOUT: "Logout",
  LOGOUT_ALL: "Logout de todos os dispositivos",
  REFRESH_TOKEN_USED: "Token renovado",
  REFRESH_TOKEN_REUSE_DETECTED: "Reúso de token detectado",
  PASSWORD_RESET_REQUESTED: "Redefinição de senha solicitada",
  PASSWORD_RESET_COMPLETED: "Senha redefinida",
  PASSWORD_CHANGED: "Senha alterada",
  SESSION_REVOKED: "Sessão encerrada",
  USER_BLOCKED: "Usuário bloqueado",
  COMPANY_CREATED: "Empresa criada",
  COMPANY_UPDATED: "Empresa atualizada",
  COMPANY_DELETED: "Empresa excluída",
  COMPANY_MEMBER_ADDED: "Membro adicionado",
  COMPANY_MEMBER_UPDATED: "Membro atualizado",
  COMPANY_MEMBER_REMOVED: "Membro removido",
  COMPANY_MEMBER_LEFT: "Membro saiu",
  COMPANY_ROLE_CHANGED: "Papel alterado",
  COMPANY_ACCESS_DENIED: "Acesso negado",
  COMPANY_INVITATION_CREATED: "Convite enviado",
  COMPANY_INVITATION_REVOKED: "Convite revogado",
  COMPANY_INVITATION_ACCEPTED: "Convite aceito",
};

export function actionLabel(action: string): string {
  return ACTION_LABELS[action] ?? titleCase(action);
}

/** `company_member` → "Membro"; `deal` → "Oportunidade". */
const ENTITY_LABELS: Record<string, string> = {
  auth: "Autenticação",
  company: "Empresa",
  company_member: "Membro",
  company_invitation: "Convite",
  contact: "Contato",
  organization: "Organização",
  deal: "Oportunidade",
  deal_task: "Tarefa",
  pipeline: "Pipeline",
  pipeline_stage: "Etapa",
  tag: "Etiqueta",
  custom_field: "Campo personalizado",
  contact_note: "Nota",
  lost_reason: "Motivo de perda",
  integration_connection: "Conexão",
  integration_credential: "Credencial",
  integration_webhook_endpoint: "Webhook",
  integration_sync_job: "Sincronização",
  messaging_account: "Conta de mensageria",
  conversation: "Conversa",
  message: "Mensagem",
};

export function entityLabel(entity: string): string {
  return ENTITY_LABELS[entity] ?? titleCase(entity);
}

/**
 * Opções dos filtros de ação/recurso. São os valores REAIS do enum do backend
 * mais frequentes na auditoria de uma empresa (auth, empresa, equipe, convites);
 * cada `value` é enviado cru para `GET /audit?action=…&entity=…`. O filtro é do
 * servidor — nada é filtrado no cliente.
 */
export const ACTION_FILTER_OPTIONS: { value: string; label: string }[] = Object.keys(ACTION_LABELS)
  .map((value) => ({ value, label: ACTION_LABELS[value] }))
  .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));

export const ENTITY_FILTER_OPTIONS: { value: string; label: string }[] = [
  "company",
  "company_member",
  "company_invitation",
  "auth",
]
  .map((value) => ({ value, label: ENTITY_LABELS[value] ?? titleCase(value) }))
  .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));

function titleCase(value: string): string {
  return value
    .toLowerCase()
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((w, i) => (i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(" ");
}

/* ---------- Erros ---------- */

export function messageForAuditError(error: unknown): string {
  if (isApiError(error)) {
    switch (error.code) {
      case "INSUFFICIENT_PERMISSION":
      case "INSUFFICIENT_ROLE":
        return "Você não tem permissão para ver a auditoria.";
      case "COMPANY_CONTEXT_REQUIRED":
        return "Nenhuma empresa ativa selecionada.";
      case "NOT_FOUND":
        return "Registro de auditoria não encontrado.";
      case "VALIDATION_ERROR":
        return "Filtro inválido.";
      default:
        if (error.isForbidden) return "Você não tem permissão para esta ação.";
        if (error.isUnavailable) return "Servidor indisponível. Tente novamente em instantes.";
        return error.message;
    }
  }
  return "Não foi possível carregar a auditoria.";
}

/** Reexporta o mesmo tratamento de UA/IP das sessões, para não duplicar. */
export { maskIp, formatDateTime, parseUserAgent } from "@/lib/auth/session-display";

/** Entradas do `metadata` como pares legíveis (o backend já sanitizou). */
export function metadataEntries(log: ApiAuditLog): [string, string][] {
  if (!log.metadata) return [];
  return Object.entries(log.metadata).map(([k, v]) => [k, stringifyValue(v)]);
}

function stringifyValue(v: unknown): string {
  if (v === null || v === undefined) return "—";
  if (Array.isArray(v)) return v.map(stringifyValue).join(", ");
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}
