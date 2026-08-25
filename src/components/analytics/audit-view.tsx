"use client";

import * as React from "react";
import { ArrowDown, ArrowUp, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Combobox } from "@/components/ui/combobox";
import { FilterBar } from "@/components/ui/filter-bar";
import { SearchInput } from "@/components/ui/search-input";
import { Pagination } from "@/components/ui/pagination";
import { ErrorState } from "@/components/ui/error-state";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableSkeleton, TableEmpty } from "@/components/ui/data-table-parts";
import { AuditDetailSheet } from "@/components/analytics/audit-detail-sheet";
import { useSession } from "@/providers/session-provider";
import { useAuditLog } from "@/hooks/company/use-audit";
import { PERMISSIONS } from "@/lib/auth/permissions";
import {
  ACTION_FILTER_OPTIONS,
  ENTITY_FILTER_OPTIONS,
  actionLabel,
  domainMeta,
  entityLabel,
  formatDateTime,
  isFailure,
  maskIp,
  parseUserAgent,
} from "@/lib/company/audit-display";
import type { AuditFilters } from "@/types/api/audit";

const PAGE_SIZE = 20;
const ALL = "__all__";

export function AuditView() {
  const { can } = useSession();

  const [action, setAction] = React.useState(ALL);
  const [entity, setEntity] = React.useState(ALL);
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");
  const [query, setQuery] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  // Busca com debounce: cada mudança volta para a primeira página.
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
    sortOrder,
    action: action === ALL ? undefined : action,
    entity: entity === ALL ? undefined : entity,
    search: search || undefined,
  };

  const { data, isLoading, isError, isFetching, refetch } = useAuditLog(filters);

  if (!can(PERMISSIONS.COMPANY_AUDIT_READ)) {
    return (
      <p className="py-10 text-center text-body2 text-ink-3">
        Você não tem permissão para ver a auditoria desta empresa.
      </p>
    );
  }
  if (isError) {
    return <ErrorState title="Não foi possível carregar a auditoria." onRetry={() => refetch()} />;
  }

  const items = data?.items ?? [];
  const totalPages = data ? Math.max(1, data.totalPages) : 1;

  const resetPage = () => setPage(1);

  return (
    <div className="flex flex-col gap-4">
      <p className="flex items-center gap-2 rounded-lg border border-line bg-surface px-4 py-2.5 text-caption text-ink-2">
        <ShieldCheck className="size-4 shrink-0 text-success" aria-hidden />
        Registro imutável de ações. Dados sensíveis (senhas, tokens, cabeçalhos, payloads) nunca são
        exibidos; IPs aparecem mascarados.
      </p>

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
              resetPage();
            }}
          />
        </div>
        <div className="w-52">
          <Combobox
            options={[{ value: ALL, label: "Todos os recursos" }, ...ENTITY_FILTER_OPTIONS]}
            value={entity}
            onValueChange={(v) => {
              setEntity(v);
              resetPage();
            }}
          />
        </div>
        <Button
          size="sm"
          variant="secondary"
          className="sm:ml-auto"
          aria-label={`Ordenar por data: ${sortOrder === "desc" ? "mais recentes primeiro" : "mais antigos primeiro"}`}
          onClick={() => {
            setSortOrder((o) => (o === "desc" ? "asc" : "desc"));
            resetPage();
          }}
        >
          {sortOrder === "desc" ? (
            <ArrowDown className="size-4" aria-hidden />
          ) : (
            <ArrowUp className="size-4" aria-hidden />
          )}
          Data
        </Button>
      </FilterBar>

      {isLoading ? (
        <TableSkeleton rows={8} columns={6} />
      ) : (
        <TableContainer>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead>Recurso</TableHead>
                <TableHead>Ator</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead className="text-right" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={6} className="p-0">
                    <TableEmpty
                      icon={ShieldCheck}
                      title="Nenhum registro de auditoria."
                      description="Ações da empresa aparecerão aqui conforme acontecem."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                items.map((log) => {
                  const domain = domainMeta(log.action);
                  const ua = parseUserAgent(log.userAgent);
                  return (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap text-ink-2">
                        {formatDateTime(log.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge tone={domain.tone} size="sm" className="normal-case">
                            {domain.label}
                          </Badge>
                          <span
                            className={cn("font-medium", isFailure(log.action) && "text-danger")}
                          >
                            {actionLabel(log.action)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-ink-2">
                        {entityLabel(log.entity)}
                        {log.entityId ? (
                          <code className="ml-1 font-mono text-caption text-ink-3">
                            #{log.entityId.slice(0, 8)}
                          </code>
                        ) : null}
                      </TableCell>
                      <TableCell>
                        {log.actor ? (
                          <span className="font-medium text-ink">{log.actor.name}</span>
                        ) : (
                          <span className="text-ink-3">Sistema</span>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <code className="font-mono text-caption text-ink-3">
                          {maskIp(log.ipAddress)}
                        </code>
                        {ua.browser ? (
                          <span className="ml-1 text-caption text-ink-3">· {ua.browser}</span>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="secondary" onClick={() => setSelectedId(log.id)}>
                          Ver
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {totalPages > 1 ? (
        <div className={cn("flex items-center justify-between gap-3", isFetching && "opacity-60")}>
          <span className="text-small text-ink-3">
            {data?.total ?? 0} registro(s) · página {data?.page ?? 1} de {totalPages}
          </span>
          <Pagination page={data?.page ?? 1} totalPages={totalPages} onPageChange={setPage} />
        </div>
      ) : null}

      <AuditDetailSheet id={selectedId} onClose={() => setSelectedId(null)} />
    </div>
  );
}
