import type { Company, CurrentUser } from "@/types";

/** Usuário autenticado (mock). */
export const currentUser: CurrentUser = {
  name: "Camila Ribeiro",
  email: "camila@foguetao.com.br",
  initials: "CR",
};

/** Workspaces / empresas disponíveis no seletor (mock). */
export const companies: Company[] = [
  { id: "matriz-sp", name: "Foguetão · Matriz SP", plan: "Performance" },
  { id: "filial-rj", name: "Foguetão · Filial RJ", plan: "Pro" },
  { id: "labs", name: "Foguetão Labs", plan: "Beta" },
];

export const defaultCompanyId = companies[0].id;

/** Credenciais mockadas aceitas na tela de login (apenas navegação visual). */
export const mockCredentials = {
  email: "camila@foguetao.com.br",
  password: "foguetao123",
} as const;
