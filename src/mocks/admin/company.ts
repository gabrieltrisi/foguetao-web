import type { Company, CompanyKpi, CompanyStatus } from "@/types/admin";
import type { BadgeProps } from "@/components/ui/badge";

export const company: Company = {
  id: "org-1",
  name: "Foguetão · Matriz SP",
  legalName: "Foguetão Tecnologia e Marketing Ltda.",
  document: "42.881.630/0001-07",
  phone: "+55 11 4003-2001",
  email: "contato@foguetao.com.br",
  site: "https://foguetao.com.br",
  timezone: "America/Sao_Paulo (GMT-3)",
  language: "Português (Brasil)",
  currency: "Real (BRL)",
  segment: "Agência de Marketing",
  status: "active",
  plan: "Pro",
};

export const companyStatusLabel: Record<CompanyStatus, string> = {
  active: "Ativa",
  trial: "Em teste",
  suspended: "Suspensa",
};

export const companyStatusTone: Record<CompanyStatus, NonNullable<BadgeProps["tone"]>> = {
  active: "success",
  trial: "info",
  suspended: "danger",
};

export const companyKpis: CompanyKpi[] = [
  { label: "Usuários", value: "24" },
  { label: "Contatos", value: "12.482" },
  { label: "Campanhas", value: "86" },
  { label: "Mensagens", value: "148.902" },
  { label: "Automações", value: "37" },
];
