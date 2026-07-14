"use client";

import { useQuery } from "@tanstack/react-query";
import { clientFetch } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";
import { useSession } from "@/providers/session-provider";
import type { MemberList } from "@/types/api/company";

/** Membros reais da empresa ativa (GET /api/team/members). */
export function useMembers() {
  const { activeCompanyId, can } = useSession();
  const allowed = can("company.members.read");
  return useQuery<MemberList>({
    queryKey: queryKeys.members(activeCompanyId),
    queryFn: ({ signal }) => clientFetch<MemberList>("/api/team/members", { signal }),
    enabled: Boolean(activeCompanyId) && allowed,
  });
}
