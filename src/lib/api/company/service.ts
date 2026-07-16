import "server-only";
import { backendFetch } from "@/lib/api/http";
import { buildQuery, type QueryParams } from "@/lib/api/query-string";
import { rolesResponseSchema, permissionCatalogSchema } from "@/types/api/rbac";
import {
  acceptInvitationResultSchema,
  companySchema,
  createInvitationResultSchema,
  invitationListSchema,
  memberListSchema,
  memberSchema,
  messageResultSchema,
} from "@/types/api/company";

interface Ctx {
  token: string;
  companyId: string;
}

/**
 * Membros e convites (Sprint 1.0D-2), contra os endpoints REAIS:
 * `/companies/:companyId/members` e `/companies/:companyId/invitations`.
 *
 * O `companyId` vem SEMPRE do contexto resolvido no BFF (cookie de sessão) —
 * nunca do corpo ou da query do browser.
 */
export const companyService = {
  /** GET /companies/:companyId — exige `company.read`. */
  get: ({ token, companyId }: Ctx) =>
    backendFetch(`/companies/${companyId}`, { token, companyId, schema: companySchema }),
  /**
   * PATCH /companies/:companyId — exige `company.update`. Só os campos do
   * UpdateCompanyDto: enviar slug/plan/status resulta em 400 no backend.
   */
  update: ({ token, companyId }: Ctx, body: unknown) =>
    backendFetch(`/companies/${companyId}`, {
      method: "PATCH",
      token,
      companyId,
      body,
      schema: companySchema,
    }),

  /** GET /roles — papéis do sistema (somente leitura, company.roles.read). */
  listRoles: ({ token, companyId }: Ctx) =>
    backendFetch(`/roles`, { token, companyId, schema: rolesResponseSchema }),
  /** GET /permissions/catalog — catálogo agrupado por domínio (somente leitura). */
  permissionCatalog: ({ token, companyId }: Ctx) =>
    backendFetch(`/permissions/catalog`, { token, companyId, schema: permissionCatalogSchema }),

  listMembers: ({ token, companyId }: Ctx, params?: QueryParams) =>
    backendFetch(`/companies/${companyId}/members${buildQuery(params)}`, {
      token,
      companyId,
      schema: memberListSchema,
    }),
  getMember: ({ token, companyId }: Ctx, memberId: string) =>
    backendFetch(`/companies/${companyId}/members/${memberId}`, {
      token,
      companyId,
      schema: memberSchema,
    }),
  /** PATCH aceita apenas `role` e `status` (ACTIVE|SUSPENDED). */
  updateMember: ({ token, companyId }: Ctx, memberId: string, body: unknown) =>
    backendFetch(`/companies/${companyId}/members/${memberId}`, {
      method: "PATCH",
      token,
      companyId,
      body,
      schema: memberSchema,
    }),
  /** DELETE responde 200 `{message}` — propagado como veio. */
  removeMember: ({ token, companyId }: Ctx, memberId: string) =>
    backendFetch(`/companies/${companyId}/members/${memberId}`, {
      method: "DELETE",
      token,
      companyId,
      schema: messageResultSchema,
    }),

  listInvitations: ({ token, companyId }: Ctx, params?: QueryParams) =>
    backendFetch(`/companies/${companyId}/invitations${buildQuery(params)}`, {
      token,
      companyId,
      schema: invitationListSchema,
    }),
  /**
   * 201. O `token` só vem fora de produção: o backend ainda não envia e-mail
   * (ver limitações na doc). Não inventamos o campo — ele é opcional no schema.
   */
  createInvitation: ({ token, companyId }: Ctx, body: unknown) =>
    backendFetch(`/companies/${companyId}/invitations`, {
      method: "POST",
      token,
      companyId,
      body,
      schema: createInvitationResultSchema,
    }),
  revokeInvitation: ({ token, companyId }: Ctx, invitationId: string) =>
    backendFetch(`/companies/${companyId}/invitations/${invitationId}`, {
      method: "DELETE",
      token,
      companyId,
      schema: messageResultSchema,
    }),

  /**
   * Aceitar convite: rota AUTENTICADA e SEM contexto de empresa (o convidado
   * ainda não é membro). Por isso recebe só o token de acesso.
   */
  acceptInvitation: (token: string, inviteToken: string) =>
    backendFetch(`/invitations/${encodeURIComponent(inviteToken)}/accept`, {
      method: "POST",
      token,
      schema: acceptInvitationResultSchema,
    }),
};
