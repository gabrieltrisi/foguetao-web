import { formatCurrency, formatNumber } from "@/lib/format";
import type { ChannelPerformance, MarketingChannel, PerformanceMetric } from "@/types/marketing";
import type { Trend } from "@/types";

export const performanceMetrics: PerformanceMetric[] = [
  { id: "invest", label: "Investimento", value: formatCurrency(128400), delta: "+8,2%", trend: "up" },
  { id: "impr", label: "Impressões", value: formatNumber(2840000), delta: "+12,4%", trend: "up" },
  { id: "clicks", label: "Cliques", value: formatNumber(64200), delta: "+9,1%", trend: "up" },
  { id: "ctr", label: "CTR", value: "2,26%", delta: "+0,3 pp", trend: "up" },
  { id: "cpc", label: "CPC", value: "R$ 2,00", delta: "-4,1%", trend: "up" },
  { id: "cpm", label: "CPM", value: "R$ 45,20", delta: "-2,0%", trend: "up" },
  { id: "leads", label: "Leads", value: formatNumber(3240), delta: "+14,8%", trend: "up" },
  { id: "cpl", label: "CPL", value: "R$ 39,60", delta: "-6,2%", trend: "up" },
  { id: "sales", label: "Vendas", value: formatNumber(428), delta: "+11,0%", trend: "up" },
  { id: "cpa", label: "CPA", value: "R$ 300,00", delta: "-3,4%", trend: "up" },
  { id: "revenue", label: "Receita", value: formatCurrency(1284900), delta: "+18,2%", trend: "up" },
  { id: "roas", label: "ROAS", value: "4,8x", delta: "+0,4x", trend: "up" },
  { id: "roi", label: "ROI", value: "312%", delta: "+22 pp", trend: "up" },
  { id: "cac", label: "CAC", value: "R$ 420,00", delta: "-5,1%", trend: "up" },
  { id: "ticket", label: "Ticket médio", value: formatCurrency(4280), delta: "+3,2%", trend: "up" },
];

export const channelPerformance: ChannelPerformance[] = [
  { channel: "google", spend: 39400, leads: 1120, revenue: 512000, roas: 5.2 },
  { channel: "meta", spend: 48200, leads: 986, revenue: 468000, roas: 4.6 },
  { channel: "instagram", spend: 18600, leads: 428, revenue: 184000, roas: 4.1 },
  { channel: "tiktok", spend: 8600, leads: 142, revenue: 42000, roas: 2.4 },
  { channel: "afiliado", spend: 8200, leads: 214, revenue: 128000, roas: 6.1 },
  { channel: "email", spend: 4200, leads: 350, revenue: 96000, roas: 8.4 },
];

/** Série mensal (últimos 8 meses) para o gráfico mock de investimento x receita. */
export const monthlySeries: { label: string; invest: number; revenue: number }[] = [
  { label: "Dez", invest: 82, revenue: 340 },
  { label: "Jan", invest: 88, revenue: 372 },
  { label: "Fev", invest: 95, revenue: 410 },
  { label: "Mar", invest: 102, revenue: 448 },
  { label: "Abr", invest: 110, revenue: 512 },
  { label: "Mai", invest: 118, revenue: 560 },
  { label: "Jun", invest: 124, revenue: 610 },
  { label: "Jul", invest: 128, revenue: 685 },
];

export const channelLabels: Record<MarketingChannel, string> = {
  meta: "Meta Ads",
  google: "Google Ads",
  tiktok: "TikTok Ads",
  instagram: "Instagram",
  whatsapp: "WhatsApp",
  email: "E-mail",
  organico: "Orgânico",
  direto: "Direto",
  indicacao: "Indicação",
  landing: "Landing",
  afiliado: "Afiliado",
};

export function trendFromDelta(delta: string): Trend {
  if (delta.startsWith("-")) return "down";
  if (delta.startsWith("+")) return "up";
  return "flat";
}
