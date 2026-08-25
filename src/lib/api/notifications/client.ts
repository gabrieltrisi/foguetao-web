"use client";

import { clientFetch } from "@/lib/api/client";
import { buildQuery, type QueryParams } from "@/lib/api/query-string";
import type {
  ApiNotification,
  ApiNotificationList,
  ApiUnreadCount,
  CreateNotificationInput,
  NotificationFilters,
} from "@/types/api/notifications";

const B = "/api/notifications";

/** Notification Center (browser → BFF). */
export const notificationsApi = {
  create: (input: CreateNotificationInput) =>
    clientFetch<ApiNotification>(B, { method: "POST", body: input }),
  list: (filters?: NotificationFilters) =>
    clientFetch<ApiNotificationList>(`${B}${buildQuery(filters as QueryParams)}`),
  unreadCount: () => clientFetch<ApiUnreadCount>(`${B}/unread-count`),
  markRead: (id: string) =>
    clientFetch<ApiNotification>(`${B}/${id}/read`, { method: "PATCH" }),
  markAllRead: () => clientFetch<{ updated: number }>(`${B}/read-all`, { method: "PATCH" }),
  archive: (id: string) =>
    clientFetch<ApiNotification>(`${B}/${id}/archive`, { method: "PATCH" }),
  remove: (id: string) => clientFetch<{ message: string }>(`${B}/${id}`, { method: "DELETE" }),
};
