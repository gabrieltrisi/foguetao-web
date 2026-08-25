/**
 * Pesos do algoritmo de score (só números — a cópia fica em `diagnosis.ts`).
 * Modelo aditivo, transparente e testável:
 *
 *   score = clamp( control + scale(team+leads) + goalClarity − painPenalty, 0, 100 )
 *
 * `control` (método atual) é o sinal dominante de maturidade. Monotonicidade:
 * mantendo as outras respostas, melhor controle ⇒ score maior (coberto por teste).
 */
import type {
  ControleOption,
  DorOption,
  EquipeOption,
  LeadsOption,
  MaturityLevel,
  ObjetivoOption,
} from "../types";

/** Método de controle atual — parcela dominante (0..45). */
export const CONTROL_POINTS: Record<ControleOption, number> = {
  memoria: 6,
  whatsapp: 22,
  outro: 26,
  planilha: 32,
  notion: 36,
  crm: 45,
};

/** Tamanho do time comercial (0..14). Operação maior ⇒ mais estrutura. */
export const TEAM_POINTS: Record<EquipeOption, number> = {
  solo: 3,
  pequena: 7,
  media: 11,
  grande: 14,
};

/** Volume de leads/mês (0..11). */
export const LEADS_POINTS: Record<LeadsOption, number> = {
  poucos: 3,
  medio: 7,
  alto: 9,
  muito_alto: 11,
};

/** Clareza/mensurabilidade do objetivo (0..15). */
export const GOAL_POINTS: Record<ObjetivoOption, number> = {
  indicadores: 15,
  escalar: 13,
  automatizar: 11,
  organizacao: 9,
  vendas: 8,
};

/** Penalidade pela dor (0..14). Dor mais básica ⇒ maturidade atual menor. */
export const PAIN_PENALTY: Record<DorOption, number> = {
  organizacao: 14,
  followup: 12,
  whatsapp: 10,
  conversao: 8,
  equipe: 7,
  automacao: 4,
};

/** Faixas de maturidade (limite superior inclusivo). */
export const MATURITY_BANDS: { max: number; level: MaturityLevel; label: string }[] = [
  { max: 20, level: "muito-baixa", label: "Muito baixa" },
  { max: 40, level: "baixa", label: "Baixa" },
  { max: 60, level: "media", label: "Média" },
  { max: 80, level: "alta", label: "Alta" },
  { max: 100, level: "excelente", label: "Excelente" },
];

/** Métodos de controle considerados informais (geram gargalo de rastreio). */
export const INFORMAL_CONTROLS: ControleOption[] = ["memoria", "whatsapp", "planilha"];

/** Volumes altos (usados para detectar descompasso volume × ferramenta). */
export const HIGH_VOLUME: LeadsOption[] = ["alto", "muito_alto"];
