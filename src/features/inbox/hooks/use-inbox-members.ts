"use client";

import * as React from "react";
import { useMembers } from "@/hooks/company/use-members";
import { useSession } from "@/providers/session-provider";

/**
 * Papéis que o backend aceita como RESPONSÁVEL (atendente) de uma conversa
 * (`conversations.service`: assignee deve ser membro ACTIVE com um destes papéis).
 * Filtramos aqui para o picker não oferecer opção que resultaria em 422.
 */
const ASSIGNABLE_ROLES = new Set(["OWNER", "ADMIN", "MANAGER", "COMMERCIAL", "SUPPORT"]);

/**
 * Membros elegíveis a responsável na Inbox (F4). Fonte real: `GET /companies/:id/members`
 * (perm `company.members.read` — distinta de `messaging.conversations.assign`). O DTO
 * NÃO traz avatar → o picker usa iniciais. `nameById` resolve o responsável sem N+1.
 */
export function useInboxAssignableMembers() {
  const { can } = useSession();
  const canReadMembers = can("company.members.read");
  const query = useMembers();

  const options = React.useMemo(
    () =>
      (query.data?.items ?? [])
        .filter((m) => m.status === "ACTIVE" && ASSIGNABLE_ROLES.has(m.role))
        .map((m) => ({ value: m.userId, label: m.user.name })),
    [query.data],
  );

  const nameById = React.useMemo(() => {
    const map = new Map<string, string>();
    query.data?.items.forEach((m) => map.set(m.userId, m.user.name));
    return map;
  }, [query.data]);

  return { canReadMembers, options, nameById, isLoading: query.isLoading };
}
