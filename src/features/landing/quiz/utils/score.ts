/**
 * Algoritmo de score comercial — PURO e determinístico (sem I/O, sem React).
 * Ver `config/weights.ts` para o modelo. Testável isoladamente.
 */
import type { CompleteAnswers, Maturity, ScoreResult } from "../types";
import {
  CONTROL_POINTS,
  GOAL_POINTS,
  LEADS_POINTS,
  MATURITY_BANDS,
  PAIN_PENALTY,
  TEAM_POINTS,
} from "../config/weights";

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

/** Maturidade comercial correspondente a um score 0..100. */
export function maturityForScore(score: number): Maturity {
  const band = MATURITY_BANDS.find((b) => score <= b.max) ?? MATURITY_BANDS[MATURITY_BANDS.length - 1];
  return { level: band.level, label: band.label };
}

/** Score comercial 0..100 + maturidade + parcelas (transparência/depuração). */
export function computeScore(answers: CompleteAnswers): ScoreResult {
  const control = CONTROL_POINTS[answers.controle];
  const scale = TEAM_POINTS[answers.equipe] + LEADS_POINTS[answers.leads];
  const goalClarity = GOAL_POINTS[answers.objetivo];
  const painPenalty = PAIN_PENALTY[answers.dor];

  const score = clamp(Math.round(control + scale + goalClarity - painPenalty), 0, 100);

  return {
    score,
    maturity: maturityForScore(score),
    breakdown: { control, scale, goalClarity, painPenalty },
  };
}

/**
 * Potencial de melhoria (0..100) enquadrado como ganho ao organizar a operação.
 * Sempre significativo (piso 12), sem exagero (teto 88).
 */
export function potentialForScore(score: number): number {
  return clamp(Math.round((100 - score) * 0.8) + 8, 12, 88);
}
