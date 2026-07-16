"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpDown, Info, Lock, ShieldCheck, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/providers/session-provider";
import { useRoles } from "@/hooks/company/use-rbac";
import { useTeamMembers } from "@/hooks/company/use-team";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { messageForRbacError, roleTone } from "@/lib/company/rbac";
import type { ApiRole } from "@/types/api/rbac";
import type { CompanyRole } from "@/types/api/company";

const iconTone: Record<string, string> = {
  danger: "text-danger",
  brand: "text-brand",
  info: "text-info",
  warning: "text-warning",
  neutral: "text-ink-2",
};

export function RolesView() {
  const { can } = useSession();
  const { data, isLoading, isError, error, refetch } = useRoles();

  // Contagem de membros por papel. Reusa o endpoint real de membros — NÃO há
  // agregação nova no backend. Só é confiável se todos couberem numa página (o
  // backend limita a 100); senão mostramos "—" em vez de um número errado.
  const canReadMembers = can(PERMISSIONS.COMPANY_MEMBERS_READ);
  const members = useTeamMembers(canReadMembers ? { limit: 100 } : undefined);

  const countByRole = React.useMemo(() => {
    const list = members.data;
    if (!list) return null;
    if (list.total > list.items.length) return null; // paginado → não confiável
    const map = new Map<CompanyRole, number>();
    for (const m of list.items) map.set(m.role, (map.get(m.role) ?? 0) + 1);
    return map;
  }, [members.data]);

  if (!can(PERMISSIONS.COMPANY_ROLES_READ)) {
    return (
      <p className="py-10 text-center text-body2 text-ink-3">
        Você não tem permissão para ver os papéis desta empresa.
      </p>
    );
  }
  if (isError || (!isLoading && !data)) {
    return (
      <ErrorState
        title="Não foi possível carregar os papéis."
        message={messageForRbacError(error)}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex items-start gap-2 p-4 text-body2 text-ink-2">
        <Info className="mt-0.5 size-4 shrink-0 text-info" aria-hidden />
        <span>
          Os papéis atuais são definidos pelo sistema. Papéis customizados serão disponibilizados
          futuramente.
        </span>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-body2 text-ink-2">
          {data ? (
            <>
              <span className="font-medium text-ink">{data.items.length}</span> papéis do sistema
            </>
          ) : (
            "Carregando papéis…"
          )}
        </p>
        <Button asChild size="sm" variant="secondary">
          <Link href="/permissions">Ver matriz de permissões</Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data!.items.map((role) => (
            <RoleCard
              key={role.role}
              role={role}
              memberCount={countByRole?.get(role.role) ?? 0}
              memberCountKnown={countByRole !== null}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function RoleCard({
  role,
  memberCount,
  memberCountKnown,
}: {
  role: ApiRole;
  memberCount: number;
  memberCountKnown: boolean;
}) {
  return (
    <Card className="flex flex-col gap-3 p-5">
      <div className="flex items-start justify-between gap-2">
        <span className="flex size-9 items-center justify-center rounded-lg bg-surface">
          <ShieldCheck
            className={cn("size-5", iconTone[roleTone[role.role]] ?? "text-ink-2")}
            aria-hidden
          />
        </span>
        {/* Papel do sistema, não editável — o badge comunica isso, sem botão. */}
        {role.system ? (
          <Badge tone="neutral">
            <Lock className="size-3" aria-hidden /> Papel do sistema
          </Badge>
        ) : null}
      </div>

      <div>
        <h3 className="font-display text-h3 font-semibold text-ink">{role.name}</h3>
        <p className="font-mono text-caption text-ink-3">{role.role}</p>
      </div>

      <p className="min-h-[2.5rem] text-body2 text-ink-2">{role.description}</p>

      <div className="flex items-center justify-between gap-2 border-t border-line pt-3 text-caption text-ink-3">
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="size-4" aria-hidden /> {role.permissionCount} permissões
        </span>
        <span className="inline-flex items-center gap-1.5" title="Ranking hierárquico">
          <ArrowUpDown className="size-4" aria-hidden /> rank {role.rank}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-caption text-ink-3">
          <Users className="size-4" aria-hidden />{" "}
          {memberCountKnown ? `${memberCount} membro(s)` : "—"}
        </span>
        <Button asChild size="sm" variant="ghost">
          <Link href={`/permissions?role=${role.role}`}>Ver permissões</Link>
        </Button>
      </div>
    </Card>
  );
}
