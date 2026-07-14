import type { TeamMember, MemberStatus } from "@/types/admin";
import type { BadgeProps } from "@/components/ui/badge";

export const teamMembers: TeamMember[] = [
  { id: "usr-1", name: "Camila Ribeiro", email: "camila@foguetao.com.br", role: "Owner", company: "Matriz SP", lastAccess: "Agora há pouco", status: "active", twoFactor: true },
  { id: "usr-2", name: "Rafael Monteiro", email: "rafael@foguetao.com.br", role: "Admin", company: "Matriz SP", lastAccess: "Há 12 min", status: "active", twoFactor: true },
  { id: "usr-3", name: "Bruno Alcântara", email: "bruno@foguetao.com.br", role: "Marketing", company: "Matriz SP", lastAccess: "Há 1 h", status: "active", twoFactor: false },
  { id: "usr-4", name: "Larissa Prado", email: "larissa@foguetao.com.br", role: "Comercial", company: "Filial RJ", lastAccess: "Ontem, 18:40", status: "active", twoFactor: true },
  { id: "usr-5", name: "Diego Fontes", email: "diego@foguetao.com.br", role: "Financeiro", company: "Matriz SP", lastAccess: "Há 3 dias", status: "active", twoFactor: false },
  { id: "usr-6", name: "Aline Souza", email: "aline@foguetao.com.br", role: "Suporte", company: "Filial RJ", lastAccess: "Há 2 h", status: "active", twoFactor: true },
  { id: "usr-7", name: "Marcos Vieira", email: "marcos@foguetao.com.br", role: "Viewer", company: "Matriz SP", lastAccess: "Convite pendente", status: "invited", twoFactor: false },
  { id: "usr-8", name: "Tânia Lopes", email: "tania@foguetao.com.br", role: "Manager", company: "Filial RJ", lastAccess: "Há 15 dias", status: "suspended", twoFactor: false },
];

export const memberStatusLabel: Record<MemberStatus, string> = {
  active: "Ativo",
  invited: "Convidado",
  suspended: "Suspenso",
};

export const memberStatusTone: Record<MemberStatus, NonNullable<BadgeProps["tone"]>> = {
  active: "success",
  invited: "info",
  suspended: "neutral",
};

export function getMemberById(id: string): TeamMember | undefined {
  return teamMembers.find((m) => m.id === id);
}
