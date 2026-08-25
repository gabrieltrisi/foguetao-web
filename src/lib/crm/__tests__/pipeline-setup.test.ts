import { describe, it, expect } from "vitest";
import { pipelineSetupStatus, validateCustomStages } from "@/lib/crm/pipeline-setup";
import type { CustomStageInput } from "@/types/api/crm-deals";

const open = { category: "OPEN" as const };
const won = { category: "WON" as const };
const lost = { category: "LOST" as const };

describe("pipelineSetupStatus (derivação de completude)", () => {
  it("EMPTY: sem etapas → incompleto, faltam os três requisitos", () => {
    const s = pipelineSetupStatus([]);
    expect(s.complete).toBe(false);
    expect(s.missing).toEqual(["OPEN_STAGE", "WON_STAGE", "LOST_STAGE"]);
  });

  it("completo: >=1 OPEN, exatamente 1 WON e 1 LOST", () => {
    expect(pipelineSetupStatus([open, open, won, lost])).toEqual({ complete: true, missing: [] });
  });

  it("falta OPEN", () => {
    const s = pipelineSetupStatus([won, lost]);
    expect(s.complete).toBe(false);
    expect(s.missing).toEqual(["OPEN_STAGE"]);
  });

  it("WON duplicado invalida (exige exatamente 1)", () => {
    const s = pipelineSetupStatus([open, won, won, lost]);
    expect(s.complete).toBe(false);
    expect(s.missing).toEqual(["WON_STAGE"]);
  });

  it("LOST ausente invalida", () => {
    const s = pipelineSetupStatus([open, won]);
    expect(s.complete).toBe(false);
    expect(s.missing).toEqual(["LOST_STAGE"]);
  });
});

describe("validateCustomStages (setup CUSTOM)", () => {
  const valid: CustomStageInput[] = [
    { name: "Novo lead", category: "OPEN", probability: 10 },
    { name: "Ganho", category: "WON", probability: 100 },
    { name: "Perdido", category: "LOST", probability: 0 },
  ];

  it("aceita conjunto válido", () => {
    expect(validateCustomStages(valid)).toBeNull();
  });

  it("rejeita lista vazia", () => {
    expect(validateCustomStages([])).toMatch(/ao menos uma etapa/i);
  });

  it("rejeita etapa sem nome", () => {
    expect(validateCustomStages([{ ...valid[0], name: "  " }, valid[1], valid[2]])).toMatch(/nome/i);
  });

  it("rejeita sem WON (invariante)", () => {
    const r = validateCustomStages([valid[0], valid[2]]);
    expect(r).toMatch(/exatamente 1 etapa Ganha/);
  });

  it("rejeita dois LOST", () => {
    const r = validateCustomStages([...valid, { name: "Perdido 2", category: "LOST" }]);
    expect(r).toMatch(/exatamente 1 etapa Perdida/);
  });

  it("rejeita sem OPEN", () => {
    const r = validateCustomStages([valid[1], valid[2]]);
    expect(r).toMatch(/ao menos 1 etapa Aberta/);
  });

  it("rejeita probabilidade fora de 0..100", () => {
    expect(validateCustomStages([{ ...valid[0], probability: 140 }, valid[1], valid[2]])).toMatch(/0 e 100/);
  });
});
