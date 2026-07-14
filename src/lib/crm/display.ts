import type { BadgeProps } from "@/components/ui/badge";
import type { ContactStatusApi, ContactSourceApi, OrganizationSizeApi } from "@/types/api/crm";

/** Rótulos/tons de status do contato (API → pt-BR), preservando a paleta da UI. */
export const contactStatusMeta: Record<
  ContactStatusApi,
  { label: string; tone: NonNullable<BadgeProps["tone"]> }
> = {
  LEAD: { label: "Lead", tone: "info" },
  ACTIVE: { label: "Ativo", tone: "success" },
  CUSTOMER: { label: "Cliente", tone: "brand" },
  INACTIVE: { label: "Inativo", tone: "neutral" },
  BLOCKED: { label: "Bloqueado", tone: "danger" },
  ARCHIVED: { label: "Arquivado", tone: "warning" },
};

export const contactStatusOptions = [
  { value: "", label: "Todos os status" },
  { value: "LEAD", label: "Lead" },
  { value: "ACTIVE", label: "Ativo" },
  { value: "CUSTOMER", label: "Cliente" },
  { value: "INACTIVE", label: "Inativo" },
  { value: "BLOCKED", label: "Bloqueado" },
  { value: "ARCHIVED", label: "Arquivado" },
];

export const contactSourceLabel: Record<ContactSourceApi, string> = {
  MANUAL: "Manual",
  IMPORT: "Importação",
  WHATSAPP: "WhatsApp",
  META_ADS: "Meta Ads",
  GOOGLE_ADS: "Google Ads",
  AFFILIATE: "Afiliado",
  LANDING_PAGE: "Landing Page",
  API: "API",
  OTHER: "Outro",
};

export const organizationSizeLabel: Record<OrganizationSizeApi, string> = {
  SOLO: "Individual",
  MICRO: "Micro",
  SMALL: "Pequena",
  MEDIUM: "Média",
  LARGE: "Grande",
  ENTERPRISE: "Enterprise",
};

/** Tipos de atividade oferecidos no registro manual (subset amigável). */
export const activityTypeOptions = [
  { value: "UPDATED", label: "Atualização" },
  { value: "ASSIGNED", label: "Atribuição" },
  { value: "STATUS_CHANGED", label: "Mudança de status" },
  { value: "NOTE_CREATED", label: "Anotação" },
];

export const activityTypeLabel: Record<string, string> = {
  CREATED: "Contato criado",
  UPDATED: "Atualização",
  NOTE_CREATED: "Nota criada",
  NOTE_UPDATED: "Nota editada",
  NOTE_DELETED: "Nota removida",
  TAG_ADDED: "Tag adicionada",
  TAG_REMOVED: "Tag removida",
  ASSIGNED: "Atribuição",
  STATUS_CHANGED: "Status alterado",
  CUSTOM_FIELD_UPDATED: "Campo personalizado",
  IMPORTED: "Importado",
  ARCHIVED: "Arquivado",
  RESTORED: "Restaurado",
};

/** Formata uma data ISO em pt-BR curto (sem libs). */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}
