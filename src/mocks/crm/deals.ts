import type { Deal, PipelineStage, PipelineStageId } from "@/types/crm";

export const pipelineStages: PipelineStage[] = [
  { id: "novo-lead", label: "Novo lead" },
  { id: "contato", label: "Contato realizado" },
  { id: "qualificado", label: "Qualificado" },
  { id: "proposta", label: "Proposta" },
  { id: "negociacao", label: "Negociação" },
  { id: "ganho", label: "Ganho" },
];

const OWNERS = ["Camila Ribeiro", "Rafael Monteiro", "Bruno Alcântara", "Larissa Prado"];
const ORGS = ["Grão Café", "Vertex Farma", "Zenit Corp", "Studio Ampère", "Núcleo Digital", "Aurora Labs", "Peça Rara", "Vinha & Co"];
const CONTACTS = ["Camila Ferraz", "Rodrigo Nunes", "Beatriz Sales", "Thiago Amaral", "Larissa Gomes", "Fernando Castro", "Juliana Rocha", "Marcelo Prado"];
const TAGS = ["Upsell", "Renovação", "Enterprise", "Inbound", "Indicação", "Expansão"];
const STAGE_IDS: PipelineStageId[] = ["novo-lead", "contato", "qualificado", "proposta", "negociacao", "ganho"];
const PROBABILITY: Record<PipelineStageId, number> = {
  "novo-lead": 10,
  contato: 25,
  qualificado: 45,
  proposta: 65,
  negociacao: 80,
  ganho: 100,
};

const TITLES = [
  "Implantação CRM", "Plano Performance anual", "Migração de base", "Expansão de licenças",
  "Consultoria de vendas", "Pacote WhatsApp", "Automação de marketing", "Onboarding premium",
  "Renovação de contrato", "Integração Meta Ads", "Setup de pipeline", "Treinamento do time",
  "Relatórios avançados", "Módulo de afiliados", "Plano Pro trimestral", "Gestão de leads",
  "Campanha Black Week", "Dashboard executivo",
];

export const deals: Deal[] = TITLES.map((title, i) => {
  const stageId = STAGE_IDS[i % STAGE_IDS.length];
  return {
    id: `deal-${i + 1}`,
    title,
    contactName: CONTACTS[i % CONTACTS.length],
    organizationName: ORGS[i % ORGS.length],
    stageId,
    value: 6000 + (i % 9) * 5400,
    probability: PROBABILITY[stageId],
    owner: OWNERS[i % OWNERS.length],
    tags: [TAGS[i % TAGS.length]],
    closeDate: `${(i % 27) + 1} ago 2026`,
    status: stageId === "ganho" ? "ganho" : "aberta",
  };
});

export function dealsByStage(stageId: PipelineStageId): Deal[] {
  return deals.filter((d) => d.stageId === stageId);
}

export function stageTotal(stageId: PipelineStageId): number {
  return dealsByStage(stageId).reduce((sum, d) => sum + d.value, 0);
}

export function getDealById(id: string): Deal | undefined {
  return deals.find((d) => d.id === id);
}
