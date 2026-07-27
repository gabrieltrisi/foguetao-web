import { describe, it, expect } from "vitest";
import { buildDiagnosis } from "./diagnosis";
import { getLandingContent } from "@/config/landing/segments";
import type { CompleteAnswers } from "../types";

const ecommerceHighVolume: CompleteAnswers = {
  segmento: "ecommerce",
  dor: "conversao",
  equipe: "grande",
  leads: "muito_alto",
  controle: "planilha",
  objetivo: "escalar",
};

const academiaSolo: CompleteAnswers = {
  segmento: "academia",
  dor: "followup",
  equipe: "solo",
  leads: "poucos",
  controle: "memoria",
  objetivo: "organizacao",
};

describe("buildDiagnosis", () => {
  it("mapeia o segmento do quiz para o SegmentId do motor da landing", () => {
    expect(buildDiagnosis(ecommerceHighVolume).segmentId).toBe("loja");
    expect(buildDiagnosis(academiaSolo).segmentId).toBe("academia");
  });

  it("usa o rótulo que o usuário viu como segmentLabel", () => {
    expect(buildDiagnosis(ecommerceHighVolume).segmentLabel).toBe("E-commerce");
  });

  it("inclui o gargalo primário da dor escolhida", () => {
    const d = buildDiagnosis(academiaSolo);
    expect(d.gaps.some((g) => g.id === "followup")).toBe(true);
  });

  it("detecta descompasso de volume (volume alto + controle informal)", () => {
    const d = buildDiagnosis(ecommerceHighVolume);
    expect(d.gaps.some((g) => g.id === "volume-mismatch")).toBe(true);
  });

  it("limita gargalos a 3 e recursos a 4", () => {
    const d = buildDiagnosis(ecommerceHighVolume);
    expect(d.gaps.length).toBeLessThanOrEqual(3);
    expect(d.features.length).toBeLessThanOrEqual(4);
    expect(d.features.length).toBeGreaterThan(0);
  });

  it("recomenda plano por porte (grande/muito_alto → Escala; solo → Essencial)", () => {
    expect(buildDiagnosis(ecommerceHighVolume).plan.name).toBe("Escala");
    expect(buildDiagnosis(academiaSolo).plan.name).toBe("Essencial");
  });

  it("gera próximos passos reaproveitando as etapas do funil do segmento", () => {
    const d = buildDiagnosis(academiaSolo);
    const stages = getLandingContent("academia").pipeline.stages.join(" → ");
    expect(d.nextSteps.some((s) => s.includes(stages))).toBe(true);
    expect(d.nextSteps).toHaveLength(3);
  });

  it("personaliza a headline por segmento (nichos diferentes ⇒ textos diferentes)", () => {
    const a = buildDiagnosis(academiaSolo).headline;
    const b = buildDiagnosis(ecommerceHighVolume).headline;
    expect(a).not.toBe(b);
    expect(a.toLowerCase()).toContain("academia");
  });

  it("expõe score, maturidade e potencial coerentes", () => {
    const d = buildDiagnosis(academiaSolo);
    expect(d.score).toBeGreaterThanOrEqual(0);
    expect(d.score).toBeLessThanOrEqual(100);
    expect(d.maturity.label).toBeTruthy();
    expect(d.potential).toBeGreaterThan(0);
    expect(d.priorities.length).toBeGreaterThan(0);
  });
});
