"use client";

import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { companyApi } from "@/lib/api/company/client";
import { companyInvalidation, queryKeys } from "@/lib/query/keys";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useSession } from "@/providers/session-provider";
import type {
  CreateInvitationInput,
  InvitationFilters,
  MemberFilters,
  UpdateMemberInput,
} from "@/types/api/company";

/* ---------- Queries ---------- */

export function useTeamMembers(filters?: MemberFilters) {
  const { activeCompanyId, can } = useSession();
  return useQuery({
    queryKey: [...queryKeys.company.members(filters), activeCompanyId],
    queryFn: () => companyApi.listMembers(filters),
    enabled: Boolean(activeCompanyId) && can(PERMISSIONS.COMPANY_MEMBERS_READ),
    placeholderData: (prev) => prev,
  });
}

export function useTeamMember(memberId: string) {
  const { activeCompanyId, can } = useSession();
  return useQuery({
    queryKey: [...queryKeys.company.member(memberId), activeCompanyId],
    queryFn: () => companyApi.getMember(memberId),
    enabled:
      Boolean(activeCompanyId) && Boolean(memberId) && can(PERMISSIONS.COMPANY_MEMBERS_READ),
  });
}

/** Convites. A listagem reusa `company.members.read` — não há permissão própria. */
export function useInvitations(filters?: InvitationFilters) {
  const { activeCompanyId, can } = useSession();
  return useQuery({
    queryKey: [...queryKeys.company.invitations(filters), activeCompanyId],
    queryFn: () => companyApi.listInvitations(filters),
    enabled: Boolean(activeCompanyId) && can(PERMISSIONS.COMPANY_MEMBERS_READ),
    placeholderData: (prev) => prev,
  });
}

/* ---------- Mutations ---------- */

/**
 * Escopo: tudo abaixo de `company/*`. Nada de CRM ou integrações é tocado.
 * A sessão TAMBÉM é invalidada quando o próprio acesso pode ter mudado, porque
 * papel/permissões do usuário atual vêm de lá.
 */
function invalidateMembers(qc: QueryClient, memberId?: string) {
  qc.invalidateQueries({ queryKey: companyInvalidation.allMembers });
  if (memberId) qc.invalidateQueries({ queryKey: companyInvalidation.member(memberId) });
}

export function useUpdateMember(memberId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateMemberInput) => companyApi.updateMember(memberId, body),
    onSuccess: () => invalidateMembers(qc, memberId),
  });
}

export function useRemoveMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => companyApi.removeMember(memberId),
    onSuccess: (_result, memberId) => {
      qc.removeQueries({ queryKey: companyInvalidation.member(memberId) });
      qc.invalidateQueries({ queryKey: companyInvalidation.allMembers });
    },
  });
}

export function useCreateInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateInvitationInput) => companyApi.createInvitation(body),
    // criar convite muda a composição da lista de convites — e só dela: o
    // convidado só vira membro quando aceitar.
    onSuccess: () => qc.invalidateQueries({ queryKey: companyInvalidation.allInvitations }),
  });
}

export function useRevokeInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (invitationId: string) => companyApi.revokeInvitation(invitationId),
    onSuccess: () => qc.invalidateQueries({ queryKey: companyInvalidation.allInvitations }),
  });
}

/**
 * Aceitar convite: o usuário passa a ser membro de OUTRA empresa, então a
 * sessão (empresas + permissões) muda. Invalida sessão, membros e convites.
 */
export function useAcceptInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (token: string) => companyApi.acceptInvitation(token),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.session });
      qc.invalidateQueries({ queryKey: companyInvalidation.allMembers });
      qc.invalidateQueries({ queryKey: companyInvalidation.allInvitations });
    },
  });
}
