"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { Bell } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useSession } from "@/providers/session-provider";
import type { ApiNotification } from "@/types/api/notifications";
import { NOTIFICATION_PERMISSIONS } from "../constants";
import { isNotificationCenterEnabled } from "../flag";
import { useUnreadCount } from "../hooks/use-notifications";
import { NotificationBadge } from "./notification-badge";

// Lazy load do painel — só é baixado quando o sino é aberto pela 1ª vez.
const NotificationPanel = dynamic(
  () => import("./notification-panel").then((m) => m.NotificationPanel),
  { ssr: false, loading: () => <div className="w-[22rem] p-6 sm:w-96" aria-busy /> },
);

/**
 * Sino de notificações. Infraestrutura pronta para o Topbar (F7.7) — NÃO é
 * montado no header nesta sprint (self-contido). Auto-gate: não renderiza nada
 * quando a feature flag está off ou o usuário não tem `notifications.read`.
 * Mostra o contador e abre o painel (lazy) num Popover.
 */
export function NotificationBell() {
  const { can } = useSession();
  const [open, setOpen] = React.useState(false);
  const unread = useUnreadCount();

  // Self-gate: flag desligada ou sem permissão → o sino não aparece.
  if (!isNotificationCenterEnabled() || !can(NOTIFICATION_PERMISSIONS.read)) {
    return null;
  }

  const count = unread.data ?? 0;

  const handleOpenItem = (notification: ApiNotification) => {
    setOpen(false);
    if (notification.actionUrl && typeof window !== "undefined") {
      window.location.assign(notification.actionUrl);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={count > 0 ? `Notificações (${count} não lidas)` : "Notificações"}
          className="relative flex size-9 items-center justify-center rounded-lg text-ink-2 transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <Bell className="size-5" aria-hidden />
          <NotificationBadge count={count} />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-auto overflow-hidden p-0">
        {open ? <NotificationPanel onOpenItem={handleOpenItem} /> : null}
      </PopoverContent>
    </Popover>
  );
}
