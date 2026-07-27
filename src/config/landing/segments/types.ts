/**
 * Motor de conteúdo por segmento da Landing.
 *
 * A UI permanece 100% genérica: cada seção recebe apenas DADOS tipados. Um
 * segmento é uma configuração que sobrescreve o `default` (deep-merge). Nada
 * aqui importa React/lucide — são dados puros e serializáveis, prontos para,
 * no futuro, viajarem para o CRM (Empresa.segment, onboarding etc.).
 */

/** Ordem canônica dos segmentos. `default` e `outro` usam a versão geral. */
export const SEGMENT_IDS = [
  "default",
  "academia",
  "nutricionista",
  "clinica",
  "estetica",
  "agencia",
  "imobiliaria",
  "loja",
  "prestador-servico",
  "outro",
] as const;

export type SegmentId = (typeof SEGMENT_IDS)[number];

export type Tone = "neutral" | "brand" | "success" | "warning";

/** Chaves de ícone dos benefícios (mapeadas a lucide na UI — dados sem React). */
export type BenefitIconKey =
  | "trendingUp"
  | "bell"
  | "users"
  | "chart"
  | "layers"
  | "zap";

export interface HeroContent {
  eyebrow: string;
  /** Primeira linha do H1 (texto normal). */
  titleLead: string;
  /** Segunda linha do H1 (destacada em vermelho da marca). */
  titleHighlight: string;
  subtitle: string;
  primaryCta: string;
  /** Reforço abaixo dos CTAs (ex.: "14 dias grátis · sem cartão…"). */
  note: string;
}

export interface BenefitItem {
  icon: BenefitIconKey;
  title: string;
  body: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface FinalCtaContent {
  titleLead: string;
  /** Palavra destacada dentro do título (ex.: "decolar"). */
  titleHighlight: string;
  titleTail: string;
  subtitle: string;
  primaryCta: string;
}

/** Pipeline do segmento — etapas ordenadas (Novo Lead → … → Matrícula). */
export interface PipelineContent {
  stages: string[];
}

export interface CrmTag {
  label: string;
  tone: Tone;
}

export interface CrmActivity {
  t: string;
  d: string;
}

export interface CrmContact {
  name: string;
  role: string;
  tags: CrmTag[];
  phone: string;
  email: string;
  activities: CrmActivity[];
}

export interface CrmDeal {
  title: string;
  person: string;
  value: string;
  probability: string;
  /** Etapas curtas mostradas na régua de progresso do negócio. */
  stages: string[];
  /** Preenchimento da barra (0–100). */
  progressPct: number;
  status: CrmTag;
}

export interface CrmTask {
  t: string;
  tag: string;
  tone: Tone;
  done: boolean;
}

export interface CrmFunnelRow {
  label: string;
  count: string;
  /** Largura da barra (0–100). */
  pct: number;
}

export interface CrmDashboard {
  funnel: CrmFunnelRow[];
  tasks: string[];
}

export interface CrmBoardColumn {
  stage: string;
  deals: { name: string; value: string }[];
}

/**
 * Amostras do CRM usadas nas "screenshots" (mesmo produto, dados do nicho).
 * `badge` é o selo "Exemplo para Academias" — vazio no default (sem selo).
 */
export interface CrmExamples {
  badge: string;
  dashboard: CrmDashboard;
  board: CrmBoardColumn[];
  contact: CrmContact;
  deal: CrmDeal;
  tasks: CrmTask[];
}

/** Um número de destaque da prova social (ex.: "3x mais follow-up"). */
export interface ProofStat {
  value: string;
  label: string;
}

/** Depoimento (estrutura preparada para dados reais). */
export interface ProofTestimonial {
  quote: string;
  author: string;
  role: string;
  company: string;
}

/**
 * Prova social por segmento. `demo: true` sinaliza que os dados são ilustrativos
 * (selo "Demonstração" na UI) — NUNCA fingimos clientes reais. Trocar por
 * depoimentos reais depois é só editar o config, sem mexer na UI.
 */
export interface SegmentProof {
  demo: boolean;
  stats: ProofStat[];
  testimonial: ProofTestimonial;
}

/** Configuração de um segmento (o que cada arquivo `segments/*.ts` exporta). */
export interface SegmentContent {
  id: SegmentId;
  /** Rótulo curto no seletor (ex.: "Academia"). */
  label: string;
  /** Emoji do seletor (ex.: "🏋"). */
  emoji: string;
  hero: HeroContent;
  benefits: BenefitItem[];
  /** Perguntas específicas do nicho, anexadas à base comum. */
  faqExtra: FaqItem[];
  pipeline: PipelineContent;
  crm: CrmExamples;
  /** Prova social (stats + depoimento) — herdada do default, sobrescrita por nicho. */
  proof: SegmentProof;
  finalCta: FinalCtaContent;
}

/**
 * Conteúdo já resolvido para a UI: igual a `SegmentContent`, mas com o FAQ
 * final (base comum + específicas) no lugar de `faqExtra`.
 */
export interface LandingContent extends Omit<SegmentContent, "faqExtra"> {
  faq: FaqItem[];
}

/** FAQ comum a todos os segmentos (base). O nicho apenas acrescenta ao final. */
export const COMMON_FAQ: FaqItem[] = [
  {
    q: "O que é o Foguetão?",
    a: "Um CRM brasileiro que reúne contatos, pipeline, negócios, tarefas e campanhas em um só painel — feito para times comerciais venderem com organização e clareza.",
  },
  {
    q: "Preciso de cartão de crédito para testar?",
    a: "Não. O teste é de 14 dias, sem cartão. Você cria a conta e começa a usar na hora.",
  },
  {
    q: "Consigo importar meus contatos?",
    a: "Sim. Você traz sua base atual e trabalha com o histórico organizado desde o primeiro dia.",
  },
  {
    q: "Quantas pessoas do meu time podem usar?",
    a: "Quantas você precisar. Cada pessoa entra com o próprio acesso e permissões definidas por função.",
  },
  {
    q: "Meus dados ficam seguros?",
    a: "Sim. Sessões revogáveis, cookies httpOnly, conexão TLS e isolamento por empresa. Segurança é a base da plataforma.",
  },
  {
    q: "Posso cancelar quando quiser?",
    a: "Pode. Sem fidelidade e sem cobrança automática surpresa. Você continua porque o produto entrega.",
  },
];
