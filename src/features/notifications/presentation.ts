import type { BadgeProps } from "@/components/ui/badge";
import type { NotificationPriority, NotificationType } from "@/types/api/notifications";

/**
 * Mapeamentos de APRESENTAÇÃO (puros, testáveis). Prioridade → tom do Badge +
 * rótulo; tipo → rótulo + chave de ícone (o componente resolve o ícone lucide).
 * Segue o Design System: LOW cinza, NORMAL azul, HIGH laranja, URGENT vermelho.
 */

type BadgeTone = NonNullable<BadgeProps["tone"]>;

export interface PriorityMeta {
  tone: BadgeTone;
  label: string;
}

const PRIORITY_META: Record<NotificationPriority, PriorityMeta> = {
  LOW: { tone: "neutral", label: "Baixa" },
  NORMAL: { tone: "info", label: "Normal" },
  HIGH: { tone: "warning", label: "Alta" },
  URGENT: { tone: "danger", label: "Urgente" },
};

export function priorityMeta(priority: NotificationPriority): PriorityMeta {
  return PRIORITY_META[priority] ?? PRIORITY_META.NORMAL;
}

export interface TypeMeta {
  label: string;
  /** Chave estável do ícone (resolvida no componente para um ícone lucide). */
  icon: string;
}

const TYPE_META: Record<NotificationType, TypeMeta> = {
  SYSTEM: { label: "Sistema", icon: "system" },
  CRM: { label: "CRM", icon: "crm" },
  TASK: { label: "Tarefa", icon: "task" },
  DEAL: { label: "Negócio", icon: "deal" },
  COPILOT: { label: "Copilot", icon: "copilot" },
  MEDIA: { label: "Arquivos", icon: "media" },
  GOVERNANCE: { label: "Governança", icon: "governance" },
  SECURITY: { label: "Segurança", icon: "security" },
  AUTOMATION: { label: "Automação", icon: "automation" },
  INTEGRATION: { label: "Integração", icon: "integration" },
  INBOX: { label: "Inbox", icon: "inbox" },
};

/** Aceita `string` (o tipo vem do backend); faz fallback seguro p/ tipos desconhecidos. */
export function typeMeta(type: string): TypeMeta {
  return TYPE_META[type as NotificationType] ?? TYPE_META.SYSTEM;
}
