import type { Affiliate, AffiliateStatus, Commission, CommissionStatus } from "@/types/marketing";

const TIERS: Affiliate["tier"][] = ["Diamante", "Ouro", "Ouro", "Prata", "Prata", "Bronze", "Bronze", "Bronze"];
const STATUSES: AffiliateStatus[] = ["active", "active", "active", "pending", "active", "blocked"];

const NAMES = [
  "Growth Partners", "Ana Marketing", "Digital Hub", "Pedro Vendas",
  "Agência Órbita", "Marina Ads", "Studio Lançamento", "Rafael Afiliado",
];

export const affiliates: Affiliate[] = NAMES.map((name, i) => {
  const sales = 48 - i * 5;
  const clicks = 4200 - i * 420;
  const leads = Math.round(clicks * (0.08 + (i % 3) * 0.02));
  const revenue = sales * 4200;
  return {
    id: `aff-${i + 1}`,
    name,
    code: name.split(" ")[0].toUpperCase() + (10 + i),
    tier: TIERS[i % TIERS.length],
    clicks,
    leads,
    sales,
    conversion: Math.round((leads > 0 ? (sales / leads) * 100 : 0) * 10) / 10,
    revenue,
    commission: Math.round(revenue * 0.15),
    status: STATUSES[i % STATUSES.length],
  };
}).sort((a, b) => b.revenue - a.revenue);

export const affiliateStatusLabel: Record<AffiliateStatus, string> = {
  active: "Ativo",
  pending: "Pendente",
  blocked: "Bloqueado",
};

export const affiliateStatusTone: Record<AffiliateStatus, "success" | "warning" | "danger"> = {
  active: "success",
  pending: "warning",
  blocked: "danger",
};

const COMMISSION_STATUSES: CommissionStatus[] = ["paid", "approved", "pending", "paid", "rejected", "approved"];

export const commissions: Commission[] = Array.from({ length: 12 }).map((_, i) => {
  const saleValue = 4200 + (i % 6) * 1800;
  return {
    id: `comm-${i + 1}`,
    affiliate: NAMES[i % NAMES.length],
    saleValue,
    amount: Math.round(saleValue * 0.15),
    status: COMMISSION_STATUSES[i % COMMISSION_STATUSES.length],
    date: `${(i % 27) + 1} jul 2026`,
  };
});

export const commissionStatusLabel: Record<CommissionStatus, string> = {
  pending: "Pendente",
  approved: "Aprovada",
  paid: "Paga",
  rejected: "Recusada",
};

export const commissionStatusTone: Record<CommissionStatus, "warning" | "info" | "success" | "danger"> = {
  pending: "warning",
  approved: "info",
  paid: "success",
  rejected: "danger",
};

export function getAffiliateById(id: string): Affiliate | undefined {
  return affiliates.find((a) => a.id === id);
}
