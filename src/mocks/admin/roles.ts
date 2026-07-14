import type { Role } from "@/types/admin";

export const roles: Role[] = [
  { id: "owner", name: "Owner", description: "Controle total da conta, cobrança e exclusão da organização.", members: 1, tone: "brand", system: true },
  { id: "admin", name: "Admin", description: "Administra usuários, integrações e configurações da plataforma.", members: 2, tone: "danger", system: true },
  { id: "manager", name: "Manager", description: "Gerencia equipes, pipelines e metas comerciais.", members: 3, tone: "warning" },
  { id: "marketing", name: "Marketing", description: "Acesso a campanhas, automações e analytics de marketing.", members: 4, tone: "info" },
  { id: "comercial", name: "Comercial", description: "Trabalha CRM, oportunidades e atendimento de vendas.", members: 6, tone: "success" },
  { id: "financeiro", name: "Financeiro", description: "Acesso a cobrança, faturas e relatórios financeiros.", members: 2, tone: "neutral" },
  { id: "suporte", name: "Suporte", description: "Atende conversas e tickets, sem acesso a cobrança.", members: 3, tone: "info" },
  { id: "viewer", name: "Viewer", description: "Somente leitura em relatórios e dashboards.", members: 3, tone: "neutral" },
];
