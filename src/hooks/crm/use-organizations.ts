"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { crmApi, type ContactFilters } from "@/lib/api/crm/client";
import { queryKeys, crmInvalidation } from "@/lib/query/keys";
import { useSession } from "@/providers/session-provider";

export function useOrganizations(filters: ContactFilters) {
  const { activeCompanyId } = useSession();
  return useQuery({
    queryKey: [...queryKeys.crm.organizations(filters), activeCompanyId],
    queryFn: () => crmApi.listOrganizations(filters),
    enabled: Boolean(activeCompanyId),
    placeholderData: (prev) => prev,
  });
}

export function useOrganization(id: string) {
  const { activeCompanyId } = useSession();
  return useQuery({
    queryKey: [...queryKeys.crm.organization(id), activeCompanyId],
    queryFn: () => crmApi.getOrganization(id),
    enabled: Boolean(activeCompanyId) && Boolean(id),
  });
}

export function useOrgContacts(id: string, filters?: ContactFilters) {
  const { activeCompanyId } = useSession();
  return useQuery({
    queryKey: [...queryKeys.crm.orgContacts(id), filters ?? {}, activeCompanyId],
    queryFn: () => crmApi.listOrgContacts(id, filters),
    enabled: Boolean(activeCompanyId) && Boolean(id),
  });
}

export function useCreateOrganization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => crmApi.createOrganization(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: crmInvalidation.allOrganizations }),
  });
}

export function useUpdateOrganization(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => crmApi.updateOrganization(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmInvalidation.allOrganizations });
      qc.invalidateQueries({ queryKey: crmInvalidation.organization(id) });
    },
  });
}

export function useDeleteOrganization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => crmApi.deleteOrganization(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: crmInvalidation.allOrganizations }),
  });
}
