import type { StageCategory, MissingRequirement, CustomStageInput } from "@/types/api/crm-deals";

export const stageCategoryLabel: Record<StageCategory, string> = {
  OPEN: "Aberta",
  WON: "Ganha",
  LOST: "Perdida",
};

export const setupModeLabel: Record<string, string> = {
  STANDARD: "Padrão",
  CUSTOM: "Personalizado",
  EMPTY: "Vazio",
};

export const missingRequirementLabel: Record<string, string> = {
  OPEN_STAGE: "ao menos 1 etapa Aberta",
  WON_STAGE: "exatamente 1 etapa Ganha",
  LOST_STAGE: "exatamente 1 etapa Perdida",
};

interface CategorizedStage {
  category: StageCategory;
}

/**
 * Deriva o status de configuração de um pipeline a partir das suas etapas.
 * Invariantes do backend: >= 1 OPEN, exatamente 1 WON e exatamente 1 LOST.
 * `GET /pipelines/:id` devolve o modelo cru (sem setupComplete), por isso a
 * derivação acontece no frontend a partir de `GET /pipelines/:id/stages`.
 */
export function pipelineSetupStatus(stages: readonly CategorizedStage[]): {
  complete: boolean;
  missing: MissingRequirement[];
} {
  const active = stages.filter(Boolean);
  const open = active.filter((s) => s.category === "OPEN").length;
  const won = active.filter((s) => s.category === "WON").length;
  const lost = active.filter((s) => s.category === "LOST").length;

  const missing: MissingRequirement[] = [];
  if (open < 1) missing.push("OPEN_STAGE");
  if (won !== 1) missing.push("WON_STAGE");
  if (lost !== 1) missing.push("LOST_STAGE");

  return { complete: missing.length === 0, missing };
}

/**
 * Valida a lista de etapas de um setup CUSTOM antes de enviar ao backend.
 * Retorna a mensagem de erro (pt-BR) ou null quando válida.
 */
export function validateCustomStages(stages: readonly CustomStageInput[]): string | null {
  if (stages.length === 0) return "Adicione ao menos uma etapa.";
  if (stages.some((s) => !s.name.trim())) return "Todas as etapas precisam de um nome.";

  const { missing } = pipelineSetupStatus(stages);
  if (missing.length > 0) {
    return `O pipeline exige ${missing.map((m) => missingRequirementLabel[m]).join(", ")}.`;
  }

  const invalidProb = stages.find(
    (s) => s.probability !== undefined && (s.probability < 0 || s.probability > 100),
  );
  if (invalidProb) return "A probabilidade deve estar entre 0 e 100.";

  return null;
}
