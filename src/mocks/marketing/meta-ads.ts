/**
 * MOCK DE PREVIEW - A integracao com Meta Ads NAO existe no backend.
 *
 * Auditado na Sprint 1.4: nao ha model no Prisma, controller nem endpoint
 * para nenhum dominio de Marketing. As permissoes (campaigns.*, ads.*,
 * affiliates.*) existem no catalogo RBAC, mas sao ORFAS - permissao nao e
 * contrato. Estes dados sao apenas demonstracao e NADA e persistido.
 */
import type { AdAccount } from "@/types/marketing";
import { makeAdRows } from "@/mocks/marketing/ads-shared";

export const metaAccounts: AdAccount[] = [
  { id: "meta-acc-1", name: "Foguetão · Matriz SP", platform: "meta", externalId: "act_1029384756", status: "connected", spend: 48200, campaigns: 6, lastSync: "há 4 min" },
  { id: "meta-acc-2", name: "Foguetão · Performance", platform: "meta", externalId: "act_5647382910", status: "syncing", spend: 21800, campaigns: 3, lastSync: "sincronizando…" },
];

export const metaCampaigns = makeAdRows("meta-camp", [
  "Black Week — Conversão", "Remarketing Carrinho", "Awareness Reels", "Leads Enterprise",
  "Institucional Marca", "Retargeting Site",
]);

export const metaAdSets = makeAdRows("meta-set", [
  "Lookalike 1% — BR", "Interesses SaaS", "Retargeting 30d", "Público site 7d",
  "Engajamento Instagram", "Compradores 180d",
]);

export const metaAds = makeAdRows("meta-ad", [
  "Vídeo depoimento", "Carrossel benefícios", "Story CTA", "Imagem oferta",
  "Reels bastidores", "Coleção produtos",
]);

export const metaPages = [
  { id: "pg-1", name: "Foguetão", type: "facebook" as const, followers: "48,2 mil", connected: true },
  { id: "pg-2", name: "@foguetao", type: "instagram" as const, followers: "72,5 mil", connected: true },
  { id: "pg-3", name: "Foguetão Labs", type: "facebook" as const, followers: "8,1 mil", connected: false },
];

export const metaPixel = {
  name: "Pixel Foguetão",
  id: "1029384756",
  status: "active" as const,
  eventsToday: 12840,
  lastEvent: "há 12 s",
};
