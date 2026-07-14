import { formatCurrency, formatNumber } from "@/lib/format";
import type { AnalyticsKpi, ComparisonRow } from "@/types/analytics";

export const analyticsKpis: AnalyticsKpi[] = [
  { id: "revenue", label: "Receita", value: formatCurrency(1284900), delta: "+18,2%", trend: "up" },
  { id: "sales", label: "Vendas", value: formatNumber(428), delta: "+11,0%", trend: "up" },
  { id: "leads", label: "Leads", value: formatNumber(3240), delta: "+14,8%", trend: "up" },
  { id: "conversion", label: "Conversão", value: "6,8%", delta: "+0,9 pp", trend: "up" },
  { id: "cac", label: "CAC", value: formatCurrency(420), delta: "-5,1%", trend: "up" },
  { id: "ltv", label: "LTV", value: formatCurrency(8400), delta: "+6,2%", trend: "up" },
  { id: "roi", label: "ROI", value: "312%", delta: "+22 pp", trend: "up" },
  { id: "roas", label: "ROAS", value: "4,8x", delta: "+0,4x", trend: "up" },
  { id: "ticket", label: "Ticket médio", value: formatCurrency(4280), delta: "+3,2%", trend: "up" },
  { id: "cycle", label: "Ciclo médio", value: "18 dias", delta: "-2 dias", trend: "up" },
];

/** Série de receita (últimos 8 meses) para o gráfico. */
export const revenueSeries: { label: string; value: number }[] = [
  { label: "Dez", value: 82 },
  { label: "Jan", value: 88 },
  { label: "Fev", value: 96 },
  { label: "Mar", value: 104 },
  { label: "Abr", value: 118 },
  { label: "Mai", value: 126 },
  { label: "Jun", value: 138 },
  { label: "Jul", value: 152 },
];

function cmp(id: string, label: string, current: number, previous: number, valueLabel: string): ComparisonRow {
  return { id, label, current, previous, valueLabel };
}

export const byChannel: ComparisonRow[] = [
  cmp("google", "Google Ads", 512000, 448000, formatCurrency(512000)),
  cmp("meta", "Meta Ads", 468000, 420000, formatCurrency(468000)),
  cmp("instagram", "Instagram", 184000, 168000, formatCurrency(184000)),
  cmp("afiliado", "Afiliados", 128000, 112000, formatCurrency(128000)),
  cmp("email", "E-mail", 96000, 88000, formatCurrency(96000)),
  cmp("tiktok", "TikTok", 42000, 48000, formatCurrency(42000)),
];

export const byCampaign: ComparisonRow[] = [
  cmp("c1", "Black Week", 268000, 210000, formatCurrency(268000)),
  cmp("c2", "Sempre Ativo", 184000, 176000, formatCurrency(184000)),
  cmp("c3", "Lançamento anual", 156000, 120000, formatCurrency(156000)),
  cmp("c4", "Remarketing", 98000, 102000, formatCurrency(98000)),
  cmp("c5", "Webinar", 64000, 52000, formatCurrency(64000)),
];

export const byOwner: ComparisonRow[] = [
  cmp("o1", "Camila Ribeiro", 342000, 298000, formatCurrency(342000)),
  cmp("o2", "Rafael Monteiro", 298000, 276000, formatCurrency(298000)),
  cmp("o3", "Bruno Alcântara", 264000, 244000, formatCurrency(264000)),
  cmp("o4", "Larissa Prado", 218000, 232000, formatCurrency(218000)),
];
