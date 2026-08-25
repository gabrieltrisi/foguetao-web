/**
 * MOCK DE PREVIEW - As integracoes de anuncios NAO existe no backend.
 *
 * Auditado na Sprint 1.4: nao ha model no Prisma, controller nem endpoint
 * para nenhum dominio de Marketing. As permissoes (campaigns.*, ads.*,
 * affiliates.*) existem no catalogo RBAC, mas sao ORFAS - permissao nao e
 * contrato. Estes dados sao apenas demonstracao e NADA e persistido.
 */
import type { AdRow, CampaignStatus } from "@/types/marketing";

const STATUSES: CampaignStatus[] = ["ativa", "ativa", "pausada", "encerrada"];

/** Gera linhas de anúncio determinísticas com métricas coerentes. */
export function makeAdRows(prefix: string, names: string[]): AdRow[] {
  return names.map((name, i) => {
    const spend = 1800 + (i % 8) * 1450;
    const impressions = 24000 + (i % 10) * 18500;
    const clicks = Math.round(impressions * (0.012 + (i % 5) * 0.004));
    const ctr = Math.round((clicks / impressions) * 1000) / 10;
    const cpc = Math.round((spend / clicks) * 100) / 100;
    return {
      id: `${prefix}-${i + 1}`,
      name,
      status: STATUSES[i % STATUSES.length],
      spend,
      impressions,
      clicks,
      ctr,
      cpc,
      conversions: Math.round(clicks * (0.03 + (i % 4) * 0.015)),
    };
  });
}
