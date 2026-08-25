"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { notificationsApi } from "@/lib/api/notifications/client";
import { useSession } from "@/providers/session-provider";
import type { NotificationFilters } from "@/types/api/notifications";
import { notificationKeys } from "../query-keys";
import { NOTIFICATION_PERMISSIONS, NOTIFICATIONS_PAGE_SIZE } from "../constants";
import { isNotificationCenterEnabled } from "../flag";

/**
 * Listagem paginada (mais recentes primeiro, do backend). `useInfiniteQuery`
 * acumula páginas e reinicia quando o filtro muda (a key muda). Gate: empresa
 * ativa + permissão + feature flag — desligado, a query nem sai.
 */
export function useNotifications(filters: NotificationFilters = {}) {
  const { activeCompanyId, can } = useSession();
  return useInfiniteQuery({
    queryKey: [...notificationKeys.list(filters), activeCompanyId],
    queryFn: ({ pageParam }) =>
      notificationsApi.list({ ...filters, page: pageParam, limit: NOTIFICATIONS_PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.totalPages ? last.page + 1 : undefined),
    enabled:
      Boolean(activeCompanyId) &&
      can(NOTIFICATION_PERMISSIONS.read) &&
      isNotificationCenterEnabled(),
  });
}

/**
 * Contador de não lidas — query INDEPENDENTE da listagem (o sino não precisa
 * carregar o painel). Converge por invalidação após mutações e ao abrir o painel.
 */
export function useUnreadCount() {
  const { activeCompanyId, can } = useSession();
  return useQuery({
    queryKey: [...notificationKeys.unreadCount(), activeCompanyId],
    queryFn: () => notificationsApi.unreadCount(),
    select: (data) => data.count,
    enabled:
      Boolean(activeCompanyId) &&
      can(NOTIFICATION_PERMISSIONS.read) &&
      isNotificationCenterEnabled(),
  });
}
