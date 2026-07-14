"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { crmApi, type ContactFilters } from "@/lib/api/crm/client";
import { queryKeys, crmInvalidation } from "@/lib/query/keys";
import { useSession } from "@/providers/session-provider";

/** Lista de contatos com paginação/filtros/busca reais. */
export function useContacts(filters: ContactFilters) {
  const { activeCompanyId } = useSession();
  return useQuery({
    queryKey: [...queryKeys.crm.contacts(filters), activeCompanyId],
    queryFn: () => crmApi.listContacts(filters),
    enabled: Boolean(activeCompanyId),
    placeholderData: (prev) => prev, // mantém dados anteriores ao paginar/filtrar
  });
}

export function useCreateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => crmApi.createContact(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: crmInvalidation.allContacts }),
  });
}

export function useUpdateContact(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => crmApi.updateContact(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmInvalidation.allContacts });
      qc.invalidateQueries({ queryKey: crmInvalidation.contact(id) });
    },
  });
}

export function useDeleteContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => crmApi.deleteContact(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: crmInvalidation.allContacts }),
  });
}

export function useArchiveContact(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => crmApi.archiveContact(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmInvalidation.allContacts });
      qc.invalidateQueries({ queryKey: crmInvalidation.contact(id) });
    },
  });
}

export function useRestoreContact(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => crmApi.restoreContact(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmInvalidation.allContacts });
      qc.invalidateQueries({ queryKey: crmInvalidation.contact(id) });
    },
  });
}
