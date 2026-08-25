"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { crmApi, type TagFilters, type TagInput } from "@/lib/api/crm/client";
import { queryKeys, crmInvalidation } from "@/lib/query/keys";
import { useSession } from "@/providers/session-provider";

/**
 * Gestão de tags (GET/POST/PATCH/DELETE /tags). A associação a contatos vive em
 * `use-contact-detail` e não é duplicada aqui.
 *
 * Invalidação: além das listas de tags, mutações que alteram nome/cor ou
 * excluem a tag invalidam os CONTATOS — o detalhe do contato traz os chips de
 * tag embutidos (id/name/color) e ficaria desatualizado.
 */
export function useTagsList(filters?: TagFilters) {
  const { activeCompanyId, can } = useSession();
  return useQuery({
    queryKey: [...queryKeys.crm.tags(filters), activeCompanyId],
    queryFn: () => crmApi.listTagsPaged(filters),
    enabled: Boolean(activeCompanyId) && can("crm.tags.read"),
    placeholderData: (prev) => prev,
  });
}

export function useCreateTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: TagInput) => crmApi.createTag(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmInvalidation.allTags });
    },
  });
}

export function useUpdateTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: TagInput }) => crmApi.updateTag(id, body),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: crmInvalidation.allTags });
      qc.invalidateQueries({ queryKey: crmInvalidation.tag(id) });
      // nome/cor aparecem nos chips do detalhe do contato
      qc.invalidateQueries({ queryKey: crmInvalidation.allContacts });
    },
  });
}

export function useDeleteTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => crmApi.deleteTag(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmInvalidation.allTags });
      // o backend remove as associações no soft delete
      qc.invalidateQueries({ queryKey: crmInvalidation.allContacts });
    },
  });
}
