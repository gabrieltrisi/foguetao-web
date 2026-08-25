import type { BadgeProps } from "@/components/ui/badge";
import { isApiError } from "@/types/api/error";
import type { ApiTask, TaskStatus, TaskPriority } from "@/types/api/crm-tasks";
import type { CompanyRole } from "@/types/api/company";

export const taskStatusMeta: Record<TaskStatus, { label: string; tone: NonNullable<BadgeProps["tone"]> }> = {
  PENDING: { label: "Pendente", tone: "info" },
  IN_PROGRESS: { label: "Em andamento", tone: "brand" },
  COMPLETED: { label: "Concluída", tone: "success" },
  CANCELED: { label: "Cancelada", tone: "neutral" },
};

export const taskPriorityMeta: Record<TaskPriority, { label: string; tone: NonNullable<BadgeProps["tone"]> }> = {
  LOW: { label: "Baixa", tone: "neutral" },
  MEDIUM: { label: "Média", tone: "info" },
  HIGH: { label: "Alta", tone: "warning" },
  URGENT: { label: "Urgente", tone: "danger" },
};

/**
 * Papéis que podem ser responsáveis (backend: AssigneePolicy.ASSIGNABLE_ROLES).
 * FINANCIAL, AFFILIATE e VIEWER não podem — filtrar evita um 403 previsível.
 */
export const ASSIGNABLE_ROLES: readonly CompanyRole[] = [
  "OWNER",
  "ADMIN",
  "MANAGER",
  "MARKETING",
  "COMMERCIAL",
  "SUPPORT",
];

export function isAssignableRole(role: CompanyRole): boolean {
  return ASSIGNABLE_ROLES.includes(role);
}

/** Tarefa em aberto (mesma definição do backend para `overdue`). */
export function isOpenStatus(status: TaskStatus): boolean {
  return status === "PENDING" || status === "IN_PROGRESS";
}

/**
 * Atrasada: `dueAt < agora` E status em aberto — idêntico ao filtro `overdue`
 * do backend. Não inventa estado: apenas reflete o contrato.
 */
export function isOverdue(task: Pick<ApiTask, "dueAt" | "status">, now: Date = new Date()): boolean {
  if (!task.dueAt || !isOpenStatus(task.status)) return false;
  return new Date(task.dueAt).getTime() < now.getTime();
}

/** Prazo próximo: vence nas próximas 24h (derivado, apenas visual). */
export function isDueSoon(task: Pick<ApiTask, "dueAt" | "status">, now: Date = new Date()): boolean {
  if (!task.dueAt || !isOpenStatus(task.status)) return false;
  const diff = new Date(task.dueAt).getTime() - now.getTime();
  return diff >= 0 && diff <= 24 * 60 * 60 * 1000;
}

/* ---------- Datas: local <-> ISO sem deslocar o dia ---------- */

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/**
 * ISO (UTC) → valor de `<input type="datetime-local">` no fuso LOCAL.
 * Usa getters locais de propósito: `toISOString().slice(0,16)` deslocaria o
 * dia/hora para UTC (bug clássico).
 */
export function toDateTimeLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Valor de `<input type="datetime-local">` (hora local) → ISO 8601 UTC, formato
 * aceito pelo backend (@IsISO8601). Retorna null quando vazio/ inválido.
 */
export function fromDateTimeLocal(local: string): string | null {
  if (!local) return null;
  const d = new Date(local);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

/** Data/hora local legível (pt-BR). */
export function formatTaskDate(iso: string | null | undefined): string {
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

/* ---------- Erros reais do domínio de tarefas ---------- */

export function messageForTaskError(error: unknown): string {
  if (isApiError(error)) {
    switch (error.code) {
      case "TASK_NOT_FOUND":
        return "Tarefa não encontrada.";
      case "TASK_ALREADY_COMPLETED":
        return "Tarefa já concluída. Reabra-a antes de editar.";
      case "TASK_INVALID_STATUS":
        return "Só é possível reabrir tarefas concluídas ou canceladas.";
      case "ASSIGNEE_NOT_COMPANY_MEMBER":
        return "O responsável não é membro desta empresa.";
      case "ASSIGNEE_INACTIVE":
        return "O responsável não está ativo na empresa.";
      case "ASSIGNEE_ROLE_NOT_ALLOWED":
        return "O papel do responsável não permite receber tarefas.";
      case "DEAL_NOT_FOUND":
        return "Oportunidade vinculada não encontrada.";
      case "DEAL_CONTACT_INVALID":
        return "Contato vinculado inválido.";
      case "DEAL_ORGANIZATION_INVALID":
        return "Organização vinculada inválida.";
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
