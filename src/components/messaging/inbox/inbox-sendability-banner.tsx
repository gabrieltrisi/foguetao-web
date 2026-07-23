"use client";

import { AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SendabilityView } from "@/lib/messaging/display";

/**
 * Banner de sendability. Recebe a VIEW já traduzida por `sendability()` — não
 * conhece `canSend`, `sendabilityReason` nem nenhum código CONNECTION_*. Só é
 * exibido quando o envio está indisponível (a UI disponível não precisa de aviso).
 */
export function InboxSendabilityBanner({ view }: { view: SendabilityView }) {
  if (view.canSend) return null;

  const danger = view.tone === "danger";
  const Icon = danger ? AlertTriangle : Info;

  return (
    <div
      role="status"
      className={cn(
        "flex items-start gap-2 border-b px-4 py-2.5 text-caption",
        danger ? "border-danger/20 bg-danger/5" : "border-warning/20 bg-warning/5",
      )}
    >
      <Icon className={cn("mt-0.5 size-4 shrink-0", danger ? "text-danger" : "text-warning")} aria-hidden />
      <div className="min-w-0">
        <p className="font-medium text-ink">{view.label}</p>
        <p className="text-ink-2">{view.message}</p>
      </div>
    </div>
  );
}
