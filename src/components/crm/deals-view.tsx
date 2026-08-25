"use client";

import * as React from "react";
import Link from "next/link";
import { Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/search-input";
import { Combobox } from "@/components/ui/combobox";
import { FilterBar } from "@/components/ui/filter-bar";
import { Pagination } from "@/components/ui/pagination";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { ErrorState } from "@/components/ui/error-state";
import { useSession } from "@/providers/session-provider";
import { useDeals } from "@/hooks/crm/use-deals";
import { dealStatusMeta, dealPriorityMeta } from "@/lib/crm/deal-errors";
import { formatMoney } from "@/lib/crm/money";
import { formatDate } from "@/lib/crm/display";
import type { ApiDeal, DealStatus, DealPriority } from "@/types/api/crm-deals";

const PAGE_SIZE = 20;

const STATUS_OPTIONS = [
  { value: "todos", label: "Todos os status" },
  ...(["OPEN", "WON", "LOST", "ARCHIVED"] as DealStatus[]).map((s) => ({ value: s, label: dealStatusMeta[s].label })),
];
const PRIORITY_OPTIONS = [
  { value: "todas", label: "Todas as prioridades" },
  ...(["LOW", "MEDIUM", "HIGH", "URGENT"] as DealPriority[]).map((p) => ({ value: p, label: dealPriorityMeta[p].label })),
];

export function DealsView() {
  const { can } = useSession();
  const [query, setQuery] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState("todos");
  const [priority, setPriority] = React.useState("todas");
  const [page, setPage] = React.useState(1);

  React.useEffect(() => {
    const t = setTimeout(() => {
      setSearch(query);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [query]);

  const { data, isLoading, isError, refetch, isFetching } = useDeals({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    status: status === "todos" ? undefined : status,
    priority: priority === "todas" ? undefined : priority,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  if (!can("crm.deals.read")) {
    return <p className="py-10 text-center text-body2 text-ink-3">Você não tem permissão para ver oportunidades.</p>;
  }
  if (isError) {
    return <ErrorState title="Não foi possível carregar as oportunidades." onRetry={() => refetch()} />;
  }

  const items = data?.items ?? [];

  const columns: DataTableColumn<ApiDeal>[] = [
    {
      id: "title",
      header: "Oportunidade",
      cell: (d) => (
        <Link href={`/deals/${d.id}`} className="font-medium text-ink hover:text-brand">
          {d.title}
        </Link>
      ),
    },
    {
      id: "value",
      header: "Valor",
      className: "text-right tabular-nums",
      cell: (d) => <span className="font-medium">{formatMoney(d.value, d.currency)}</span>,
    },
    {
      id: "weighted",
      header: "Ponderado",
      hideable: true,
      className: "text-right tabular-nums",
      cell: (d) => <span className="text-ink-2">{formatMoney(d.weightedValue, d.currency)}</span>,
    },
    { id: "status", header: "Status", cell: (d) => <Badge tone={dealStatusMeta[d.status].tone}>{dealStatusMeta[d.status].label}</Badge> },
    { id: "priority", header: "Prioridade", hideable: true, cell: (d) => <Badge tone={dealPriorityMeta[d.priority].tone}>{dealPriorityMeta[d.priority].label}</Badge> },
    { id: "close", header: "Previsão", hideable: true, cell: (d) => <span className="text-ink-2">{formatDate(d.expectedCloseDate)}</span> },
  ];

  return (
    <div className="flex flex-col gap-4">
      <FilterBar>
        <SearchInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar oportunidades…"
          containerClassName="w-full max-w-xs"
        />
        <div className="w-44">
          <Combobox options={STATUS_OPTIONS} value={status} onValueChange={(v) => { setStatus(v); setPage(1); }} />
        </div>
        <div className="w-48">
          <Combobox options={PRIORITY_OPTIONS} value={priority} onValueChange={(v) => { setPriority(v); setPage(1); }} />
        </div>
      </FilterBar>

      <DataTable
        data={items}
        columns={columns}
        getRowId={(d) => d.id}
        loading={isLoading}
        pageSize={PAGE_SIZE}
        empty={{ icon: Target, title: "Nenhuma oportunidade encontrada.", description: "Ajuste os filtros ou crie uma nova oportunidade." }}
      />

      {data && data.totalPages > 1 ? (
        <div className={cn("flex justify-end", isFetching && "opacity-60")}>
          <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
        </div>
      ) : null}
    </div>
  );
}
