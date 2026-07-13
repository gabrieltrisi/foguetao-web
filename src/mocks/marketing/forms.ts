import type { MarketingForm } from "@/types/marketing";

const STATUSES: MarketingForm["status"][] = ["active", "active", "paused", "draft"];

const NAMES = [
  "Contato — Site", "Trial grátis", "Webinar — Inscrição", "E-book download",
  "Orçamento personalizado", "Newsletter", "Fale com vendas", "Avaliação gratuita",
];

export const marketingForms: MarketingForm[] = NAMES.map((name, i) => {
  const views = 1800 + i * 940;
  const leads = Math.round(views * (0.14 + (i % 4) * 0.03));
  return {
    id: `form-${i + 1}`,
    name,
    status: STATUSES[i % STATUSES.length],
    leads,
    views,
    conversion: Math.round((leads / views) * 1000) / 10,
    fields: 3 + (i % 5),
    updatedAt: `${(i % 27) + 1} jul 2026`,
  };
});

export const formStatusLabel: Record<MarketingForm["status"], string> = {
  active: "Ativo",
  paused: "Pausado",
  draft: "Rascunho",
};

export const formStatusTone: Record<MarketingForm["status"], "success" | "warning" | "info"> = {
  active: "success",
  paused: "warning",
  draft: "info",
};
