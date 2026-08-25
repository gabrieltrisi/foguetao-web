import type { NotificationFilters } from "@/types/api/notifications";

/**
 * Factory ÚNICA das query keys da central de notificações (F7.7). Root próprio
 * `"notifications"` — nenhuma key existente é alterada. Os hooks anexam
 * `activeCompanyId` ao final; a invalidação por PREFIXO casa independentemente.
 * NUNCA escrever strings de key soltas — usar isto.
 */
const ROOT = "notifications" as const;

export const notificationKeys = {
  all: [ROOT] as const,
  /** Prefixo de TODAS as listagens (qualquer filtro). */
  lists: () => [ROOT, "list"] as const,
  list: (filters?: NotificationFilters) => [ROOT, "list", filters ?? {}] as const,
  unreadCount: () => [ROOT, "unread-count"] as const,
  detail: (id: string) => [ROOT, "detail", id] as const,
};

/** Prefixos de invalidação. */
export const notificationInvalidation = {
  all: notificationKeys.all,
  lists: notificationKeys.lists(),
  unreadCount: notificationKeys.unreadCount(),
};
