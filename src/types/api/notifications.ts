import { z } from "zod";

/**
 * Contratos da central de notificações (F7.7). Schemas Zod para validação
 * defensiva das respostas do backend (na camada server) e tipos derivados usados
 * no client. Espelham `NotificationResponseDto` do foguetao-api — o backend nunca
 * devolve companyId/recipientUserId nem caminhos internos.
 */

export const NOTIFICATION_TYPES = [
  "SYSTEM",
  "CRM",
  "TASK",
  "DEAL",
  "COPILOT",
  "MEDIA",
  "GOVERNANCE",
  "SECURITY",
  "AUTOMATION",
  "INTEGRATION",
  "INBOX",
] as const;

export const NOTIFICATION_PRIORITIES = ["LOW", "NORMAL", "HIGH", "URGENT"] as const;

export const notificationSchema = z.object({
  id: z.string(),
  // `type` aceita qualquer string (resiliência): um tipo novo no backend nunca
  // deve quebrar a listagem no front. A apresentação faz fallback seguro.
  type: z.string(),
  priority: z.enum(NOTIFICATION_PRIORITIES),
  title: z.string(),
  message: z.string(),
  resourceType: z.string().nullable(),
  resourceId: z.string().nullable(),
  actionUrl: z.string().nullable(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  read: z.boolean(),
  readAt: z.string().nullable(),
  archived: z.boolean(),
  archivedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const notificationListSchema = z.object({
  items: z.array(notificationSchema),
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
});

export const unreadCountSchema = z.object({ count: z.number() });

export const markAllResultSchema = z.object({ updated: z.number() });

export const deleteResultSchema = z.object({ message: z.string() });

export type ApiNotification = z.infer<typeof notificationSchema>;
export type ApiNotificationList = z.infer<typeof notificationListSchema>;
export type ApiUnreadCount = z.infer<typeof unreadCountSchema>;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];
export type NotificationPriority = (typeof NOTIFICATION_PRIORITIES)[number];

/** Corpo de criação de notificação (destinatário obrigatório). */
export interface CreateNotificationInput {
  recipientUserId: string;
  type: NotificationType;
  priority?: NotificationPriority;
  title: string;
  message: string;
  resourceType?: string;
  resourceId?: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}

/** Filtro de status enviado ao backend. */
export type NotificationStatusFilter = "all" | "unread" | "read" | "archived";

export interface NotificationFilters {
  status?: NotificationStatusFilter;
  type?: NotificationType;
  priority?: NotificationPriority;
  page?: number;
  limit?: number;
}
