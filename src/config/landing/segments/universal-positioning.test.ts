import { describe, it, expect } from "vitest";
import { getLandingContent, resolveLandingSegment } from "./index";

/**
 * LP3.1 — Reposicionamento Universal.
 * A home aberta sem contexto é SEMPRE universal (`default`). Nenhum nicho —
 * academia inclusive — pode ser fallback implícito da home principal.
 */

// Termos que só fazem sentido dentro de um nicho — NÃO podem aparecer no estado
// universal (hero, benefícios, problemas, mock, CTA final).
const NICHE_TERMS =
  /academia|alun[oa]s?|matr[íi]cula|aula experimental|est[úu]dio|paciente|consult[óo]rio|im[óo]vel|corretor|ve[íi]culo|concession/i;

function universalCopyBlob(): string {
  const c = getLandingContent("default");
  return [
    c.hero.eyebrow, c.hero.titleLead, c.hero.titleHighlight, c.hero.subtitle, c.hero.primaryCta,
    ...c.benefits.flatMap((b) => [b.title, b.body]),
    ...c.problems.flatMap((p) => [p.title, p.body]),
    ...c.crm.dashboard.tasks,
    ...c.crm.dashboard.funnel.map((f) => f.label),
    c.finalCta.titleLead, c.finalCta.titleHighlight, c.finalCta.subtitle, c.finalCta.primaryCta,
  ].join(" · ");
}

describe("resolveLandingSegment — home só personaliza por ?segment= explícito", () => {
  it("sem parâmetro → default (universal)", () => {
    expect(resolveLandingSegment(undefined)).toBe("default");
    expect(resolveLandingSegment(null)).toBe("default");
    expect(resolveLandingSegment("")).toBe("default");
  });

  it("parâmetro explícito e válido → aquele segmento", () => {
    expect(resolveLandingSegment("academia")).toBe("academia");
    expect(resolveLandingSegment("imobiliaria")).toBe("imobiliaria");
  });

  it("parâmetro inválido → default (não vaza para nicho)", () => {
    expect(resolveLandingSegment("zzz")).toBe("default");
  });
});

describe("estado universal da home (default)", () => {
  it("NUNCA usa academia como default (trava anti-regressão)", () => {
    // Se alguém tornar academia o default, a headline universal muda e isto falha.
    expect(resolveLandingSegment(undefined)).toBe("default");
    expect(getLandingContent("default").hero.titleLead).toBe("Mais vendas.");
    expect(getLandingContent("default").hero).not.toEqual(getLandingContent("academia").hero);
  });

  it("hero + benefícios + problemas + mock + CTA final não contêm termos de nicho", () => {
    expect(universalCopyBlob()).not.toMatch(NICHE_TERMS);
  });

  it("o eyebrow universal fala de empresas em geral", () => {
    expect(getLandingContent("default").hero.eyebrow.toLowerCase()).toContain("empresas");
  });
});

describe("não regressão dos segmentos (personalização explícita continua)", () => {
  it("?segment=academia continua entregando o conteúdo de academia", () => {
    const a = getLandingContent("academia");
    expect(`${a.hero.titleLead} ${a.hero.titleHighlight}`).toMatch(/aluno|matr[íi]cula|oportunidades/i);
    expect(a.crm.badge).toBe("Exemplo para Academias");
  });

  it("troca de segmento não mistura conteúdo (academia ≠ imobiliária)", () => {
    expect(getLandingContent("academia").hero).not.toEqual(getLandingContent("imobiliaria").hero);
    expect(getLandingContent("academia").problems).not.toEqual(getLandingContent("imobiliaria").problems);
  });
});
