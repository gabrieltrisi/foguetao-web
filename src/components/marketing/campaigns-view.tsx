"use client";

import * as React from "react";
import Link from "next/link";
import { LayoutGrid, Megaphone, Plus, Table2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Combobox } from "@/components/ui/combobox";
import { FilterBar, ActiveFilters } from "@/components/ui/filter-bar";
import { Pagination } from "@/components/ui/pagination";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { ErrorState } from "@/components/ui/error-state";
import { useSession } from "@/providers/session-provider";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useCampaigns } from "@/hooks/marketing/use-campaigns";
import {
  CAMPAIGN_CHANNELS,
  CAMPAIGN_OBJECTIVES,
  CAMPAIGN_STATUSES,
  channelLabel,
  formatBudget,
  formatPeriod,
  objectiveLabel,
  statusMeta,
} from "@/lib/marketing/campaigns";
import type { ApiCampaign } from "@/types/api/marketing";

/**
 * Campanhas — dados REAIS de `GET /campaigns`.
 *
 * O contrato não tem métrica de mídia (investido, leads, CPL, ROAS…): esses
 * números pertencem a providers externos e ao domínio de Performance. Os
 * blocos que os exibiam foram REMOVIDOS em vez de mantidos com mock.
 */
const PAGE_SIZE = 20;
const ALL = "__all__";

/** Só quem pode criar vê o atalho — VIEWER não recebe um caminho para o 403. */
export function NewCampaignButton() {
  const { can } = useSession();
  if (!can(PERMISSIONS.CAMPAIGNS_CREATE)) return null;
  return (
    <Button asChild size="sm">
      <Link href="/campaigns/new">
        <Plus />
        Nova campanha
      </Link>
    </Button>
  );
}

export function CampaignsView() {
  const { can } = useSession();
  const [view, setView] = React.useState<"table" | "cards">("table");
  const [query, setQuery] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState(ALL);
  const [channel, setChannel] = React.useState(ALL);
  const [objective, setObjective] = React.useState(ALL);
  const [page, setPage] = React.useState(1);

  React.useEffect(() => {
    const t = setTimeout(() => {
      setSearch(query);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [query]);

  const { data, isLoading, isError, isFetching, refetch } = useCampaigns({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    status: status === ALL ? undefined : status,
    channel: channel === ALL ? undefined : channel,
    objective: objective === ALL ? undefined : objective,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  if (!can(PERMISSIONS.CAMPAIGNS_READ)) {
    return (
      <p className="text-body2 text-ink-3 py-10 text-center">
        Você não tem permissão para ver campanhas.
      </p>
    );
  }
  if (isError) {
    return <ErrorState title="Não foi possível carregar as campanhas." onRetry={() => refetch()} />;
  }

  const items = data?.items ?? [];
  const totalPages = data ? Math.max(1, data.totalPages) : 1;
  const reset = () => setPage(1);

  const columns: DataTableColumn<ApiCampaign>[] = [
    {
      id: "name",
      header: "Campanha",
      cell: (c) => (
        <div className="flex flex-col">
          <Link href={`/campaigns/${c.id}`} className="text-ink hover:text-brand font-medium">
            {c.name}
          </Link>
          {c.description ? (
            <span className="text-caption text-ink-3 truncate">{c.description}</span>
          ) : null}
        </div>
      ),
    },
    {
      id: "channel",
      header: "Canal",
      cell: (c) => (
        <Badge tone="neutral" className="normal-case">
          {channelLabel(c.channel)}
        </Badge>
      ),
    },
    {
      id: "objective",
      header: "Objetivo",
      hideable: true,
      cell: (c) => <span className="text-ink-2">{objectiveLabel(c.objective)}</span>,
    },
    {
      id: "status",
      header: "Status",
      cell: (c) => {
        const meta = statusMeta(c.status);
        return <Badge tone={meta.tone}>{meta.label}</Badge>;
      },
    },
    {
      id: "budget",
      header: "Orçamento",
      className: "text-right tabular-nums",
      cell: (c) => formatBudget(c.budget, c.currency),
    },
    {
      id: "period",
      header: "Período",
      hideable: true,
      cell: (c) => (
        <span className="text-ink-2 whitespace-nowrap">{formatPeriod(c.startAt, c.endAt)}</span>
      ),
    },
    {
      id: "provider",
      header: "Provider",
      hideable: true,
      defaultHidden: true,
      cell: (c) =>
        c.externalProvider ? (
          <span className="text-ink-2">
            {c.externalProvider}
            {c.externalId ? (
              <code className="text-caption text-ink-3 ml-1 font-mono">{c.externalId}</code>
            ) : null}
          </span>
        ) : (
          <span className="text-ink-3">—</span>
        ),
    },
  ];

  const activeFilters = [
    ...(status !== ALL ? [{ id: "status", label: "Status", value: statusMeta(status).label }] : []),
    ...(channel !== ALL ? [{ id: "channel", label: "Canal", value: channelLabel(channel) }] : []),
    ...(objective !== ALL
      ? [{ id: "objective", label: "Objetivo", value: objectiveLabel(objective) }]
      : []),
  ];

  return (
    <div className="flex flex-col gap-5">
      <FilterBar>
        <SearchInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar campanhas…"
          containerClassName="w-full max-w-xs"
        />
        <div className="w-44">
          <Combobox
            options={[
              { value: ALL, label: "Todos os canais" },
              ...CAMPAIGN_CHANNELS.map((c) => ({ value: c, label: channelLabel(c) })),
            ]}
            value={channel}
            onValueChange={(v) => {
              setChannel(v);
              reset();
            }}
          />
        </div>
        <div className="w-44">
          <Combobox
            options={[
              { value: ALL, label: "Todos os status" },
              ...CAMPAIGN_STATUSES.map((s) => ({ value: s, label: statusMeta(s).label })),
            ]}
            value={status}
            onValueChange={(v) => {
              setStatus(v);
              reset();
            }}
          />
        </div>
        <div className="w-44">
          <Combobox
            options={[
              { value: ALL, label: "Todos os objetivos" },
              ...CAMPAIGN_OBJECTIVES.map((o) => ({ value: o, label: objectiveLabel(o) })),
            ]}
            value={objective}
            onValueChange={(v) => {
              setObjective(v);
              reset();
            }}
          />
        </div>
        <SegmentedControl
          className="ml-auto"
          options={[
            { value: "table", label: "Tabela", icon: <Table2 className="size-4" /> },
            { value: "cards", label: "Cards", icon: <LayoutGrid className="size-4" /> },
          ]}
          value={view}
          onValueChange={setView}
        />
      </FilterBar>

      {activeFilters.length > 0 ? (
        <ActiveFilters
          filters={activeFilters}
          onRemove={(id) => {
            if (id === "status") setStatus(ALL);
            if (id === "channel") setChannel(ALL);
            if (id === "objective") setObjective(ALL);
            reset();
          }}
          onClear={() => {
            setStatus(ALL);
            setChannel(ALL);
            setObjective(ALL);
            reset();
          }}
        />
      ) : null}

      {view === "table" ? (
        <DataTable
          data={items}
          columns={columns}
          getRowId={(c) => c.id}
          loading={isLoading}
          pageSize={PAGE_SIZE}
          empty={{
            icon: Megaphone,
            title: "Nenhuma campanha encontrada.",
            description: "Crie a primeira campanha da sua operação.",
          }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((c) => (
            <CampaignCard key={c.id} campaign={c} />
          ))}
          {items.length === 0 && !isLoading ? (
            <p className="text-body2 text-ink-3 col-span-full py-10 text-center">
              Nenhuma campanha encontrada.
            </p>
          ) : null}
        </div>
      )}

      {totalPages > 1 ? (
        <div className={cn("flex items-center justify-between gap-3", isFetching && "opacity-60")}>
          <span className="text-small text-ink-3">
            {data?.total ?? 0} campanha(s) · página {data?.page ?? 1} de {totalPages}
          </span>
          <Pagination page={data?.page ?? 1} totalPages={totalPages} onPageChange={setPage} />
        </div>
      ) : null}
    </div>
  );
}

/** Card sem barra de investimento: `spent` não existe no contrato. */
function CampaignCard({ campaign: c }: { campaign: ApiCampaign }) {
  const meta = statusMeta(c.status);
  return (
    <Card className="flex flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/campaigns/${c.id}`}
          className="font-display text-h3 text-ink hover:text-brand min-w-0 truncate font-semibold"
        >
          {c.name}
        </Link>
        <Badge tone={meta.tone}>{meta.label}</Badge>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge tone="neutral" className="normal-case">
          {channelLabel(c.channel)}
        </Badge>
        <Badge tone="neutral" className="normal-case">
          {objectiveLabel(c.objective)}
        </Badge>
      </div>
      <dl className="border-line grid grid-cols-2 gap-2 border-t pt-3">
        <div>
          <dt className="text-caption text-ink-3">Orçamento</dt>
          <dd className="font-display text-body text-ink font-bold">
            {formatBudget(c.budget, c.currency)}
          </dd>
        </div>
        <div className="text-right">
          <dt className="text-caption text-ink-3">Período</dt>
          <dd className="text-body2 text-ink-2">{formatPeriod(c.startAt, c.endAt)}</dd>
        </div>
      </dl>
    </Card>
  );
}
