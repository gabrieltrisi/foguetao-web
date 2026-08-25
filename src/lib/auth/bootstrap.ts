import "server-only";
import type { SessionBootstrap } from "@/types/api/session";
import { ApiError } from "@/types/api/error";
import {
  meRequest,
  listCompaniesRequest,
  companyContextRequest,
} from "./service";
import { getActiveCompanyId, setActiveCompanyId } from "./cookies";
import { withAuth } from "./session";

/**
 * Monta o payload de bootstrap do cliente a partir do backend:
 * usuário, empresas disponíveis, empresa ativa (persistida ou primeira válida)
 * e contexto/permissões da empresa ativa. Resolve o cookie fg_cid quando
 * ausente ou inválido (empresa não mais acessível).
 */
export async function buildSessionBootstrap(): Promise<SessionBootstrap> {
  return withAuth(async ({ token }) => {
    const [user, companies] = await Promise.all([
      meRequest(token),
      listCompaniesRequest(token),
    ]);

    if (companies.length === 0) {
      return { user, companies, activeCompanyId: null, context: null };
    }

    const stored = await getActiveCompanyId();
    const active = companies.find((c) => c.id === stored) ?? companies[0];

    // Persiste a empresa ativa quando não havia ou apontava para empresa inválida.
    if (stored !== active.id) {
      await setActiveCompanyId(active.id);
    }

    let context = null;
    try {
      context = await companyContextRequest(token, active.id);
    } catch (error) {
      // Empresa suspensa / sem membership: mantém empresas mas sem contexto.
      if (!(error instanceof ApiError)) throw error;
    }

    return { user, companies, activeCompanyId: active.id, context };
  });
}
