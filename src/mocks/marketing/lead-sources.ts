/**
 * MOCK DE PREVIEW - Origens de lead NAO existe no backend.
 *
 * Auditado na Sprint 1.4: nao ha model no Prisma, controller nem endpoint
 * para nenhum dominio de Marketing. As permissoes (campaigns.*, ads.*,
 * affiliates.*) existem no catalogo RBAC, mas sao ORFAS - permissao nao e
 * contrato. Estes dados sao apenas demonstracao e NADA e persistido.
 */
import type { LeadSource, MarketingChannel } from "@/types/marketing";
import type { Trend } from "@/types";

const RAW: { name: string; channel: MarketingChannel; leads: number; conv: number; cpl: number; rev: number; trend: Trend; delta: string }[] = [
  { name: "Instagram", channel: "instagram", leads: 428, conv: 6.2, cpl: 18.4, rev: 184000, trend: "up", delta: "+12%" },
  { name: "Facebook", channel: "meta", leads: 386, conv: 5.4, cpl: 21.1, rev: 162000, trend: "up", delta: "+8%" },
  { name: "Google", channel: "google", leads: 512, conv: 7.8, cpl: 16.2, rev: 268000, trend: "up", delta: "+15%" },
  { name: "TikTok", channel: "tiktok", leads: 142, conv: 3.1, cpl: 24.8, rev: 42000, trend: "down", delta: "-4%" },
  { name: "WhatsApp", channel: "whatsapp", leads: 298, conv: 9.2, cpl: 9.4, rev: 148000, trend: "up", delta: "+22%" },
  { name: "Orgânico", channel: "organico", leads: 264, conv: 4.8, cpl: 0, rev: 96000, trend: "up", delta: "+6%" },
  { name: "Direto", channel: "direto", leads: 188, conv: 5.1, cpl: 0, rev: 74000, trend: "flat", delta: "0%" },
  { name: "Indicação", channel: "indicacao", leads: 132, conv: 11.4, cpl: 0, rev: 118000, trend: "up", delta: "+18%" },
  { name: "Landing", channel: "landing", leads: 356, conv: 8.6, cpl: 12.1, rev: 142000, trend: "up", delta: "+9%" },
  { name: "Afiliado", channel: "afiliado", leads: 214, conv: 6.9, cpl: 14.7, rev: 128000, trend: "up", delta: "+11%" },
];

export const leadSources: LeadSource[] = RAW.map((r, i) => ({
  id: `src-${i + 1}`,
  name: r.name,
  channel: r.channel,
  leads: r.leads,
  conversion: r.conv,
  cpl: r.cpl,
  revenue: r.rev,
  trend: r.trend,
  delta: r.delta,
}));
