/**
 * MOCK DE PREVIEW - Campanhas NAO existe no backend.
 *
 * Auditado na Sprint 1.4: nao ha model no Prisma, controller nem endpoint
 * para nenhum dominio de Marketing. As permissoes (campaigns.*, ads.*,
 * affiliates.*) existem no catalogo RBAC, mas sao ORFAS - permissao nao e
 * contrato. Estes dados sao apenas demonstracao e NADA e persistido.
 */
import type { Campaign, CampaignObjective, CampaignStatus, MarketingChannel } from "@/types/marketing";

const CHANNELS: MarketingChannel[] = ["meta", "google", "tiktok", "instagram", "email", "afiliado"];
const OBJECTIVES: CampaignObjective[] = ["conversao", "trafego", "leads", "vendas", "reconhecimento"];
const STATUSES: CampaignStatus[] = ["ativa", "ativa", "pausada", "encerrada", "rascunho"];

const NAMES = [
  "Black Week — Conversão", "Sempre Ativo — Search", "Awareness Reels", "Remarketing Carrinho",
  "Lançamento Plano Anual", "Leads Enterprise", "Promo Frete Grátis", "Institucional Marca",
  "Retargeting Site", "Captação Webinar", "Campanha Afiliados Q3", "E-mail Nutrição",
  "TikTok Criadores", "Google Shopping",
];

export const campaigns: Campaign[] = NAMES.map((name, i) => {
  const spent = 4200 + (i % 9) * 3100;
  const leads = 40 + (i % 12) * 18;
  const revenue = spent * (2 + (i % 5) * 0.6);
  return {
    id: `camp-${i + 1}`,
    name,
    channel: CHANNELS[i % CHANNELS.length],
    objective: OBJECTIVES[i % OBJECTIVES.length],
    status: STATUSES[i % STATUSES.length],
    budget: 6000 + (i % 6) * 2000,
    spent,
    leads,
    cpl: Math.round((spent / leads) * 100) / 100,
    conversions: Math.round(leads * (0.2 + (i % 4) * 0.05)),
    revenue: Math.round(revenue),
    roas: Math.round((revenue / spent) * 10) / 10,
    startDate: `${(i % 27) + 1} jul 2026`,
    endDate: `${(i % 27) + 1} ago 2026`,
  };
});

export const campaignStatusLabel: Record<CampaignStatus, string> = {
  ativa: "Ativa",
  pausada: "Pausada",
  encerrada: "Encerrada",
  rascunho: "Rascunho",
};

export const campaignStatusTone: Record<CampaignStatus, "success" | "warning" | "neutral" | "info"> = {
  ativa: "success",
  pausada: "warning",
  encerrada: "neutral",
  rascunho: "info",
};

export const objectiveLabel: Record<CampaignObjective, string> = {
  conversao: "Conversão",
  trafego: "Tráfego",
  reconhecimento: "Reconhecimento",
  leads: "Leads",
  vendas: "Vendas",
};

export function getCampaignById(id: string): Campaign | undefined {
  return campaigns.find((c) => c.id === id);
}
