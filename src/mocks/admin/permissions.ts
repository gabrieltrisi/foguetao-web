import type { PermissionModule, PermissionAction } from "@/types/admin";

export const permissionActions: { key: PermissionAction; label: string }[] = [
  { key: "view", label: "Visualizar" },
  { key: "create", label: "Criar" },
  { key: "edit", label: "Editar" },
  { key: "delete", label: "Excluir" },
  { key: "export", label: "Exportar" },
  { key: "manage", label: "Administrar" },
];

const all = { view: true, create: true, edit: true, delete: true, export: true, manage: true };
const readOnly = { view: true, create: false, edit: false, delete: false, export: true, manage: false };
const editor = { view: true, create: true, edit: true, delete: false, export: true, manage: false };

/** Matriz de permissões padrão para o papel Manager (mock editável na UI). */
export const permissionMatrix: PermissionModule[] = [
  { key: "crm", label: "CRM", actions: { ...all } },
  { key: "marketing", label: "Marketing", actions: { ...editor } },
  { key: "communication", label: "Comunicação", actions: { ...editor } },
  { key: "automations", label: "Automações", actions: { ...editor } },
  { key: "analytics", label: "Analytics", actions: { ...readOnly } },
  { key: "admin", label: "Administração", actions: { view: true, create: false, edit: false, delete: false, export: false, manage: false } },
  { key: "integrations", label: "Integrações", actions: { view: true, create: false, edit: true, delete: false, export: false, manage: false } },
  { key: "billing", label: "Billing", actions: { view: true, create: false, edit: false, delete: false, export: true, manage: false } },
];
