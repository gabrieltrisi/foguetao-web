import type { Invitation, InvitationStatus } from "@/types/admin";
import type { BadgeProps } from "@/components/ui/badge";

export const invitations: Invitation[] = [
  { id: "inv-1", email: "marcos@foguetao.com.br", role: "Viewer", status: "pending", sentAt: "11 jul 2026", expiresAt: "18 jul 2026", invitedBy: "Camila Ribeiro" },
  { id: "inv-2", email: "juliana@foguetao.com.br", role: "Comercial", status: "pending", sentAt: "10 jul 2026", expiresAt: "17 jul 2026", invitedBy: "Rafael Monteiro" },
  { id: "inv-3", email: "pedro@parceiro.com", role: "Marketing", status: "expired", sentAt: "20 jun 2026", expiresAt: "27 jun 2026", invitedBy: "Camila Ribeiro" },
  { id: "inv-4", email: "sofia@foguetao.com.br", role: "Suporte", status: "accepted", sentAt: "02 jun 2026", expiresAt: "09 jun 2026", invitedBy: "Rafael Monteiro" },
  { id: "inv-5", email: "andre@foguetao.com.br", role: "Financeiro", status: "accepted", sentAt: "28 mai 2026", expiresAt: "04 jun 2026", invitedBy: "Camila Ribeiro" },
];

export const invitationStatusLabel: Record<InvitationStatus, string> = {
  pending: "Pendente",
  expired: "Expirado",
  accepted: "Aceito",
};

export const invitationStatusTone: Record<InvitationStatus, NonNullable<BadgeProps["tone"]>> = {
  pending: "warning",
  expired: "neutral",
  accepted: "success",
};
