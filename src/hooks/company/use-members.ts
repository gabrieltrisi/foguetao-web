"use client";

import { useQuery } from "@tanstack/react-query";
import { companyApi } from "@/lib/api/company/client";
import { queryKeys } from "@/lib/query/keys";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useSession } from "@/providers/session-provider";
import type { MemberFilters } from "@/types/api/company";

/**
 * Membros da empresa ativa. Usa a MESMA chave de `useTeamMembers`, para que
 * uma mutação de equipe atualize também quem depende disto (ex.: o seletor de
 * responsável de tarefas).
 */
export function useMembers(filters: MemberFilters = { limit: 100 }) {
  const { activeCompanyId, can } = useSession();
  return useQuery({
    queryKey: [...queryKeys.company.members(filters), activeCompanyId],
    queryFn: () => companyApi.listMembers(filters),
    enabled: Boolean(activeCompanyId) && can(PERMISSIONS.COMPANY_MEMBERS_READ),
  });
}
