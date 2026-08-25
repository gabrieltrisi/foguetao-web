"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Plug } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { SearchInput } from "@/components/ui/search-input";
import { FilterBar } from "@/components/ui/filter-bar";
import { Pagination } from "@/components/ui/pagination";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { ErrorState } from "@/components/ui/error-state";
import { useSession } from "@/providers/session-provider";
import { useConnections, useIntegrationCatalog } from "@/hooks/integrations/use-integrations";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { connectionStatusMeta, formatDateTime } from "@/lib/integrations/display";
import type {
  ApiIntegrationConnection,
  IntegrationStatus,
} from "@/types/api/integrations";

const PAGE_SIZE = 20;

const STATUS_OPTIONS = [
  { value: "todos", label: "Todos os status" },
  ...(
    [
      "DRAFT",
      "CONNECTED",
      "DISCONNECTED",
      "DEGRADED",
      "ERROR",
      "CONNECTING",
      "REVOKED",
    ] as IntegrationStatus[]
  ).map((s) => ({ value: s, label: connectionStatusMeta[s].label })),
];

export function ConnectionsView() {
  const { can } = useSession();
  const [query, setQuery] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState("todos");
  const [page, setPage] = React.useState(1);

  React.useEffect(() => {
    const t = setTimeout(() => {
      setSearch(query);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [query]);

  const { data, isLoading, isError, refetch, isFetching } = useConnections({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    status: status === "todos" ? undefined : (status as IntegrationStatus),
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  // Nome amigável do provider vem do catálogo já carregado — evita uma
  // requisição por linha da tabela.
  const catalog = useIntegrationCatalog();
  const providerName = React.useMemo(() => {
    const map = new Map<string, { name: string; mock: boolean }>();
    catalog.data?.items.forEach((i) => {
      if (i.provider) map.set(i.provider, { name: i.name, mock: i.mock });
    });
    return map;
  }, [catalog.data]);

  if (!can(PERMISSIONS.INTEGRATIONS_CONNECTIONS_READ)) {
    return (
      <p className="py-10 text-center text-body2 text-ink-3">
        Você não tem permissão para ver conexões.
      </p>
    );
  }
  if (isError) {
    return <ErrorState title="Não foi possível carregar as conexões." onRetry={() => refetch()} />;
  }

  const columns: DataTableColumn<ApiIntegrationConnection>[] = [
    {
      id: "name",
      header: "Nome",
      cell: (c) => (
        <Link
          href={`/integrations/connections/${c.id}`}
          className="font-medium text-ink hover:text-brand"
        >
          {c.name}
        </Link>
      ),
    },
    {
      id: "provider",
      header: "Integração",
      cell: (c) => (
        <span className="inline-flex items-center gap-1.5">
          <span className="text-body2 text-ink">{providerName.get(c.provider)?.name ?? c.provider}</span>
          {providerName.get(c.provider)?.mock ? <Badge tone="info">MOCK</Badge> : null}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (c) => (
        <Badge tone={connectionStatusMeta[c.status].tone}>{connectionStatusMeta[c.status].label}</Badge>
      ),
    },
    {
      id: "lastCheck",
      header: "Última verificação",
      hideable: true,
      cell: (c) => <span className="text-ink-2">{formatDateTime(c.lastConnectedAt)}</span>,
    },
    {
      id: "lastFailure",
      header: "Última falha",
      hideable: true,
      cell: (c) =>
        c.lastFailureAt ? (
          <span className="text-caption text-danger">
            {c.lastErrorCode ?? "Falha"} · {formatDateTime(c.lastFailureAt)}
          </span>
        ) : (
          <span className="text-ink-3">—</span>
        ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <FilterBar>
        <SearchInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar conexões…"
          containerClassName="w-full max-w-xs"
        />
        <div className="w-48">
          <Combobox
            options={STATUS_OPTIONS}
            value={status}
            onValueChange={(v) => {
              setStatus(v);
              setPage(1);
            }}
          />
        </div>
        <Button asChild size="sm" variant="secondary" className="ml-auto">
          <Link href="/integrations">Ver catálogo</Link>
        </Button>
      </FilterBar>

      <DataTable
        data={data?.items ?? []}
        columns={columns}
        getRowId={(c) => c.id}
        loading={isLoading}
        pageSize={PAGE_SIZE}
        empty={{
          icon: Plug,
          title: "Nenhuma conexão configurada.",
          description: "Escolha uma integração no catálogo para criar a primeira configuração.",
        }}
      />

      {data && data.totalPages > 1 ? (
        <div className={cn("flex justify-end", isFetching && "opacity-60")}>
          <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
        </div>
      ) : null}
    </div>
  );
}
