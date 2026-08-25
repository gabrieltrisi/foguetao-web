import { describe, it, expect } from "vitest";
import {
  SEGMENTS,
  SEGMENT_OPTIONS,
  getLandingContent,
  hasUrlSegment,
  isSegmentId,
  normalizeSegmentId,
  resolveSegmentId,
} from "./index";
import { SEGMENT_IDS, COMMON_FAQ } from "./types";
import { withSegment } from "@/lib/landing/segment";

describe("isSegmentId / normalizeSegmentId", () => {
  it("aceita ids conhecidos e rejeita o resto", () => {
    expect(isSegmentId("academia")).toBe(true);
    expect(isSegmentId("default")).toBe(true);
    expect(isSegmentId("nao-existe")).toBe(false);
    expect(isSegmentId(undefined)).toBe(false);
    expect(isSegmentId(123)).toBe(false);
  });

  it("normaliza inválido para default", () => {
    expect(normalizeSegmentId("academia")).toBe("academia");
    expect(normalizeSegmentId("zzz")).toBe("default");
    expect(normalizeSegmentId(null)).toBe("default");
  });
});

describe("resolveSegmentId — regra definitiva (URL autoritativa)", () => {
  it("URL válida + cookie de outro segmento → URL vence", () => {
    expect(resolveSegmentId({ url: "academia", cookie: "clinica", storage: "loja" })).toBe("academia");
  });

  it("URL INVÁLIDA + cookie válido de academia → default (parâmetro presente NÃO cai pro cookie)", () => {
    expect(resolveSegmentId({ url: "zzz", cookie: "academia" })).toBe("default");
    expect(resolveSegmentId({ url: "zzz", cookie: "academia", storage: "loja" })).toBe("default");
  });

  it("URL vazia (`?segment=`) é tratada como AUSENTE → aplica o cookie (não perde a preferência por um param vazio)", () => {
    expect(resolveSegmentId({ url: "", cookie: "academia" })).toBe("academia");
  });

  it("URL AUSENTE + cookie válido de academia → academia", () => {
    expect(resolveSegmentId({ url: undefined, cookie: "academia", storage: "loja" })).toBe("academia");
  });

  it("URL ausente + sem cookie → localStorage válido", () => {
    expect(resolveSegmentId({ storage: "loja" })).toBe("loja");
  });

  it("URL ausente + cookie inválido → cai pro localStorage válido", () => {
    expect(resolveSegmentId({ cookie: "zzz", storage: "loja" })).toBe("loja");
  });

  it("nada válido → default", () => {
    expect(resolveSegmentId({})).toBe("default");
    expect(resolveSegmentId({ cookie: "y", storage: "z" })).toBe("default");
  });
});

describe("hasUrlSegment", () => {
  it("distingue parâmetro presente de ausente", () => {
    expect(hasUrlSegment("academia")).toBe(true);
    expect(hasUrlSegment("zzz")).toBe(true); // presente mesmo inválido
    expect(hasUrlSegment("")).toBe(false);
    expect(hasUrlSegment(undefined)).toBe(false);
    expect(hasUrlSegment(null)).toBe(false);
  });
});

describe("withSegment — preserva o segmento nos CTAs", () => {
  it("default não adiciona parâmetro", () => {
    expect(withSegment("/register", "default")).toBe("/register");
  });
  it("segmento adiciona ?segment=", () => {
    expect(withSegment("/register", "academia")).toBe("/register?segment=academia");
  });
  it("usa & quando já há query", () => {
    expect(withSegment("/register?next=/app", "loja")).toBe("/register?next=/app&segment=loja");
  });
  it("preserva o hash no final", () => {
    expect(withSegment("/#produto", "clinica")).toBe("/?segment=clinica#produto");
  });
});

describe("getLandingContent", () => {
  it("default reusa o FAQ comum e não tem selo", () => {
    const c = getLandingContent("default");
    expect(c.faq).toHaveLength(COMMON_FAQ.length);
    expect(c.crm.badge).toBe("");
  });

  it("academia acrescenta FAQ específico ao comum e tem selo", () => {
    const c = getLandingContent("academia");
    expect(c.faq.length).toBeGreaterThan(COMMON_FAQ.length);
    expect(c.faq.slice(0, COMMON_FAQ.length)).toEqual(COMMON_FAQ);
    expect(c.crm.badge).toBe("Exemplo para Academias");
    // headline do nicho
    expect(`${c.hero.titleLead} ${c.hero.titleHighlight}`).toMatch(/oportunidades perdidas/i);
    // pipeline do nicho
    expect(c.pipeline.stages).toContain("Matrícula");
  });

  it("id inválido cai no conteúdo default", () => {
    // @ts-expect-error — exercício de robustez com id inválido
    expect(getLandingContent("zzz").hero).toEqual(SEGMENTS.default.hero);
  });
});

describe("integridade de todos os segmentos", () => {
  it("todo segmento tem as fatias obrigatórias preenchidas", () => {
    for (const id of SEGMENT_IDS) {
      const s = SEGMENTS[id];
      expect(s.id, id).toBe(id);
      expect(s.label.length, id).toBeGreaterThan(0);
      expect(s.emoji.length, id).toBeGreaterThan(0);
      expect(s.hero.titleLead.length, id).toBeGreaterThan(0);
      expect(s.hero.primaryCta.length, id).toBeGreaterThan(0);
      expect(s.benefits.length, id).toBe(6);
      expect(s.pipeline.stages.length, id).toBeGreaterThanOrEqual(3);
      expect(s.crm.board.length, id).toBeGreaterThan(0);
      expect(s.crm.dashboard.funnel.length, id).toBeGreaterThan(0);
      expect(s.crm.tasks.length, id).toBeGreaterThan(0);
      expect(s.finalCta.primaryCta.length, id).toBeGreaterThan(0);
    }
  });

  it("nichos (exceto outro) trazem selo; default e outro não", () => {
    expect(SEGMENTS.default.crm.badge).toBe("");
    expect(SEGMENTS.outro.crm.badge).toBe("");
    for (const id of SEGMENT_IDS) {
      if (id === "default" || id === "outro") continue;
      expect(SEGMENTS[id].crm.badge, id).not.toBe("");
    }
  });

  it("o seletor lista todos os nichos + outro, sem o default", () => {
    const ids = SEGMENT_OPTIONS.map((o) => o.id);
    expect(ids).not.toContain("default");
    expect(ids).toContain("outro");
    expect(ids).toContain("academia");
    expect(ids).toHaveLength(SEGMENT_IDS.length - 1);
  });

  it("outro herda o conteúdo geral (mesma headline do default)", () => {
    expect(SEGMENTS.outro.hero).toEqual(SEGMENTS.default.hero);
  });

  it("deep-merge: nicho que não declara benefits herda os do default", () => {
    // outro é passthrough puro → herda os benefícios gerais
    expect(SEGMENTS.outro.benefits).toEqual(SEGMENTS.default.benefits);
  });

  it("todos os nichos contextualizam os benefícios (não são os gerais)", () => {
    for (const id of [
      "academia", "nutricionista", "clinica", "estetica", "imobiliaria", "agencia", "loja", "prestador-servico",
    ] as const) {
      expect(SEGMENTS[id].benefits, id).not.toEqual(SEGMENTS.default.benefits);
      expect(SEGMENTS[id].benefits, id).toHaveLength(6);
    }
  });

  it("todo segmento tem prova social preenchida (stats + depoimento)", () => {
    for (const id of SEGMENT_IDS) {
      const p = SEGMENTS[id].proof;
      expect(typeof p.demo, id).toBe("boolean");
      expect(p.stats.length, id).toBeGreaterThanOrEqual(2);
      for (const s of p.stats) {
        expect(s.value.length, id).toBeGreaterThan(0);
        expect(s.label.length, id).toBeGreaterThan(0);
      }
      expect(p.testimonial.quote.length, id).toBeGreaterThan(0);
      expect(p.testimonial.author.length, id).toBeGreaterThan(0);
      expect(p.testimonial.role.length, id).toBeGreaterThan(0);
      expect(p.testimonial.company.length, id).toBeGreaterThan(0);
    }
  });

  it("prova social atual é demonstração (nunca finge cliente real)", () => {
    for (const id of SEGMENT_IDS) {
      expect(SEGMENTS[id].proof.demo, id).toBe(true);
    }
  });

  it("todo segmento tem a seção Problema preenchida (dores)", () => {
    for (const id of SEGMENT_IDS) {
      const problems = SEGMENTS[id].problems;
      expect(problems.length, id).toBeGreaterThanOrEqual(3);
      for (const p of problems) {
        expect(p.icon.length, id).toBeGreaterThan(0);
        expect(p.title.length, id).toBeGreaterThan(0);
        expect(p.body.length, id).toBeGreaterThan(0);
      }
    }
  });

  it("todo segmento tem mini-case (antes/depois) e highlightFeatures válidos", () => {
    const featureNames = new Set([
      "Visão geral", "Pipeline", "Contatos", "Organizações", "Negócios", "Tarefas", "Campanhas", "Multiempresa",
    ]);
    for (const id of SEGMENT_IDS) {
      const c = SEGMENTS[id].proof.case;
      expect(c, id).toBeTruthy();
      expect(c!.before.length, id).toBeGreaterThan(0);
      expect(c!.after.length, id).toBeGreaterThan(0);
      // highlightFeatures referenciam recursos reais da grade
      for (const name of SEGMENTS[id].highlightFeatures) {
        expect(featureNames.has(name), `${id}:${name}`).toBe(true);
      }
    }
  });

  it("nichos contextualizam a seção Problema (não são as dores gerais)", () => {
    for (const id of [
      "academia", "nutricionista", "clinica", "estetica", "imobiliaria", "agencia", "loja", "prestador-servico",
    ] as const) {
      expect(SEGMENTS[id].problems, id).not.toEqual(SEGMENTS.default.problems);
    }
  });

  it("benefícios/hero/CTA citam só recursos reais (sem WhatsApp/IA/automação/prontuário/agenda médica/integração)", () => {
    const forbidden = /whatsapp|intelig[êe]ncia artificial|automa[çc]|integra[çc]|prontu[áa]rio|agenda m[ée]dica/i;
    for (const id of SEGMENT_IDS) {
      const s = SEGMENTS[id];
      const claims = [
        s.hero.eyebrow, s.hero.titleLead, s.hero.titleHighlight, s.hero.subtitle, s.hero.primaryCta,
        s.finalCta.titleLead, s.finalCta.titleHighlight, s.finalCta.subtitle, s.finalCta.primaryCta,
        ...s.benefits.flatMap((b) => [b.title, b.body]),
        ...s.problems.flatMap((p) => [p.title, p.body]),
        ...s.proof.stats.flatMap((st) => [st.value, st.label]),
        s.proof.testimonial.quote, s.proof.testimonial.role,
        s.proof.case?.before ?? "", s.proof.case?.after ?? "",
      ].join(" · ");
      expect(claims, id).not.toMatch(forbidden);
    }
  });
});
