"use client";

import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/providers/session-provider";
import { useAuditLog } from "@/hooks/company/use-audit";
import { actionLabel, entityLabel, formatDateTime } from "@/lib/company/audit-display";
import type { ApiAuditLog } from "@/types/api/audit";

const LIMIT = 5;

/**
 * Atividades recentes da empresa. Não existe um feed próprio no backend: a
 * única fonte company-wide real é a AUDITORIA (`GET /audit`), a mesma que
 * alimenta /activity-log — reusada aqui, sem segunda fonte nem lógica
 * duplicada. Exige `company.audit.read`.
 */
export function RecentActivities() {
  const { can } = useSession();
  const { data, isLoading, isError } = useAuditLog({ page: 1, limit: LIMIT, sortOrder: "desc" });

  const header = <SectionHeader title="Atividades recentes" />;

  if (!can("company.audit.read")) {
    return (
      <Card className="flex flex-col p-5">
        {header}
        <p className="mt-6 text-body2 text-ink-3">
          Você não tem permissão para ver as atividades da empresa.
        </p>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="flex flex-col gap-3 p-5">
        {header}
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="flex flex-col p-5">
        {header}
        <p role="alert" className="mt-6 text-body2 text-danger">
          Não foi possível carregar as atividades.
        </p>
      </Card>
    );
  }

  const items = data?.items ?? [];

  if (items.length === 0) {
    return (
      <Card className="flex flex-col p-5">
        {header}
        <p className="mt-6 text-body2 text-ink-3">Nenhuma atividade registrada ainda.</p>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col p-5">
      {header}
      <ul className="mt-4 flex flex-col gap-4">
        {items.map((log) => (
          <li key={log.id} className="flex items-start gap-3">
            <Avatar initials={initialsOf(log)} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="text-body2 text-ink-2">
                <strong className="font-semibold text-ink">{log.actor?.name ?? "Sistema"}</strong>{" "}
                {actionLabel(log.action).toLowerCase()} · {entityLabel(log.entity)}
              </p>
              <p className="mt-0.5 text-caption text-ink-3">{formatDateTime(log.createdAt)}</p>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

/** Iniciais do ator; sem ator (ação do sistema), usa "S". */
function initialsOf(log: ApiAuditLog): string {
  const name = log.actor?.name?.trim();
  if (!name) return "S";
  const parts = name.split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? "") : "";
  return (first + last).toUpperCase() || "S";
}
