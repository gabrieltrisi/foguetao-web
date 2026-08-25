import { describe, it, expect } from "vitest";
import { computeScore, maturityForScore, potentialForScore } from "./score";
import type { CompleteAnswers, ControleOption } from "../types";

const base: CompleteAnswers = {
  segmento: "outro",
  dor: "followup",
  equipe: "media",
  leads: "medio",
  controle: "planilha",
  objetivo: "organizacao",
};

describe("computeScore", () => {
  it("cenário de baixa maturidade → score baixo", () => {
    const r = computeScore({
      segmento: "outro",
      dor: "organizacao",
      equipe: "solo",
      leads: "poucos",
      controle: "memoria",
      objetivo: "vendas",
    });
    // control 6 + scale (3+3) + goal 8 − pain 14 = 6
    expect(r.score).toBe(6);
    expect(r.maturity.level).toBe("muito-baixa");
  });

  it("cenário de alta maturidade → score alto", () => {
    const r = computeScore({
      segmento: "agencia",
      dor: "automacao",
      equipe: "grande",
      leads: "muito_alto",
      controle: "crm",
      objetivo: "indicadores",
    });
    // control 45 + scale (14+11) + goal 15 − pain 4 = 81
    expect(r.score).toBe(81);
    expect(r.maturity.level).toBe("excelente");
  });

  it("cenário intermediário → maturidade média", () => {
    const r = computeScore(base);
    // control 32 + scale (11+7) + goal 9 − pain 12 = 47
    expect(r.score).toBe(47);
    expect(r.maturity.level).toBe("media");
    expect(r.breakdown).toEqual({ control: 32, scale: 18, goalClarity: 9, painPenalty: 12 });
  });

  it("é monotônico no método de controle (melhor controle ⇒ score maior)", () => {
    const order: ControleOption[] = ["memoria", "whatsapp", "outro", "planilha", "notion", "crm"];
    const scores = order.map((controle) => computeScore({ ...base, controle }).score);
    for (let i = 1; i < scores.length; i++) {
      expect(scores[i]).toBeGreaterThan(scores[i - 1]);
    }
  });

  it("mantém o score dentro de 0..100", () => {
    const r = computeScore(base);
    expect(r.score).toBeGreaterThanOrEqual(0);
    expect(r.score).toBeLessThanOrEqual(100);
  });
});

describe("maturityForScore — fronteiras das faixas", () => {
  const cases: [number, string][] = [
    [0, "muito-baixa"],
    [20, "muito-baixa"],
    [21, "baixa"],
    [40, "baixa"],
    [41, "media"],
    [60, "media"],
    [61, "alta"],
    [80, "alta"],
    [81, "excelente"],
    [100, "excelente"],
  ];
  it.each(cases)("score %i → %s", (score, level) => {
    expect(maturityForScore(score).level).toBe(level);
  });
});

describe("potentialForScore", () => {
  it("cresce quando o score é menor (mais headroom)", () => {
    expect(potentialForScore(6)).toBeGreaterThan(potentialForScore(81));
  });
  it("respeita piso 12 e teto 88", () => {
    expect(potentialForScore(100)).toBe(12);
    expect(potentialForScore(0)).toBe(88);
  });
});
