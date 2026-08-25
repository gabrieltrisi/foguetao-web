"use client";

import { useQuery } from "@tanstack/react-query";
import { crmApi } from "@/lib/api/crm/client";
import { queryKeys } from "@/lib/query/keys";
import { useSession } from "@/providers/session-provider";

/**
 * Hooks finos de LEITURA por contato (F6) sobre métodos de client já existentes
 * (`crmApi.listNotes`/`listActivities`) + as query keys já RESERVADAS
 * (`crm.contactNotes`/`crm.contactActivities`). Não inventam endpoint. Trazem a
 * primeira página (o backend ordena por mais recente); a paginação profunda fica no
 * CRM. Cada um é independente (query própria → invalidação/loading/erro por seção).
 */
export function useContactNotes(contactId: string | undefined) {
  const { activeCompanyId, can } = useSession();
  return useQuery({
    queryKey: [...queryKeys.crm.contactNotes(contactId ?? "none"), activeCompanyId],
    queryFn: () => crmApi.listNotes(contactId as string),
    enabled: Boolean(activeCompanyId && contactId) && can("crm.notes.read"),
    staleTime: 30_000,
  });
}

export function useContactActivities(contactId: string | undefined) {
  const { activeCompanyId, can } = useSession();
  return useQuery({
    queryKey: [...queryKeys.crm.contactActivities(contactId ?? "none"), activeCompanyId],
    queryFn: () => crmApi.listActivities(contactId as string),
    enabled: Boolean(activeCompanyId && contactId) && can("crm.activities.read"),
    staleTime: 30_000,
  });
}
