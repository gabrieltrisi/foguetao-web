"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Check, Info, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Combobox } from "@/components/ui/combobox";
import { SearchInput } from "@/components/ui/search-input";
import { FilterBar } from "@/components/ui/filter-bar";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/providers/session-provider";
import { useRoles, usePermissionCatalog } from "@/hooks/company/use-rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { filterCatalog, grantedCountInGroup, messageForRbacError } from "@/lib/company/rbac";
import type { ApiPermissionCatalog, ApiRole } from "@/types/api/rbac";

const NONE = "__none__";

export function PermissionsView() {
  const { can } = useSession();
  const params = useSearchParams();
  const rolesQuery = useRoles();
  const catalogQuery = usePermissionCatalog();

  if (!can(PERMISSIONS.COMPANY_ROLES_READ)) {
    return (
      <p className="py-10 text-center text-body2 text-ink-3">
        Você não tem permissão para ver as permissões desta empresa.
      </p>
    );
  }

  if (rolesQuery.isError || catalogQuery.isError) {
    return (
      <ErrorState
        title="Não foi possível carregar as permissões."
        message={messageForRbacError(rolesQuery.error ?? catalogQuery.error)}
        onRetry={() => {
          rolesQuery.refetch();
          catalogQuery.refetch();
        }}
      />
    );
  }

  if (rolesQuery.isLoading || catalogQuery.isLoading || !rolesQuery.data || !catalogQuery.data) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const roles = rolesQuery.data.items;
  if (roles.length === 0) {
    return (
      <EmptyState icon={Info} title="Nenhum papel disponível." compact />
    );
  }
  // Papel inicial vem do ?role= (via key), resolvido no shell — sem effect.
  const initialRole = roles.find((r) => r.role === params.get("role")) ?? roles[0];

  return (
    <PermissionsMatrix
      key={initialRole.role}
      roles={roles}
      catalog={catalogQuery.data}
      initialRole={initialRole}
    />
  );
}

function PermissionsMatrix({
  roles,
  catalog,
  initialRole,
}: {
  roles: readonly ApiRole[];
  catalog: ApiPermissionCatalog;
  initialRole: ApiRole;
}) {
  const [role, setRole] = React.useState<string>(initialRole.role);
  const [compareRole, setCompareRole] = React.useState<string>(NONE);
  const [query, setQuery] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [domain, setDomain] = React.useState("todos");

  React.useEffect(() => {
    const t = setTimeout(() => setSearch(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const selected = roles.find((r) => r.role === role) ?? initialRole;
  const compare = compareRole === NONE ? null : (roles.find((r) => r.role === compareRole) ?? null);

  const roleOptions = roles.map((r) => ({ value: r.role, label: r.name }));
  const domainOptions = [
    { value: "todos", label: "Todos os módulos" },
    ...catalog.groups.map((g) => ({ value: g.key, label: g.name })),
  ];

  const groups = filterCatalog(catalog, {
    search: search || undefined,
    domain: domain === "todos" ? undefined : domain,
  });

  const grantedSet = new Set(selected.permissions);
  const compareSet = compare ? new Set(compare.permissions) : null;

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex items-start gap-2 p-4 text-body2 text-ink-2">
        <Info className="mt-0.5 size-4 shrink-0 text-info" aria-hidden />
        <span>
          Os papéis são definidos pelo sistema. Esta matriz de permissões é somente leitura.
        </span>
      </Card>

      <FilterBar>
        <span className="text-body2 text-ink-2">Papel</span>
        <div className="w-52">
          <Combobox options={roleOptions} value={selected.role} onValueChange={setRole} />
        </div>
        <span className="text-body2 text-ink-2">Comparar</span>
        <div className="w-52">
          <Combobox
            options={[
              { value: NONE, label: "Nenhum" },
              ...roleOptions.filter((o) => o.value !== selected.role),
            ]}
            value={compareRole}
            onValueChange={setCompareRole}
          />
        </div>
        <div className="w-48">
          <Combobox options={domainOptions} value={domain} onValueChange={setDomain} />
        </div>
        <SearchInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar permissão…"
          containerClassName="w-full max-w-xs"
        />
      </FilterBar>

      <RoleSummary role={selected} total={catalog.total} compare={compare} />

      <HierarchyPanel role={selected} allRoles={roles} />

      {groups.length === 0 ? (
        <EmptyState
          icon={Info}
          title="Nenhuma permissão encontrada."
          description="Ajuste a busca ou o filtro de módulo."
          compact
        />
      ) : (
        <div className="flex flex-col gap-4">
          {groups.map((group) => {
            const keys = group.permissions.map((p) => p.key);
            const grantedInGroup = grantedCountInGroup(selected, keys);
            return (
              <Card key={group.key} className="overflow-hidden p-0">
                <div className="flex items-center justify-between gap-2 border-b border-line bg-surface px-4 py-2.5">
                  <h3 className="font-display text-h3 font-semibold text-ink">{group.name}</h3>
                  <Badge tone="neutral">
                    {grantedInGroup}/{keys.length}
                  </Badge>
                </div>
                <ul className="divide-y divide-line">
                  {group.permissions.map((perm) => {
                    const granted = grantedSet.has(perm.key);
                    const compareGranted = compareSet ? compareSet.has(perm.key) : null;
                    return (
                      <li
                        key={perm.key}
                        className="flex items-center justify-between gap-3 px-4 py-2.5"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-body2 text-ink">{perm.name}</p>
                          <p className="truncate font-mono text-caption text-ink-3">{perm.key}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-4">
                          <GrantIcon granted={granted} label={selected.name} />
                          {compare ? (
                            <GrantIcon granted={compareGranted!} label={compare.name} muted />
                          ) : null}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Hierarquia do papel selecionado: quem pode gerenciá-lo e quem ele pode
 * gerenciar. Vem PRONTO do backend (managedBy/canManage, derivados de
 * canManageTargetRole) — o front não recalcula. O backend é a autoridade final.
 */
function HierarchyPanel({ role, allRoles }: { role: ApiRole; allRoles: readonly ApiRole[] }) {
  const nameOf = (r: string) => allRoles.find((x) => x.role === r)?.name ?? r;
  return (
    <Card className="grid gap-4 p-4 sm:grid-cols-2">
      <div>
        <p className="text-caption font-semibold uppercase tracking-wide text-ink-3">
          Pode ser gerenciado por
        </p>
        {role.managedBy.length === 0 ? (
          <p className="mt-1 text-body2 text-ink-2">Ninguém (papel de maior privilégio).</p>
        ) : (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {role.managedBy.map((r) => (
              <Badge key={r} tone="neutral" className="normal-case">
                {nameOf(r)}
              </Badge>
            ))}
          </div>
        )}
      </div>
      <div>
        <p className="text-caption font-semibold uppercase tracking-wide text-ink-3">
          Pode gerenciar
        </p>
        {role.canManage.length === 0 ? (
          <p className="mt-1 text-body2 text-ink-2">Nenhum outro papel.</p>
        ) : (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {role.canManage.map((r) => (
              <Badge key={r} tone="neutral" className="normal-case">
                {nameOf(r)}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

function RoleSummary({
  role,
  total,
  compare,
}: {
  role: ApiRole;
  total: number;
  compare: ApiRole | null;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-body2 text-ink-2">
      <span>
        <span className="font-medium text-ink">{role.name}</span> ({role.role})
      </span>
      <span>
        <span className="font-medium text-ink">{role.permissionCount}</span> de {total} permissões
      </span>
      {compare ? (
        <span className="text-ink-3">
          comparando com <span className="font-medium text-ink-2">{compare.name}</span> (
          {compare.permissionCount})
        </span>
      ) : null}
    </div>
  );
}

function GrantIcon({
  granted,
  label,
  muted = false,
}: {
  granted: boolean;
  label: string;
  muted?: boolean;
}) {
  return granted ? (
    <span
      className={cn("inline-flex items-center", muted ? "text-ink-3" : "text-success")}
      title={`${label}: concedido`}
    >
      <Check className="size-4" aria-label={`${label}: concedido`} />
    </span>
  ) : (
    <span className="inline-flex items-center text-ink-3" title={`${label}: não concedido`}>
      <Minus className="size-4" aria-label={`${label}: não concedido`} />
    </span>
  );
}
