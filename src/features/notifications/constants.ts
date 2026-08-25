import type { NotificationStatusFilter } from "@/types/api/notifications";

/** Tamanho de página da listagem do painel. */
export const NOTIFICATIONS_PAGE_SIZE = 15;

/** Permissões backend (espelho) usadas para gate de UI. */
export const NOTIFICATION_PERMISSIONS = {
  read: "notifications.read",
  update: "notifications.update",
  delete: "notifications.delete",
} as const;

export interface StatusFilterOption {
  key: NotificationStatusFilter;
  label: string;
}

/** Catálogo dos filtros de status do painel (ordem de exibição). */
export const STATUS_FILTERS: readonly StatusFilterOption[] = [
  { key: "all", label: "Todas" },
  { key: "unread", label: "Não lidas" },
  { key: "read", label: "Lidas" },
  { key: "archived", label: "Arquivadas" },
];
