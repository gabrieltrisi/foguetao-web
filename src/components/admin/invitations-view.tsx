"use client";

import * as React from "react";
import Link from "next/link";
import { Mail, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { FilterBar } from "@/components/ui/filter-bar";
import { Pagination } from "@/components/ui/pagination";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { ErrorState } from "@/components/ui/error-state";
import { ConfirmDialog } from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/toast";
import { useSession } from "@/providers/session-provider";
import { useInvitations, useRevokeInvitation } from "@/hooks/company/use-team";
import { PERMISSIONS } from "@/lib/auth/permissions";
import {
  formatDate,
  invitationStatus,
  invitationStatusMeta,
  isRevocable,
  messageForTeamError,
  roleLabel,
  type InvitationStatus,
} from "@/lib/company/team";
import type { ApiInvitation } from "@/types/api/company";

const PAGE_SIZE = 20;

type Filter = "todos" | InvitationStatus;

export function InvitationsView() {
  const { toast } = useToast();
  const { can } = useSession();
  const [filter, setFilter] = React.useState<Filter>("todos");
  const [query, setQuery] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [confirmId, setConfirmId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const t = setTimeout(() => {
      setSearch(query);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [query]);

  const { data, isLoading, isError, refetch, isFetching } = useInvitations({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
  });
  const revoke = useRevokeInvitation();

  if (!can(PERMISSIONS.COMPANY_MEMBERS_READ)) {
    return (
      <p className="py-10 text-center text-body2 text-ink-3">
        Você não tem permissão para ver os convites desta empresa.
      </p>
    );
  }
  if (isError) {
    return <ErrorState title="Não foi possível carregar os convites." onRetry={() => refetch()} />;
  }

  const canInvite = can(PERMISSIONS.COMPANY_MEMBERS_INVITE);
  const all = data?.items ?? [];
  // O backend NÃO filtra convite por status (só busca por e-mail) — o status é
  // derivado, então o filtro roda no cliente, sobre a página carregada.
  const items = filter === "todos" ? all : all.filter((i) => invitationStatus(i) === filter);
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  const columns: DataTableColumn<ApiInvitation>[] = [
    {
      id: "email",
      header: "E-mail",
      cell: (i) => (
        <span className="inline-flex items-center gap-2 font-medium text-ink">
          <Mail className="size-4 text-ink-3" aria-hidden /> {i.email}
        </span>
      ),
    },
    {
      id: "role",
      header: "Papel",
      cell: (i) => (
        <Badge tone="neutral" className="normal-case">
          {roleLabel[i.role]}
        </Badge>
      ),
    },
    {
      id: "sentAt",
      header: "Enviado",
      hideable: true,
      cell: (i) => <span className="text-ink-2">{formatDate(i.createdAt)}</span>,
    },
    {
      id: "expiresAt",
      header: "Expira",
      cell: (i) => <span className="text-ink-2">{formatDate(i.expiresAt)}</span>,
    },
    {
      id: "status",
      header: "Status",
      cell: (i) => {
        const meta = invitationStatusMeta[invitationStatus(i)];
        return <Badge tone={meta.tone}>{meta.label}</Badge>;
      },
    },
    {
      id: "actions",
      header: "",
      hideable: false,
      className: "text-right",
      cell: (i) =>
        // Só convite pendente pode ser revogado: aceito → 409, revogado → no-op.
        canInvite && isRevocable(i) ? (
          <div className="flex items-center justify-end">
            <Button
              size="sm"
              variant="ghost"
              aria-label={`Revogar convite de ${i.email}`}
              onClick={() => setConfirmId(i.id)}
            >
              <X className="size-4" aria-hidden />
            </Button>
          </div>
        ) : (
          <span className="text-caption text-ink-3">—</span>
        ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <FilterBar>
        <SearchInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por e-mail…"
          containerClassName="w-full max-w-xs"
        />
        <SegmentedControl<Filter>
          options={[
            { value: "todos", label: "Todos" },
            { value: "PENDING", label: "Pendentes" },
            { value: "EXPIRED", label: "Expirados" },
            { value: "ACCEPTED", label: "Aceitos" },
            { value: "REVOKED", label: "Revogados" },
          ]}
          value={filter}
          onValueChange={setFilter}
        />
        {canInvite ? (
          <Button asChild size="sm" className="sm:ml-auto">
            <Link href="/team/new">
              <Plus className="size-4" aria-hidden /> Convidar
            </Link>
          </Button>
        ) : null}
      </FilterBar>

      <DataTable
        data={items}
        columns={columns}
        getRowId={(i) => i.id}
        loading={isLoading}
        pageSize={PAGE_SIZE}
        empty={{
          icon: Mail,
          title: "Nenhum convite.",
          description: "Convide alguém para participar desta empresa.",
        }}
      />

      {totalPages > 1 ? (
        <div className={cn("flex justify-end", isFetching && "opacity-60")}>
          <Pagination page={data?.page ?? 1} totalPages={totalPages} onPageChange={setPage} />
        </div>
      ) : null}

      <ConfirmDialog
        open={confirmId !== null}
        onOpenChange={(o) => !o && setConfirmId(null)}
        title="Revogar convite?"
        description="O link enviado deixará de funcionar."
        confirmLabel="Revogar"
        destructive
        onConfirm={() => {
          const id = confirmId;
          setConfirmId(null);
          if (!id) return;
          revoke.mutate(id, {
            onSuccess: () => toast({ title: "Convite revogado", variant: "success" }),
            onError: (e) => toast({ title: messageForTeamError(e), variant: "error" }),
          });
        }}
      />
    </div>
  );
}
