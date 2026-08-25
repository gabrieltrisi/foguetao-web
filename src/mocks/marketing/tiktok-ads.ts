/**
 * MOCK DE PREVIEW - A integracao com TikTok Ads NAO existe no backend.
 *
 * Auditado na Sprint 1.4: nao ha model no Prisma, controller nem endpoint
 * para nenhum dominio de Marketing. As permissoes (campaigns.*, ads.*,
 * affiliates.*) existem no catalogo RBAC, mas sao ORFAS - permissao nao e
 * contrato. Estes dados sao apenas demonstracao e NADA e persistido.
 */
import type { AdAccount } from "@/types/marketing";
import { makeAdRows } from "@/mocks/marketing/ads-shared";

export const tiktokAccounts: AdAccount[] = [
  { id: "tt-acc-1", name: "Foguetão · TikTok", platform: "tiktok", externalId: "tt_7382910475", status: "connected", spend: 8600, campaigns: 2, lastSync: "há 20 min" },
];

export const tiktokCampaigns = makeAdRows("tt-camp", [
  "TikTok Criadores", "Spark Ads — Depoimentos", "Awareness Gen Z", "Conversão App",
]);
