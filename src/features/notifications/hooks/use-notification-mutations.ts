"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "@/lib/api/notifications/client";
import type { CreateNotificationInput } from "@/types/api/notifications";
import { notificationInvalidation } from "../query-keys";

/**
 * Invalida listagens + contador após qualquer mutação. Preciso (por prefixo),
 * nunca blanket — não mexe em keys de outros domínios.
 */
function useNotificationInvalidation() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: notificationInvalidation.lists });
    qc.invalidateQueries({ queryKey: notificationInvalidation.unreadCount });
  };
}

export function useCreateNotification() {
  const invalidate = useNotificationInvalidation();
  return useMutation({
    mutationFn: (input: CreateNotificationInput) => notificationsApi.create(input),
    onSuccess: invalidate,
  });
}

export function useMarkNotificationRead() {
  const invalidate = useNotificationInvalidation();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: invalidate,
  });
}

export function useMarkAllNotificationsRead() {
  const invalidate = useNotificationInvalidation();
  return useMutation({ mutationFn: () => notificationsApi.markAllRead(), onSuccess: invalidate });
}

export function useArchiveNotification() {
  const invalidate = useNotificationInvalidation();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.archive(id),
    onSuccess: invalidate,
  });
}

export function useDeleteNotification() {
  const invalidate = useNotificationInvalidation();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.remove(id),
    onSuccess: invalidate,
  });
}
