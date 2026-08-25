"use client";

import { WifiOff, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRealtimeStatus } from "@/providers/messaging-realtime-provider";
import { connectionLabel, shouldSurfaceConnection } from "@/features/inbox/view-models";

/**
 * Indicador DISCRETO de conexão realtime (F1, §5/§19). `connected` NÃO ocupa espaço;
 * só aparece offline/reconnecting/erro. Nunca expõe erro técnico. `aria-live` polite.
 */
export function InboxConnectionBadge() {
  const { status } = useRealtimeStatus();
  if (!shouldSurfaceConnection(status)) return null;
  const offline = status === "offline";
  return (
    <span
      role="status"
      aria-live="polite"
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-micro font-medium",
        offline ? "bg-danger/10 text-danger" : "bg-warning/10 text-warning",
      )}
      title={connectionLabel(status)}
    >
      {offline ? (
        <WifiOff className="size-3" aria-hidden />
      ) : (
        <RotateCw className="size-3 animate-spin" aria-hidden />
      )}
      {connectionLabel(status)}
    </span>
  );
}
