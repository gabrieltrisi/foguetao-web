"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { companyApi } from "@/lib/api/company/client";
import { companyInvalidation, queryKeys } from "@/lib/query/keys";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useSession } from "@/providers/session-provider";
import type { UpdateCompanyInput } from "@/types/api/company";

/** Empresa ativa. Exige `company.read` (VIEWER tem; AFFILIATE não). */
export function useCompany() {
  const { activeCompanyId, can } = useSession();
  return useQuery({
    queryKey: [...queryKeys.company.current(), activeCompanyId],
    queryFn: () => companyApi.get(),
    enabled: Boolean(activeCompanyId) && can(PERMISSIONS.COMPANY_READ),
  });
}

/**
 * Atualiza a empresa ativa. Invalida a empresa e a SESSÃO: o nome/status/plano
 * aparecem no seletor de empresas, que vem de `/api/session`.
 */
export function useUpdateCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateCompanyInput) => companyApi.update(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: companyInvalidation.current });
      qc.invalidateQueries({ queryKey: queryKeys.session });
    },
  });
}
