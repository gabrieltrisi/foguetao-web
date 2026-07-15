"use client";

import { clientFetch } from "@/lib/api/client";
import { buildQuery, type QueryParams } from "@/lib/api/query-string";
import type {
  ApiAcceptInvitationResult,
  ApiCreateInvitationResult,
  ApiMember,
  CreateInvitationInput,
  InvitationFilters,
  InvitationList,
  MemberFilters,
  MemberList,
  UpdateMemberInput,
} from "@/types/api/company";

const M = "/api/company/members";
const I = "/api/company/invitations";

/** Membros e convites (browser → BFF). Nunca fala com o backend direto. */
export const companyApi = {
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
