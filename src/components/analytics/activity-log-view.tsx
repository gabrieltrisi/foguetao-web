"use client";

import * as React from "react";
import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Combobox } from "@/components/ui/combobox";
import { FilterBar } from "@/components/ui/filter-bar";
import { SearchInput } from "@/components/ui/search-input";
import { Pagination } from "@/components/ui/pagination";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { ActivityItem } from "@/components/business/timeline";
import { useSession } from "@/providers/session-provider";
import { useAuditLog } from "@/hooks/company/use-audit";
import { PERMISSIONS } from "@/lib/auth/permissions";
import {
  ACTION_FILTER_OPTIONS,
  actionLabel,
  domainMeta,
  entityLabel,
  formatDateTime,
} from "@/lib/company/audit-display";
import type { AuditFilters } from "@/types/api/audit";

/**
 * Atividades da empresa. NÃO é uma segunda fonte: consome exatamente o mesmo
 * `useAuditLog` (GET /audit) que a tela de Auditoria — só a visualização muda,
 * de tabela para linha do tempo.
 */
const PAGE_SIZE = 20;
const ALL = "__all__";

export function ActivityLogView() {
  const { can } = useSession();

  const [action, setAction] = React.useState(ALL);
  const [query, setQuery] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);

  React.useEffect(() => {
    const t = setTimeout(() => {
      setSearch(query);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [query]);

  const filters: AuditFilters = {
    page,
    limit: PAGE_SIZE,
    sortOrder: "desc",
    action: action === ALL ? undefined : action,
    search: search || undefined,
  };

  const { data, isLoading, isError, isFetching, refetch } = useAuditLog(filters);

  if (!can(PERMISSIONS.COMPANY_AUDIT_READ)) {
    return (
      <p className="py-10 text-center text-body2 text-ink-3">
        Você não tem permissão para ver as atividades desta empresa.
      </p>
    );
  }
  if (isError) {
    return <ErrorState title="Não foi possível carregar as atividades." onRetry={() => refetch()} />;
  }

  const items = data?.items ?? [];
  const totalPages = data ? Math.max(1, data.totalPages) : 1;

  return (
    <div className="flex flex-col gap-4">
      <FilterBar>
        <SearchInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por Request ID ou recurso…"
          containerClassName="w-full max-w-xs"
        />
        <div className="w-52">
          <Combobox
            options={[{ value: ALL, label: "Todas as ações" }, ...ACTION_FILTER_OPTIONS]}
            value={action}
            onValueChange={(v) => {
              setAction(v);
              setPage(1);
            }}
          />
        </div>
      </FilterBar>

      <Card className="p-5">
        {isLoading ? (
          <ul className="flex flex-col gap-4" aria-busy>
            {Array.from({ length: 6 }).map((_, i) => (
              <li key={i} className="flex items-start gap-3">
                <Skeleton className="size-8 shrink-0 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </li>
            ))}
          </ul>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <Activity className="size-6 text-ink-3" aria-hidden />
            <p className="text-body2 text-ink-3">Nenhuma atividade registrada.</p>
          </div>
        ) : (
          <ul className={cn("flex flex-col gap-4", isFetching && "opacity-60")}>
            {items.map((log) => {
              const domain = domainMeta(log.action);
              return (
                <li key={log.id} className="flex items-start gap-3">
                  <Badge tone={domain.tone} size="sm" className="mt-1 shrink-0 normal-case">
                    {domain.label}
                  </Badge>
                  <ActivityItem
                    actorName={log.actor?.name ?? "Sistema"}
                    text={`${actionLabel(log.action)} · ${entityLabel(log.entity)}`}
                    time={formatDateTime(log.createdAt)}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {totalPages > 1 ? (
        <div className="flex justify-end">
          <Pagination page={data?.page ?? 1} totalPages={totalPages} onPageChange={setPage} />
        </div>
      ) : null}
    </div>
  );
}
