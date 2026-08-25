/**
 * Contratos do Quiz Inteligente da landing. Dados puros e serializáveis — nada
 * de React aqui. As respostas viajam para o motor de score/diagnóstico (puro) e,
 * ao final, para o seam de captação de lead.
 */
import type { SegmentId, BenefitIconKey } from "@/config/landing/segments";

/** Ids estáveis das 6 perguntas (chaves das respostas e da persistência). */
export type QuestionId = "segmento" | "dor" | "equipe" | "leads" | "controle" | "objetivo";

/** Opções por pergunta (unions fechadas → score/diagnóstico exaustivos e testáveis). */
export type SegmentoOption =
  | "consultoria"
  | "agencia"
  | "academia"
  | "imobiliaria"
  | "clinica"
  | "ecommerce"
  | "infoproduto"
  | "outro";
export type DorOption = "followup" | "organizacao" | "equipe" | "whatsapp" | "conversao" | "automacao";
export type EquipeOption = "solo" | "pequena" | "media" | "grande";
export type LeadsOption = "poucos" | "medio" | "alto" | "muito_alto";
export type ControleOption = "planilha" | "whatsapp" | "crm" | "notion" | "memoria" | "outro";
export type ObjetivoOption = "vendas" | "organizacao" | "escalar" | "automatizar" | "indicadores";

/** Respostas em progresso (parciais até concluir). */
export interface QuizAnswers {
  segmento?: SegmentoOption;
  dor?: DorOption;
  equipe?: EquipeOption;
  leads?: LeadsOption;
  controle?: ControleOption;
  objetivo?: ObjetivoOption;
}

/** Respostas completas — pré-condição para gerar o diagnóstico. */
export type CompleteAnswers = Required<QuizAnswers>;

/** Uma opção selecionável de uma pergunta. */
export interface QuizOption {
  id: string;
  label: string;
  /** Chave de ícone lucide (mapeada na UI — dados sem React). */
  icon?: BenefitIconKey;
  emoji?: string;
  /** Só na pergunta de segmento: liga ao motor de segmentos existente. */
  segmentId?: SegmentId;
  /** Descrição curta opcional sob o rótulo. */
  hint?: string;
}

/** Uma pergunta (uma por tela). */
export interface QuizQuestion {
  id: QuestionId;
  eyebrow: string;
  title: string;
  subtitle?: string;
  options: QuizOption[];
}

export type MaturityLevel = "muito-baixa" | "baixa" | "media" | "alta" | "excelente";

export interface Maturity {
  level: MaturityLevel;
  label: string;
}

/** Resultado bruto do algoritmo de score (puro). */
export interface ScoreResult {
  score: number; // 0..100
  maturity: Maturity;
  /** Detalhe das parcelas — útil para depuração/testes/transparência. */
  breakdown: {
    control: number;
    scale: number;
    goalClarity: number;
    painPenalty: number;
  };
}

export interface Gap {
  id: string;
  title: string;
  body: string;
}

export interface RecommendedFeature {
  icon: BenefitIconKey;
  title: string;
  body: string;
}

export interface RecommendedPlan {
  name: string;
  rationale: string;
}

/** Diagnóstico completo apresentado na tela de resultado. */
export interface Diagnosis {
  segmentId: SegmentId;
  segmentLabel: string;
  score: number;
  maturity: Maturity;
  /** Potencial de melhoria (0..100), enquadrado como ganho ao organizar. */
  potential: number;
  headline: string;
  /** Resumo executivo em linguagem natural (parágrafo), derivado das respostas. */
  executiveSummary: string;
  proof: string;
  gaps: Gap[];
  priorities: string[];
  features: RecommendedFeature[];
  plan: RecommendedPlan;
  nextSteps: string[];
}

/** Dados do formulário de captação (após o diagnóstico). */
export interface QuizLeadInput {
  name: string;
  email: string;
  whatsapp: string;
  company: string;
}

/** UTM + referrer capturados no cliente. */
export interface QuizTracking {
  utm: Record<string, string>;
  referrer: string;
}

/**
 * Payload enviado ao route handler /api/landing/quiz-lead. Estrutura pensada
 * para espelhar o CreateContactDto do backend (firstName/email/phone + metadata).
 */
export interface QuizLeadPayload {
  lead: QuizLeadInput;
  answers: CompleteAnswers;
  diagnosis: {
    segment: SegmentId;
    segmentLabel: string;
    score: number;
    maturity: MaturityLevel;
    plan: string;
  };
  tracking: QuizTracking;
}
