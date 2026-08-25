/**
 * MOCK DE PREVIEW - A integracao com Google Ads NAO existe no backend.
 *
 * Auditado na Sprint 1.4: nao ha model no Prisma, controller nem endpoint
 * para nenhum dominio de Marketing. As permissoes (campaigns.*, ads.*,
 * affiliates.*) existem no catalogo RBAC, mas sao ORFAS - permissao nao e
 * contrato. Estes dados sao apenas demonstracao e NADA e persistido.
 */
import type { AdAccount } from "@/types/marketing";
import { makeAdRows } from "@/mocks/marketing/ads-shared";

export const googleAccounts: AdAccount[] = [
  { id: "g-acc-1", name: "Foguetão · Search", platform: "google", externalId: "384-921-0475", status: "connected", spend: 39400, campaigns: 5, lastSync: "há 6 min" },
  { id: "g-acc-2", name: "Foguetão · Shopping", platform: "google", externalId: "556-210-8834", status: "error", spend: 12300, campaigns: 2, lastSync: "erro de token" },
];

export const googleCampaigns = makeAdRows("g-camp", [
  "Sempre Ativo — Search", "Google Shopping", "Performance Max", "Remarketing Display",
  "Search Marca", "YouTube Awareness",
]);

export const googleGroups = makeAdRows("g-group", [
  "CRM software", "Automação de vendas", "WhatsApp business", "Pipeline de vendas",
  "Ferramenta de marketing", "Gestão de leads",
]);

export const googleAds = makeAdRows("g-ad", [
  "RSA — Benefícios", "RSA — Preço", "RSA — Trial grátis", "Anúncio dinâmico",
  "Shopping — Plano Pro", "Display — Institucional",
]);

export const googleKeywords = [
  { id: "kw-1", keyword: "crm para vendas", match: "Frase", clicks: 842, impressions: 21400, ctr: 3.9, cpc: 4.2, conversions: 38 },
  { id: "kw-2", keyword: "automação whatsapp", match: "Ampla", clicks: 612, impressions: 18300, ctr: 3.3, cpc: 3.8, conversions: 24 },
  { id: "kw-3", keyword: "pipeline de vendas", match: "Exata", clicks: 431, impressions: 9800, ctr: 4.4, cpc: 5.1, conversions: 19 },
  { id: "kw-4", keyword: "software de crm", match: "Frase", clicks: 388, impressions: 12600, ctr: 3.1, cpc: 4.6, conversions: 15 },
  { id: "kw-5", keyword: "gestão de leads", match: "Ampla", clicks: 276, impressions: 8100, ctr: 3.4, cpc: 3.2, conversions: 11 },
];

export const googleConversions = [
  { id: "cv-1", name: "Cadastro trial", count: 428, value: 0 },
  { id: "cv-2", name: "Compra plano", count: 96, value: 288000 },
  { id: "cv-3", name: "Lead qualificado", count: 312, value: 0 },
  { id: "cv-4", name: "Agendamento demo", count: 148, value: 0 },
];
