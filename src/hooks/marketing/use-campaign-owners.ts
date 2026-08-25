"use client";

import * as React from "react";
import { useMembers } from "@/hooks/company/use-members";
import { useRoles } from "@/hooks/company/use-rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useSession } from "@/providers/session-provider";

/**
 * Membros elegíveis a ser responsáveis por uma campanha.
 *
 * O backend (CampaignOwnerPolicy) exige membership ACTIVE + `campaigns.read`.
 * Aqui NÃO há allowlist de cargos: a matriz papel→permissões vem de
 * `GET /roles`, que é a mesma fonte que o backend usa. Se o usuário não puder
 * ler papéis, oferecemos todos os membros ACTIVE e o backend decide (403
 * CAMPAIGN_OWNER_INVALID vira toast) — nunca inventamos a regra.
 */
export function useCampaignOwnerOptions() {
  const { can } = useSession();
  const canReadMembers = can(PERMISSIONS.COMPANY_MEMBERS_READ);
  const members = useMembers();
  const roles = useRoles();

  /** Papéis que enxergam campanhas, segundo o contrato de RBAC. */
  const rolesWithRead = React.useMemo(() => {
    if (!roles.data) return null;
    return new Set(
      roles.data.items
        .filter((r) => r.permissions.includes(PERMISSIONS.CAMPAIGNS_READ))
        .map((r) => r.role),
    );
  }, [roles.data]);

  const options = React.useMemo(
    () =>
      (members.data?.items ?? [])
        .filter((m) => m.status === "ACTIVE")
        .filter((m) => (rolesWithRead ? rolesWithRead.has(m.role) : true))
        .map((m) => ({ value: m.userId, label: m.user.name })),
    [members.data, rolesWithRead],
  );

  /** id do usuário → nome, para exibir o responsável sem N+1. */
  const nameById = React.useMemo(() => {
    const map = new Map<string, string>();
    members.data?.items.forEach((m) => map.set(m.userId, m.user.name));
    return map;
  }, [members.data]);

  return { canReadMembers, options, nameById, isLoading: members.isLoading };
}
