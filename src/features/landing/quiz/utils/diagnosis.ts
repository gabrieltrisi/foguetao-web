/**
 * Montagem do diagnóstico — PURA. Combina o score com a cópia por
 * dor/objetivo/segmento e reaproveita o motor de segmentos da landing
 * (`getLandingContent`) para os próximos passos (etapas do funil do nicho).
 */
import type { CompleteAnswers, Diagnosis, Gap, RecommendedFeature } from "../types";
import { getLandingContent } from "@/config/landing/segments";
import { SEGMENT_LABELS, SEGMENT_MAP } from "../constants/questions";
import { HIGH_VOLUME, INFORMAL_CONTROLS } from "../config/weights";
import {
  CONTROL_GAP,
  CONTROL_PRIORITY,
  CONTROLE_LABEL,
  DOR_FEATURES,
  DOR_GAP,
  DOR_NEXT_STEP,
  DOR_PRIORITY,
  DOR_RISK_LABEL,
  EQUIPE_LABEL,
  LEADS_LABEL,
  OBJETIVO_FEATURE,
  OBJETIVO_LABEL,
  OBJETIVO_PRIORITY,
  PLANS,
  VOLUME_MISMATCH_GAP,
  getSegmentFlavor,
} from "../config/diagnosis";
import { computeScore, potentialForScore } from "./score";

function dedupeBy<T>(items: T[], key: (t: T) => string): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of items) {
    const k = key(item);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(item);
  }
  return out;
}

function pickPlan(a: CompleteAnswers) {
  if (a.equipe === "grande" || a.leads === "muito_alto") return PLANS.escala;
  if (a.equipe === "media" || a.leads === "alto") return PLANS.pro;
  return PLANS.essencial;
}

/** Gera o diagnóstico completo a partir das 6 respostas. */
export function buildDiagnosis(answers: CompleteAnswers): Diagnosis {
  const segmentId = SEGMENT_MAP[answers.segmento];
  const segmentLabel = SEGMENT_LABELS[answers.segmento];
  const flavor = getSegmentFlavor(segmentId);
  const { score, maturity } = computeScore(answers);
  const potential = potentialForScore(score);

  // Gargalos (até 3): dor primária → fraqueza do controle → descompasso de volume.
  const rawGaps: Gap[] = [DOR_GAP[answers.dor]];
  const controlGap = CONTROL_GAP[answers.controle];
  if (controlGap) rawGaps.push(controlGap);
  const volumeMismatch =
    HIGH_VOLUME.includes(answers.leads) && INFORMAL_CONTROLS.includes(answers.controle);
  if (volumeMismatch) rawGaps.push(VOLUME_MISMATCH_GAP);
  const gaps = dedupeBy(rawGaps, (g) => g.id).slice(0, 3);

  // Prioridades (até 3): dor → controle (se informal) → meta.
  const rawPriorities = [
    DOR_PRIORITY[answers.dor],
    ...(controlGap ? [CONTROL_PRIORITY] : []),
    OBJETIVO_PRIORITY[answers.objetivo],
  ];
  const priorities = dedupeBy(rawPriorities, (p) => p).slice(0, 3);

  // Recursos recomendados: dor (2) + meta (1), sem repetir título, até 4.
  const rawFeatures: RecommendedFeature[] = [...DOR_FEATURES[answers.dor], OBJETIVO_FEATURE[answers.objetivo]];
  const features = dedupeBy(rawFeatures, (f) => f.title).slice(0, 4);

  // Próximos passos: reaproveita as etapas do funil do nicho (personalização real).
  const stages = getLandingContent(segmentId).pipeline.stages;
  const nextSteps = [
    "Importe sua base atual e comece com o histórico organizado.",
    `Configure seu funil: ${stages.join(" → ")}.`,
    DOR_NEXT_STEP[answers.dor],
  ];

  const headline = `Para ${flavor.nounPlural}, ${flavor.focus} — e a maturidade comercial da sua operação hoje é ${maturity.label.toLowerCase()}.`;

  const executiveSummary =
    `No seu segmento (${segmentLabel}), a maturidade comercial da operação é ${maturity.label.toLowerCase()} — score ${score} de 100. ` +
    `Hoje você controla as vendas ${CONTROLE_LABEL[answers.controle]}, com ${LEADS_LABEL[answers.leads]} leads por mês e ${EQUIPE_LABEL[answers.equipe]} na linha de frente; ` +
    `o maior risco é ${DOR_RISK_LABEL[answers.dor]}. ` +
    `Levando a operação para um funil único, o potencial de ganho é de cerca de ${potential}% em eficiência comercial — com foco em ${OBJETIVO_LABEL[answers.objetivo]}.`;

  return {
    segmentId,
    segmentLabel,
    score,
    maturity,
    potential,
    headline,
    executiveSummary,
    proof: flavor.proof,
    gaps,
    priorities,
    features,
    plan: pickPlan(answers),
    nextSteps,
  };
}
