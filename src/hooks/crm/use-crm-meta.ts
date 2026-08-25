"use client";

import { useQuery } from "@tanstack/react-query";
import { crmApi } from "@/lib/api/crm/client";
import { queryKeys } from "@/lib/query/keys";
import { useSession } from "@/providers/session-provider";

/** Tags da empresa (para associação a contatos). */
export function useTags() {
  const { activeCompanyId, can } = useSession();
  return useQuery({
    queryKey: [...queryKeys.crm.tags(), activeCompanyId],
    queryFn: () => crmApi.listTags(),
    enabled: Boolean(activeCompanyId) && can("crm.tags.read"),
  });
}

/** Definições de campos personalizados por entidade (CONTACT | ORGANIZATION). */
export function useCustomFieldDefs(entityType: "CONTACT" | "ORGANIZATION") {
  const { activeCompanyId, can } = useSession();
  return useQuery({
    queryKey: [...queryKeys.crm.customFieldDefs(entityType), activeCompanyId],
    queryFn: () => crmApi.listCustomFieldDefs(entityType),
    enabled: Boolean(activeCompanyId) && can("crm.custom_fields.read"),
  });
}
