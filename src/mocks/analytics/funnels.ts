import type { Funnel } from "@/types/analytics";

export const funnels: Funnel[] = [
  {
    id: "fnl-marketing",
    name: "Funil de marketing",
    type: "marketing",
    avgTime: "12 dias",
    conversion: 8.4,
    stages: [
      { label: "Visitantes", count: 48200 },
      { label: "Leads", count: 6820 },
      { label: "MQLs", count: 3240 },
      { label: "SQLs", count: 1480 },
      { label: "Clientes", count: 428 },
    ],
  },
  {
    id: "fnl-vendas",
    name: "Funil de vendas",
    type: "vendas",
    avgTime: "18 dias",
    conversion: 6.5,
    stages: [
      { label: "Novo lead", count: 428 },
      { label: "Contato", count: 256 },
      { label: "Qualificado", count: 188 },
      { label: "Proposta", count: 92 },
      { label: "Negociação", count: 46 },
      { label: "Ganho", count: 28 },
    ],
  },
  {
    id: "fnl-suporte",
    name: "Funil de atendimento",
    type: "atendimento",
    avgTime: "1,4 dias",
    conversion: 82,
    stages: [
      { label: "Tickets abertos", count: 1280 },
      { label: "Em atendimento", count: 940 },
      { label: "Aguardando", count: 420 },
      { label: "Resolvidos", count: 1048 },
    ],
  },
];

export const funnelTypeLabel: Record<Funnel["type"], string> = {
  marketing: "Marketing",
  vendas: "Vendas",
  atendimento: "Atendimento",
};
