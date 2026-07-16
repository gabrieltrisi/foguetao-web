"use client";

import { clientFetch } from "@/lib/api/client";
import { buildQuery, type QueryParams } from "@/lib/api/query-string";
import type { ApiRolesResponse, ApiPermissionCatalog } from "@/types/api/rbac";
import type {
  ApiAcceptInvitationResult,
  ApiCompany,
  ApiCreateInvitationResult,
  ApiMember,
  CreateInvitationInput,
  InvitationFilters,
  InvitationList,
  MemberFilters,
  MemberList,
  UpdateCompanyInput,
  UpdateMemberInput,
} from "@/types/api/company";

const C = "/api/company";
const M = "/api/company/members";
const I = "/api/company/invitations";

/** Membros e convites (browser → BFF). Nunca fala com o backend direto. */
export const companyApi = {
  /** Empresa ativa (o companyId vem da sessão, no BFF). */
  get: () => clientFetch<ApiCompany>(C),
  update: (body: UpdateCompanyInput) => clientFetch<ApiCompany>(C, { method: "PATCH", body }),

  /** RBAC somente leitura. */
  listRoles: () => clientFetch<ApiRolesResponse>("/api/admin/roles"),
  permissionCatalog: () => clientFetch<ApiPermissionCatalog>("/api/admin/permissions"),

  listMembers: (filters?: MemberFilters) =>
    clientFetch<MemberList>(`${M}${buildQuery(filters as QueryParams)}`),
  getMember: (memberId: string) => clientFetch<ApiMember>(`${M}/${memberId}`),
  updateMember: (memberId: string, body: UpdateMemberInput) =>
    clientFetch<ApiMember>(`${M}/${memberId}`, { method: "PATCH", body }),
  removeMember: (memberId: string) =>
    clientFetch<{ message: string }>(`${M}/${memberId}`, { method: "DELETE" }),

  listInvitations: (filters?: InvitationFilters) =>
    clientFetch<InvitationList>(`${I}${buildQuery(filters as QueryParams)}`),
  createInvitation: (body: CreateInvitationInput) =>
    clientFetch<ApiCreateInvitationResult>(I, { method: "POST", body }),
  revokeInvitation: (invitationId: string) =>
    clientFetch<{ message: string }>(`${I}/${invitationId}`, { method: "DELETE" }),
  acceptInvitation: (token: string) =>
    clientFetch<ApiAcceptInvitationResult>(`/api/company/invitations/accept`, {
      method: "POST",
      body: { token },
    }),
};
