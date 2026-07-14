"use client";

import * as React from "react";
import { useMembers } from "@/hooks/company/use-members";
import { useSession } from "@/providers/session-provider";
import { isAssignableRole } from "@/lib/crm/task-helpers";

/**
 * Membros elegíveis a serem responsáveis por tarefas.
 *
 * Fonte real: GET /api/team/members (→ GET /companies/:id/members), que exige
 * `company.members.read`. Filtra por membership ACTIVE e pelos papéis aceitos
 * pelo AssigneePolicy do backend — assim o seletor não oferece opções que
 * resultariam em 403 (ASSIGNEE_ROLE_NOT_ALLOWED / ASSIGNEE_INACTIVE).
 */
export function useAssignableMembers() {
  const { can } = useSession();
  const canRead = can("company.members.read");
  const query = useMembers();

  const options = React.useMemo(
    () =>
      (query.data?.items ?? [])
        .filter((m) => m.status === "ACTIVE" && isAssignableRole(m.role))
        .map((m) => ({ value: m.userId, label: m.user.name })),
    [query.data],
  );

  /** id do usuário → nome, para exibir responsável sem N+1 na listagem. */
  const nameById = React.useMemo(() => {
    const map = new Map<string, string>();
    query.data?.items.forEach((m) => map.set(m.userId, m.user.name));
    return map;
  }, [query.data]);

  return {
    canRead,
    options,
    nameById,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
