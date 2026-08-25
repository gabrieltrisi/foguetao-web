"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { SearchInput } from "@/components/ui/search-input";
import { FilterBar } from "@/components/ui/filter-bar";
import { Pagination } from "@/components/ui/pagination";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { ErrorState } from "@/components/ui/error-state";
import { EntityAvatar } from "@/components/business/entity-avatar";
import { useSession } from "@/providers/session-provider";
import { useTeamMembers } from "@/hooks/company/use-team";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { formatDate, memberStatusMeta, roleLabel, ROLES_BY_RANK } from "@/lib/company/team";
import type { ApiMember, CompanyRole, MembershipStatus } from "@/types/api/company";

const PAGE_SIZE = 20;

const ROLE_OPTIONS = [
  { value: "todos", label: "Todos os papéis" },
  ...ROLES_BY_RANK.map((r) => ({ value: r, label: roleLabel[r] })),
];

/** A listagem do backend já exclui removidos; INVITED existe mas não é usado. */
const STATUS_OPTIONS = [
  { value: "todos", label: "Todos os status" },
  ...(["ACTIVE", "SUSPENDED"] as MembershipStatus[]).map((s) => ({
    value: s,
    label: memberStatusMeta[s].label,
  })),
];

export function TeamLive() {
  const { can, user } = useSession();
  const [query, setQuery] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [role, setRole] = React.useState("todos");
  const [status, setStatus] = React.useState("todos");
  const [page, setPage] = React.useState(1);

  React.useEffect(() => {
    const t = setTimeout(() => {
      setSearch(query);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [query]);

  const { data, isLoading, isError, refetch, isFetching } = useTeamMembers({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    role: role === "todos" ? undefined : (role as CompanyRole),
    status: status === "todos" ? undefined : (status as MembershipStatus),
  });

  if (!can(PERMISSIONS.COMPANY_MEMBERS_READ)) {
    return (
      <p className="py-10 text-center text-body2 text-ink-3">
        Você não tem permissão para ver os membros desta empresa.
      </p>
    );
  }
  if (isError) {
    return <ErrorState title="Não foi possível carregar a equipe." onRetry={() => refetch()} />;
  }

  const items = data?.items ?? [];
  // Esta rota do backend NÃO devolve totalPages (diferente do CRM) — calculamos.
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;
  const onFilter = (set: (v: string) => void) => (v: string) => {
    set(v);
    setPage(1);
  };

  const columns: DataTableColumn<ApiMember>[] = [
    {
      id: "name",
      header: "Usuário",
      cell: (m) => (
        <div className="flex items-center gap-2.5">
          <EntityAvatar name={m.user.name} size="sm" />
          <div className="min-w-0">
            <Link
              href={`/team/${m.id}`}
              className="flex items-center gap-1.5 truncate font-medium text-ink hover:text-brand"
            >
              {m.user.name}
              {m.userId === user?.id ? (
                <span className="rounded bg-brand-soft px-1.5 py-0.5 text-micro font-medium text-brand-dark">
                  você
                </span>
              ) : null}
            </Link>
            <p className="truncate text-caption text-ink-3">{m.user.email}</p>
          </div>
        </div>
      ),
    },
    {
      id: "role",
      header: "Cargo",
      cell: (m) => (
        <Badge tone="neutral" className="normal-case">
          {roleLabel[m.role]}
        </Badge>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (m) => (
        <Badge tone={memberStatusMeta[m.status].tone}>{memberStatusMeta[m.status].label}</Badge>
      ),
    },
    {
      id: "joined",
      header: "Entrou em",
      hideable: true,
      cell: (m) => <span className="text-ink-2">{formatDate(m.joinedAt)}</span>,
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <FilterBar>
        <SearchInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nome ou e-mail…"
          containerClassName="w-full max-w-xs"
        />
        <div className="w-48">
          <Combobox options={ROLE_OPTIONS} value={role} onValueChange={onFilter(setRole)} />
        </div>
        <div className="w-44">
          <Combobox options={STATUS_OPTIONS} value={status} onValueChange={onFilter(setStatus)} />
        </div>
        {can(PERMISSIONS.COMPANY_MEMBERS_INVITE) ? (
          <Button asChild size="sm" className="ml-auto">
            <Link href="/team/new">
              <Plus />
              Convidar
            </Link>
          </Button>
        ) : null}
      </FilterBar>

      {data ? (
        <p className="text-body2 text-ink-2">
          <span className="font-medium text-ink">{data.total}</span> membro(s) na empresa ativa
        </p>
      ) : null}

      <DataTable
        data={items}
        columns={columns}
        getRowId={(m) => m.id}
        loading={isLoading}
        pageSize={PAGE_SIZE}
        empty={{
          icon: Users,
          title: "Nenhum membro encontrado.",
          description: "Ajuste os filtros ou convide alguém para a empresa.",
        }}
      />

      {totalPages > 1 ? (
        <div className={cn("flex justify-end", isFetching && "opacity-60")}>
          <Pagination page={data?.page ?? 1} totalPages={totalPages} onPageChange={setPage} />
        </div>
      ) : null}
    </div>
  );
}
