import type { MarketplaceItem } from "@/types/admin";

export const marketplaceCategories = [
  "Todos",
  "Automações",
  "Templates",
  "Landing Pages",
  "Pipelines",
  "Dashboards",
  "Relatórios",
  "Campanhas",
];

export const marketplaceItems: MarketplaceItem[] = [
  { id: "mp-1", title: "Recuperação de carrinho", category: "Automações", author: "Foguetão Labs", downloads: 4820, rating: 4.9, priceLabel: "Grátis", accent: "#E0070F", installed: true },
  { id: "mp-2", title: "Boas-vindas WhatsApp", category: "Automações", author: "Comunidade", downloads: 3120, rating: 4.7, priceLabel: "Grátis", accent: "#059669" },
  { id: "mp-3", title: "Landing de captura Pro", category: "Landing Pages", author: "Studio Rocket", downloads: 2740, rating: 4.8, priceLabel: "R$ 89", accent: "#2563EB" },
  { id: "mp-4", title: "Pipeline consultoria", category: "Pipelines", author: "Foguetão Labs", downloads: 1980, rating: 4.6, priceLabel: "Grátis", accent: "#7C3AED" },
  { id: "mp-5", title: "Dashboard executivo", category: "Dashboards", author: "DataCraft", downloads: 3540, rating: 4.9, priceLabel: "R$ 129", accent: "#EA580C" },
  { id: "mp-6", title: "Relatório de mídia paga", category: "Relatórios", author: "Comunidade", downloads: 2210, rating: 4.5, priceLabel: "Grátis", accent: "#0891B2" },
  { id: "mp-7", title: "Campanha Black Friday", category: "Campanhas", author: "Studio Rocket", downloads: 5120, rating: 5.0, priceLabel: "R$ 149", accent: "#DB2777" },
  { id: "mp-8", title: "Template e-mail nutrição", category: "Templates", author: "Foguetão Labs", downloads: 4010, rating: 4.7, priceLabel: "Grátis", accent: "#CA8A04" },
  { id: "mp-9", title: "Onboarding de clientes", category: "Automações", author: "Comunidade", downloads: 1670, rating: 4.4, priceLabel: "Grátis", accent: "#4F46E5" },
];
