"use client";

import { ShieldCheck } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { StatList } from "@/components/business/kpi-block";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuditEntry } from "@/hooks/company/use-audit";
import {
  actionLabel,
  domainMeta,
  entityLabel,
  formatDateTime,
  isFailure,
  maskIp,
  messageForAuditError,
  metadataEntries,
  parseUserAgent,
} from "@/lib/company/audit-display";
import type { ApiAuditLog } from "@/types/api/audit";

/**
 * Detalhe lateral de um registro de auditoria. Recebe apenas o `id` e busca o
 * registro completo pelo mesmo contrato (GET /audit/:id) — nunca uma segunda
 * fonte. Mostra RequestId, Actor, Action, Resource/Target, Data, Origem
 * (IP mascarado, navegador derivado) e metadata JÁ sanitizada pelo backend.
 */
export function AuditDetailSheet({ id, onClose }: { id: string | null; onClose: () => void }) {
  const { data, isLoading, isError, error } = useAuditEntry(id);

  return (
    <Sheet open={id !== null} onOpenChange={(o) => (!o ? onClose() : undefined)}>
      {id !== null ? (
        <SheetContent
          side="right"
          title={data ? actionLabel(data.action) : "Registro de auditoria"}
          description={data ? entityLabel(data.entity) : undefined}
        >
          {isLoading ? (
            <div className="flex flex-col gap-3" aria-busy>
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : isError ? (
            <p role="alert" className="py-8 text-center text-body2 text-danger">
              {messageForAuditError(error)}
            </p>
          ) : data ? (
            <AuditDetailBody log={data} />
          ) : null}
        </SheetContent>
      ) : null}
    </Sheet>
  );
}

function AuditDetailBody({ log }: { log: ApiAuditLog }) {
  const domain = domainMeta(log.action);
  const ua = parseUserAgent(log.userAgent);
  const meta = metadataEntries(log);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={domain.tone} className="normal-case">
          {domain.label}
        </Badge>
        <Badge tone={isFailure(log.action) ? "danger" : "success"}>
          {isFailure(log.action) ? "Falha" : "Sucesso"}
        </Badge>
      </div>

      <StatList
        items={[
          {
            label: "Ator",
            value: log.actor ? (
              <span className="text-right">
                <span className="block font-medium text-ink">{log.actor.name}</span>
                <span className="block text-caption text-ink-3">{log.actor.email}</span>
              </span>
            ) : (
              <span className="text-ink-3">Sistema</span>
            ),
          },
          { label: "Ação", value: actionLabel(log.action) },
          {
            label: "Recurso",
            value: (
              <span className="text-right">
                <span className="block">{entityLabel(log.entity)}</span>
                {log.entityId ? (
                  <code className="block font-mono text-caption text-ink-3">{log.entityId}</code>
                ) : null}
              </span>
            ),
          },
          { label: "Data", value: formatDateTime(log.createdAt) },
          {
            label: "Origem",
            value: (
              <span className="text-right">
                <code className="block font-mono text-caption">{maskIp(log.ipAddress)}</code>
                {ua.label ? <span className="block text-caption text-ink-3">{ua.label}</span> : null}
              </span>
            ),
          },
          {
            label: "Request ID",
            value: log.requestId ? (
              <code className="font-mono text-caption">{log.requestId}</code>
            ) : (
              <span className="text-ink-3">—</span>
            ),
          },
        ]}
      />

      <div>
        <p className="mb-2 text-caption font-semibold uppercase tracking-wide text-ink-3">Metadata</p>
        <div className="rounded-lg border border-line bg-surface p-3">
          {meta.length === 0 ? (
            <p className="text-caption text-ink-3">Sem metadados.</p>
          ) : (
            <StatList
              items={meta.map(([label, value]) => ({
                label,
                value: <span className="break-all text-right font-mono text-caption">{value}</span>,
              }))}
            />
          )}
        </div>
      </div>

      <p className="flex items-start gap-2 rounded-lg border border-line bg-white p-3 text-caption text-ink-2">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
        Senhas, tokens, cabeçalhos e payloads sensíveis nunca são exibidos — são redigidos na
        origem.
      </p>
    </div>
  );
}
