/**
 * Superfície pública da central de notificações (F7.7). Infraestrutura pronta
 * para o Topbar — o `NotificationBell` se auto-gate na feature flag e na
 * permissão, e NÃO é montado no header nesta sprint.
 */
export { NotificationBell } from "./components/notification-bell";
export { NotificationPanel } from "./components/notification-panel";
export { NotificationCard } from "./components/notification-card";
export { NotificationBadge } from "./components/notification-badge";
export { isNotificationCenterEnabled } from "./flag";
export { notificationKeys, notificationInvalidation } from "./query-keys";
export {
  useNotifications,
  useUnreadCount,
} from "./hooks/use-notifications";
export {
  useCreateNotification,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useArchiveNotification,
  useDeleteNotification,
} from "./hooks/use-notification-mutations";
