"use client";

import * as React from "react";
import { Users } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Combobox } from "@/components/ui/combobox";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { FilterBar } from "@/components/ui/filter-bar";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useCampaignRecipients } from "@/hooks/campaigns/use-campaigns";
import { EXCLUSION_LABELS, formatDateTime, recipientStatusMetaOf } from "@/lib/campaigns/display";
import { recipientStatusSchema, type RecipientFilters } from "@/types/api/campaigns";

const PAGE_SIZE = 20;

const STATUS_OPTIONS = [
  { value: "todos", label: "Todos os status" },
  ...recipientStatusSchema.options.map((s) => ({
    value: s,
    label: recipientStatusMetaOf(s).label,
  })),
];
const REASON_OPTIONS = [
  { value: "todos", label: "Todos os motivos" },
  ...Object.entries(EXCLUSION_LABELS).map(([value, label]) => ({ value, label })),
];

/** Tabela paginada de destinatários (server-side; filtros + busca com debounce). */
export function CampaignRecipientsTable({
  campaignId,
  timezone,
}: {
  campaignId: string;
  timezone?: string;
}) {
  const [query, setQuery] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<string>("todos");
  const [reason, setReason] = React.useState<string>("todos");
  const [page, setPage] = React.useState(1);

  // Debounce da busca (padrão do projeto: 350ms) + reset de página.
  React.useEffect(() => {
    const t = setTimeout(() => {
      setSearch(query);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [query]);

  const filters: RecipientFilters = {
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    status: status === "todos" ? undefined : (status as RecipientFilters["status"]),
    exclusionReason: reason === "todos" ? undefined : (reason as RecipientFilters["exclusionReason"]),
  };
  const q = useCampaignRecipients(campaignId, filters);
  const items = q.data?.items ?? [];

  return (
    <div className="flex flex-col gap-4">
      <FilterBar>
        <SearchInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por telefone…"
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
        <div className="w-48">
          <Combobox
            options={REASON_OPTIONS}
            value={reason}
            onValueChange={(v) => {
              setReason(v);
              setPage(1);
            }}
          />
        </div>
      </FilterBar>

      {q.isError ? (
        <ErrorState title="Não foi possível carregar os destinatários" onRetry={() => q.refetch()} />
      ) : q.isLoading && !q.data ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nenhum destinatário"
          description="Ajuste os filtros ou aguarde o congelamento do público."
        />
      ) : (
        <TableContainer className={cn(q.isFetching && "opacity-60")}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead className="text-right">Tent.</TableHead>
                <TableHead>Enviado</TableHead>
                <TableHead>Entregue</TableHead>
                <TableHead>Lido</TableHead>
                <TableHead>Falha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((r) => {
                const meta = recipientStatusMetaOf(r.status);
                return (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium text-ink">{r.name ?? "—"}</TableCell>
                    <TableCell className="tabular-nums">{r.phone}</TableCell>
                    <TableCell>
                      <Badge tone={badgeTone(meta.tone)}>{meta.label}</Badge>
                    </TableCell>
                    <TableCell className="text-ink-3">
                      {r.exclusionReason ? EXCLUSION_LABELS[r.exclusionReason] ?? r.exclusionReason : "—"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{r.attempts}</TableCell>
                    <TableCell className="text-ink-3">{formatDateTime(r.sentAt, timezone)}</TableCell>
                    <TableCell className="text-ink-3">
                      {formatDateTime(r.deliveredAt, timezone)}
                    </TableCell>
                    <TableCell className="text-ink-3">{formatDateTime(r.readAt, timezone)}</TableCell>
                    <TableCell className="text-danger">{r.errorCode ?? "—"}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {q.data && q.data.totalPages > 1 ? (
        <div className="flex justify-end">
          <Pagination page={q.data.page} totalPages={q.data.totalPages} onPageChange={setPage} />
        </div>
      ) : null}
    </div>
  );
}

/** Mapeia o tom do display (danger/success/info/neutral) para o tom do Badge. */
function badgeTone(tone: string): "neutral" | "success" | "warning" | "danger" | "info" {
  if (tone === "success" || tone === "danger" || tone === "warning" || tone === "info") return tone;
  return "neutral";
}
