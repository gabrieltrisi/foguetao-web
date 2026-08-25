"use client";

import { useQuery } from "@tanstack/react-query";
import { companyApi } from "@/lib/api/company/client";
import { queryKeys } from "@/lib/query/keys";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useSession } from "@/providers/session-provider";

/** RBAC é estático (muda com deploy, não com uso). */
const RBAC_STALE_MS = 10 * 60 * 1000;

/** Papéis do sistema. Exige `company.roles.read`. */
export function useRoles() {
  const { activeCompanyId, can } = useSession();
  return useQuery({
    queryKey: [...queryKeys.company.roles(), activeCompanyId],
    queryFn: () => companyApi.listRoles(),
    enabled: Boolean(activeCompanyId) && can(PERMISSIONS.COMPANY_ROLES_READ),
    staleTime: RBAC_STALE_MS,
  });
}

/** Catálogo de permissões agrupado por domínio. Exige `company.roles.read`. */
export function usePermissionCatalog() {
  const { activeCompanyId, can } = useSession();
  return useQuery({
    queryKey: [...queryKeys.company.permissionCatalog(), activeCompanyId],
    queryFn: () => companyApi.permissionCatalog(),
    enabled: Boolean(activeCompanyId) && can(PERMISSIONS.COMPANY_ROLES_READ),
    staleTime: RBAC_STALE_MS,
  });
}
