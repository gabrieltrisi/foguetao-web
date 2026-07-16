"use client";

import { useQuery } from "@tanstack/react-query";
import { auditApi } from "@/lib/api/audit/client";
import { queryKeys } from "@/lib/query/keys";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useSession } from "@/providers/session-provider";
import type { AuditFilters } from "@/types/api/audit";

/** Lista de auditoria. Exige `company.audit.read` (OWNER/ADMIN têm). */
export function useAuditLog(filters?: AuditFilters) {
  const { activeCompanyId, can } = useSession();
  return useQuery({
    queryKey: [...queryKeys.company.audit(filters), activeCompanyId],
    queryFn: () => auditApi.list(filters),
    enabled: Boolean(activeCompanyId) && can(PERMISSIONS.COMPANY_AUDIT_READ),
    placeholderData: (prev) => prev,
  });
}

/** Detalhe de um registro (usado no painel lateral). */
export function useAuditEntry(id: string | null) {
  const { activeCompanyId, can } = useSession();
  return useQuery({
    queryKey: [...queryKeys.company.auditEntry(id ?? ""), activeCompanyId],
    queryFn: () => auditApi.get(id as string),
    enabled: Boolean(activeCompanyId) && Boolean(id) && can(PERMISSIONS.COMPANY_AUDIT_READ),
  });
}
