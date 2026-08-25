"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { companyApi } from "@/lib/api/company/client";
import { clientFetch } from "@/lib/api/client";
import { companyInvalidation, queryKeys } from "@/lib/query/keys";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useSession } from "@/providers/session-provider";
import type { ApiCompany, UpdateCompanyInput } from "@/types/api/company";

export interface CreateCompanyInput {
  name: string;
  phone?: string;
  timezone?: string;
}

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
 * Cria a empresa do usuário (onboarding). O BFF já define a empresa como ativa
 * (cookie fg_cid); aqui refazemos o bootstrap da sessão para que o status saia
 * de "no-companies" para "ready" ANTES de redirecionar ao dashboard, evitando
 * um flicker de volta ao onboarding.
 */
export function useCreateCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateCompanyInput) =>
      clientFetch<ApiCompany>("/api/companies", { method: "POST", body }),
    onSuccess: async () => {
      await qc.refetchQueries({ queryKey: queryKeys.session });
    },
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
