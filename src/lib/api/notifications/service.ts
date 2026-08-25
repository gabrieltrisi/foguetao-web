import "server-only";
import { backendFetch } from "@/lib/api/http";
import { buildQuery, type QueryParams } from "@/lib/api/query-string";
import {
  notificationSchema,
  notificationListSchema,
  unreadCountSchema,
  markAllResultSchema,
  deleteResultSchema,
} from "@/types/api/notifications";

interface Ctx {
  token: string;
  companyId: string;
}

/** Notification Center (F7.7) — server → backend, validado por Zod. */
export const notificationsService = {
  create: ({ token, companyId }: Ctx, body: unknown) =>
    backendFetch(`/notifications`, {
      method: "POST",
      token,
      companyId,
      body,
      schema: notificationSchema,
    }),
  list: ({ token, companyId }: Ctx, params?: QueryParams) =>
    backendFetch(`/notifications${buildQuery(params)}`, {
      token,
      companyId,
      schema: notificationListSchema,
    }),
  unreadCount: ({ token, companyId }: Ctx) =>
    backendFetch(`/notifications/unread-count`, { token, companyId, schema: unreadCountSchema }),
  markRead: ({ token, companyId }: Ctx, id: string) =>
    backendFetch(`/notifications/${id}/read`, {
      method: "PATCH",
      token,
      companyId,
      schema: notificationSchema,
    }),
  markAllRead: ({ token, companyId }: Ctx) =>
    backendFetch(`/notifications/read-all`, {
      method: "PATCH",
      token,
      companyId,
      schema: markAllResultSchema,
    }),
  archive: ({ token, companyId }: Ctx, id: string) =>
    backendFetch(`/notifications/${id}/archive`, {
      method: "PATCH",
      token,
      companyId,
      schema: notificationSchema,
    }),
  remove: ({ token, companyId }: Ctx, id: string) =>
    backendFetch(`/notifications/${id}`, {
      method: "DELETE",
      token,
      companyId,
      schema: deleteResultSchema,
    }),
};
