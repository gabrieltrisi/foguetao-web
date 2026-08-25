import { env } from "@/lib/env";

/**
 * Feature flag da central de notificações (F7.7). Desligada por padrão. Quando
 * `false`, o sino e o painel não são renderizados (self-gate) — o Topbar não é
 * alterado.
 */
export function isNotificationCenterEnabled(): boolean {
  return env.NEXT_PUBLIC_ENABLE_NOTIFICATION_CENTER;
}
