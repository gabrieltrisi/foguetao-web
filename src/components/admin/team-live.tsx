"use client";

import { Users, Loader2, TriangleAlert, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { EntityAvatar } from "@/components/business/entity-avatar";
import { useSession } from "@/providers/session-provider";
import { useMembers } from "@/hooks/company/use-members";
import { PERMISSIONS } from "@/lib/auth/permissions";
import type { ApiMember, MembershipStatus, CompanyRole } from "@/types/api/company";

const roleLabel: Record<CompanyRole, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  MANAGER: "Manager",
  MARKETING: "Marketing",
  COMMERCIAL: "Comercial",
  SUPPORT: "Suporte",
  FINANCIAL: "Financeiro",
  AFFILIATE: "Afiliado",
  VIEWER: "Viewer",
};

const statusMeta: Record<MembershipStatus, { label: string; tone: "success" | "info" | "warning" | "neutral" }> = {
  ACTIVE: { label: "Ativo", tone: "success" },
  INVITED: { label: "Convidado", tone: "info" },
  SUSPENDED: { label: "Suspenso", tone: "warning" },
  REMOVED: { label: "Removido", tone: "neutral" },
};

export function TeamLive() {
  const { can } = useSession();
  const canRead = can(PERMISSIONS.COMPANY_MEMBERS_READ);
  const { data, isLoading, isError } = useMembers();

  if (!canRead) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-line bg-surface p-4 text-body2 text-ink-2">
        <ShieldAlert className="size-4 text-warning" aria-hidden />
        Você não tem permissão para ver os membros desta empresa.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-10 text-body2 text-ink-2">
        <Loader2 className="size-4 animate-spin" aria-hidden /> Carregando equipe…
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/5 p-4 text-body2 text-danger">
        <TriangleAlert className="size-4" aria-hidden /> Não foi possível carregar a equipe.
      </div>
    );
  }

  const columns: DataTableColumn<ApiMember>[] = [
    {
      id: "name",
      header: "Usuário",
      cell: (m) => (
        <div className="flex items-center gap-2.5">
          <EntityAvatar name={m.user.name} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-medium text-ink">{m.user.name}</p>
            <p className="truncate text-caption text-ink-3">{m.user.email}</p>
          </div>
        </div>
      ),
    },
    { id: "role", header: "Cargo", cell: (m) => <Badge tone="neutral" className="normal-case">{roleLabel[m.role]}</Badge> },
    {
      id: "status",
      header: "Status",
      cell: (m) => <Badge tone={statusMeta[m.status].tone}>{statusMeta[m.status].label}</Badge>,
    },
    {
      id: "joined",
      header: "Entrou em",
      hideable: true,
      cell: (m) => (
        <span className="text-ink-2">
          {m.joinedAt ? new Date(m.joinedAt).toLocaleDateString("pt-BR") : "—"}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <p className="text-body2 text-ink-2">{data.total} membro(s) na empresa ativa</p>
      <DataTable
        data={data.items}
        columns={columns}
        getRowId={(m) => m.id}
        pageSize={10}
        empty={{ icon: Users, title: "Nenhum membro encontrado." }}
      />
    </div>
  );
}
