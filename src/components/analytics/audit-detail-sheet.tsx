"use client";

import { ShieldCheck } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { StatList } from "@/components/business/kpi-block";
import { AuditStatusBadge } from "@/components/analytics/badges";
import { Badge } from "@/components/ui/badge";
import type { AuditEvent } from "@/types/analytics";

/** Sheet de detalhe de um evento de auditoria (metadata sanitizada). */
export function AuditDetailSheet({ event, onClose }: { event?: AuditEvent; onClose: () => void }) {
  return (
    <Sheet open={Boolean(event)} onOpenChange={(o) => (!o ? onClose() : undefined)}>
      {event ? (
        <SheetContent side="right" title={event.action} description={event.entity}>
          <div className="flex flex-col gap-5">
            <div><AuditStatusBadge status={event.status} size="md" /></div>
            <StatList
              items={[
                { label: "Usuário", value: event.user },
                { label: "Módulo", value: <Badge tone="neutral" className="normal-case">{event.module}</Badge> },
                { label: "Data", value: event.date },
                { label: "IP", value: <code className="font-mono text-caption">{event.ip}</code> },
                { label: "Request ID", value: <code className="font-mono text-caption">{event.requestId}</code> },
              ]}
            />
            <div>
              <p className="mb-2 text-caption font-semibold uppercase tracking-wide text-ink-3">Metadata</p>
              <div className="rounded-lg border border-line bg-surface p-3">
                <StatList items={event.metadata} />
              </div>
            </div>
            <p className="flex items-start gap-2 rounded-lg border border-line bg-white p-3 text-caption text-ink-2">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
              Senhas, tokens e payloads sensíveis nunca são registrados ou exibidos.
            </p>
          </div>
        </SheetContent>
      ) : null}
    </Sheet>
  );
}
