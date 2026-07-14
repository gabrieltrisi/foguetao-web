import type { AttributionModel, AttributionRow } from "@/types/analytics";

export const attributionModels: { value: AttributionModel; label: string; description: string }[] = [
  { value: "first", label: "Primeiro toque", description: "100% do crédito para o primeiro canal." },
  { value: "last", label: "Último toque", description: "100% do crédito para o último canal." },
  { value: "linear", label: "Linear", description: "Crédito distribuído igualmente." },
  { value: "position", label: "Baseado em posição", description: "40% primeiro, 40% último, 20% meio." },
];

/** Receita atribuída por canal, por modelo. */
export const attributionByModel: Record<AttributionModel, AttributionRow[]> = {
  first: [
    { id: "instagram", label: "Instagram", conversions: 182, revenue: 218000 },
    { id: "google", label: "Google Ads", conversions: 148, revenue: 196000 },
    { id: "meta", label: "Meta Ads", conversions: 96, revenue: 142000 },
    { id: "organico", label: "Orgânico", conversions: 78, revenue: 88000 },
    { id: "afiliado", label: "Afiliados", conversions: 42, revenue: 64000 },
  ],
  last: [
    { id: "google", label: "Google Ads", conversions: 196, revenue: 268000 },
    { id: "meta", label: "Meta Ads", conversions: 132, revenue: 184000 },
    { id: "email", label: "E-mail", conversions: 88, revenue: 118000 },
    { id: "instagram", label: "Instagram", conversions: 74, revenue: 96000 },
    { id: "direto", label: "Direto", conversions: 56, revenue: 72000 },
  ],
  linear: [
    { id: "google", label: "Google Ads", conversions: 168, revenue: 232000 },
    { id: "meta", label: "Meta Ads", conversions: 142, revenue: 198000 },
    { id: "instagram", label: "Instagram", conversions: 118, revenue: 152000 },
    { id: "email", label: "E-mail", conversions: 92, revenue: 118000 },
    { id: "afiliado", label: "Afiliados", conversions: 64, revenue: 88000 },
  ],
  position: [
    { id: "instagram", label: "Instagram", conversions: 156, revenue: 204000 },
    { id: "google", label: "Google Ads", conversions: 172, revenue: 246000 },
    { id: "meta", label: "Meta Ads", conversions: 124, revenue: 168000 },
    { id: "email", label: "E-mail", conversions: 78, revenue: 98000 },
    { id: "afiliado", label: "Afiliados", conversions: 52, revenue: 72000 },
  ],
};
