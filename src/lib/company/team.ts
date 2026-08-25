import type { BadgeProps } from "@/components/ui/badge";
import { isApiError } from "@/types/api/error";
import type {
  ApiInvitation,
  ApiMember,
  CompanyRole,
  MembershipStatus,
} from "@/types/api/company";

type Tone = NonNullable<BadgeProps["tone"]>;

export const roleLabel: Record<CompanyRole, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  MANAGER: "Manager",
  MARKETING: "Marketing",
  COMMERCIAL: "Comercial",
  SUPPORT: "Suporte",
  FINANCIAL: "Financeiro",
  AFFILIATE: "Afiliado",
  VIEWER: "Viewer",
};

export const memberStatusMeta: Record<MembershipStatus, { label: string; tone: Tone }> = {
  ACTIVE: { label: "Ativo", tone: "success" },
  INVITED: { label: "Convidado", tone: "info" },
  SUSPENDED: { label: "Suspenso", tone: "warning" },
  REMOVED: { label: "Removido", tone: "neutral" },
};

/* ---------- Hierarquia (espelho de authz/role-permissions.ts) ---------- */

/**
 * Ranks IDÊNTICOS ao backend. Isto NÃO é a autoridade — serve só para a UI não
 * oferecer uma ação que o backend recusaria. O backend revalida tudo.
 */
export const ROLE_RANK: Record<CompanyRole, number> = {
  OWNER: 100,
  ADMIN: 80,
  MANAGER: 60,
  MARKETING: 40,
  COMMERCIAL: 40,
  SUPPORT: 40,
  FINANCIAL: 40,
  VIEWER: 20,
  AFFILIATE: 10,
};

/** Papéis ordenados do maior para o menor privilégio (para seletores). */
export const ROLES_BY_RANK: CompanyRole[] = (
  Object.keys(ROLE_RANK) as CompanyRole[]
).sort((a, b) => ROLE_RANK[b] - ROLE_RANK[a]);

/**
 * `canManageTargetRole` do backend, ao pé da letra:
 *  - OWNER gerencia qualquer um (inclusive outro OWNER);
 *  - ninguém além de OWNER gerencia um OWNER;
 *  - caso contrário exige rank ESTRITAMENTE maior (ADMIN não gerencia ADMIN).
 */
export function canManageTargetRole(actorRole: CompanyRole, targetRole: CompanyRole): boolean {
  if (actorRole === "OWNER") return true;
  if (targetRole === "OWNER") return false;
  return ROLE_RANK[actorRole] > ROLE_RANK[targetRole];
}

/** Somente OWNER concede OWNER. */
export function canAssignRole(actorRole: CompanyRole, newRole: CompanyRole): boolean {
  return newRole !== "OWNER" || actorRole === "OWNER";
}

/** Papéis que o ator pode conceder a um alvo. */
export function assignableRoles(actorRole: CompanyRole): CompanyRole[] {
  return ROLES_BY_RANK.filter((r) => canAssignRole(actorRole, r));
}

/**
 * Último OWNER ativo: o backend recusa rebaixar, suspender ou remover.
 * A contagem usa a página carregada — é uma dica de UI, não a verdade; o
 * backend decide (409 LAST_OWNER_REQUIRED).
 */
export function isLastActiveOwner(member: ApiMember, all: readonly ApiMember[]): boolean {
  if (member.role !== "OWNER" || member.status !== "ACTIVE") return false;
  return all.filter((m) => m.role === "OWNER" && m.status === "ACTIVE").length <= 1;
}

/** Ações possíveis sobre um membro, já considerando papel, hierarquia e self. */
export function memberAbilities(params: {
  actorRole: CompanyRole;
  actorUserId: string;
  target: ApiMember;
  canUpdate: boolean;
  canRemove: boolean;
  members: readonly ApiMember[];
}): {
  isSelf: boolean;
  isLastOwner: boolean;
  canChangeRole: boolean;
  canSuspend: boolean;
  canReactivate: boolean;
  canRemove: boolean;
  /** Motivo pelo qual nada pode ser feito (para a UI explicar, não travar mudo). */
  blockedReason: string | null;
} {
  const { actorRole, actorUserId, target, canUpdate, canRemove, members } = params;
  const isSelf = target.userId === actorUserId;
  const isLastOwner = isLastActiveOwner(target, members);
  const manageable = canManageTargetRole(actorRole, target.role);

  // O backend recusa qualquer alteração no próprio membership (403) e a
  // auto-remoção (400, "use /leave").
  const base = !isSelf && manageable;

  let blockedReason: string | null = null;
  if (isSelf) blockedReason = "Você não pode alterar o seu próprio acesso.";
  else if (!manageable)
    blockedReason = "Você não pode gerenciar um membro com privilégio igual ou superior.";
  else if (isLastOwner) blockedReason = "A empresa precisa manter ao menos um OWNER ativo.";

  return {
    isSelf,
    isLastOwner,
    canChangeRole: base && canUpdate && !isLastOwner,
    canSuspend: base && canUpdate && target.status === "ACTIVE" && !isLastOwner,
    canReactivate: base && canUpdate && target.status === "SUSPENDED",
    canRemove: base && canRemove && !isLastOwner,
    blockedReason,
  };
}

/* ---------- Convites: status derivado ---------- */

export type InvitationStatus = "PENDING" | "ACCEPTED" | "REVOKED" | "EXPIRED";

export const invitationStatusMeta: Record<InvitationStatus, { label: string; tone: Tone }> = {
  PENDING: { label: "Pendente", tone: "warning" },
  ACCEPTED: { label: "Aceito", tone: "success" },
  REVOKED: { label: "Revogado", tone: "neutral" },
  EXPIRED: { label: "Expirado", tone: "neutral" },
};

/**
 * O backend não guarda status de convite: ele é derivado. A ordem importa —
 * um convite aceito continua aceito mesmo depois de `expiresAt` passar.
 */
export function invitationStatus(
  invitation: Pick<ApiInvitation, "acceptedAt" | "revokedAt" | "expiresAt">,
  now: Date = new Date(),
): InvitationStatus {
  if (invitation.acceptedAt) return "ACCEPTED";
  if (invitation.revokedAt) return "REVOKED";
  if (new Date(invitation.expiresAt).getTime() <= now.getTime()) return "EXPIRED";
  return "PENDING";
}

/** Só convite pendente pode ser revogado (aceito → 409; revogado → no-op). */
export function isRevocable(invitation: ApiInvitation, now: Date = new Date()): boolean {
  return invitationStatus(invitation, now) === "PENDING";
}

/* ---------- Formatação ---------- */

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ---------- Erros reais destes fluxos ---------- */

export function messageForTeamError(error: unknown): string {
  if (isApiError(error)) {
    switch (error.code) {
      case "LAST_OWNER_REQUIRED":
        return "A empresa deve manter ao menos um OWNER ativo.";
      case "OWNER_ROLE_RESTRICTED":
        // O backend reusa este código para "só OWNER concede OWNER" E para
        // "não altere o próprio membership". A mensagem dele distingue.
        return error.message || "Apenas OWNER pode conceder o papel OWNER.";
      case "INSUFFICIENT_ROLE":
        return "Você não pode gerenciar um membro com privilégio igual ou superior.";
      case "INSUFFICIENT_PERMISSION":
        return "Você não tem permissão para esta ação.";
      case "MEMBERSHIP_NOT_FOUND":
        return "Membro não encontrado.";
      case "MEMBERSHIP_ALREADY_EXISTS":
        return "Este e-mail já é membro ativo da empresa.";
      case "INVITATION_NOT_FOUND":
        return "Convite não encontrado.";
      case "INVITATION_ALREADY_USED":
        return "Este convite já foi aceito.";
      case "INVITATION_REVOKED":
        return "Este convite foi revogado.";
      case "INVITATION_EXPIRED":
        return "Este convite expirou.";
      case "INVITATION_EMAIL_MISMATCH":
        return "O convite pertence a outro e-mail.";
      case "COMPANY_NOT_FOUND":
        return "Empresa não encontrada.";
      case "COMPANY_ACCESS_DENIED":
        return "Você não tem acesso a esta empresa.";
      case "COMPANY_INACTIVE":
        return "Esta empresa está inativa.";
      case "TOO_MANY_REQUESTS":
        return "Muitas tentativas. Aguarde um instante e tente novamente.";
      case "VALIDATION_ERROR":
        return "Verifique os campos e tente novamente.";
      default:
        if (error.isForbidden) return "Você não tem permissão para esta ação.";
        if (error.isUnavailable) return "Servidor indisponível. Tente novamente em instantes.";
        return error.message;
    }
  }
  return "Não foi possível concluir a ação.";
}
