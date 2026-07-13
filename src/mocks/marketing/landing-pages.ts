import type { LandingPage, LandingPageStatus } from "@/types/marketing";

const STATUSES: LandingPageStatus[] = ["published", "draft", "published", "archived"];
const ACCENTS = ["#E0070F", "#2563EB", "#16A34A", "#D97706", "#17171A", "#8A0509"];

const NAMES = [
  { name: "Plano Performance Anual", slug: "plano-anual" },
  { name: "Webinar — Vendas com IA", slug: "webinar-ia" },
  { name: "Trial Grátis 14 dias", slug: "trial-gratis" },
  { name: "E-book Pipeline", slug: "ebook-pipeline" },
  { name: "Black Week 2026", slug: "black-week" },
  { name: "Indique e Ganhe", slug: "indique-ganhe" },
];

export const landingPages: LandingPage[] = NAMES.map((n, i) => {
  const views = 4200 + i * 2600;
  const leads = Math.round(views * (0.08 + (i % 4) * 0.02));
  return {
    id: `lp-${i + 1}`,
    name: n.name,
    slug: n.slug,
    status: STATUSES[i % STATUSES.length],
    views,
    leads,
    conversion: Math.round((leads / views) * 1000) / 10,
    updatedAt: `${(i % 27) + 1} jul 2026`,
    accent: ACCENTS[i % ACCENTS.length],
  };
});

export const landingStatusLabel: Record<LandingPageStatus, string> = {
  published: "Publicada",
  draft: "Rascunho",
  archived: "Arquivada",
};

export const landingStatusTone: Record<LandingPageStatus, "success" | "info" | "neutral"> = {
  published: "success",
  draft: "info",
  archived: "neutral",
};

export function getLandingPageById(id: string): LandingPage | undefined {
  return landingPages.find((l) => l.id === id);
}
