import { describe, it, expect } from "vitest";
import { leadSchema, quizLeadPayloadSchema } from "./validation";

const validLead = {
  name: "Marina Alves",
  email: "marina@studiovitta.com",
  whatsapp: "(11) 99999-0000",
  company: "Studio Vitta",
};

describe("leadSchema", () => {
  it("aceita um lead válido", () => {
    expect(leadSchema.safeParse(validLead).success).toBe(true);
  });

  it("rejeita e-mail inválido", () => {
    expect(leadSchema.safeParse({ ...validLead, email: "não-email" }).success).toBe(false);
  });

  it("rejeita WhatsApp com poucos dígitos", () => {
    expect(leadSchema.safeParse({ ...validLead, whatsapp: "123" }).success).toBe(false);
  });

  it("aceita WhatsApp com DDD (10–13 dígitos, com máscara)", () => {
    expect(leadSchema.safeParse({ ...validLead, whatsapp: "11 3333-4444" }).success).toBe(true);
  });

  it("rejeita nome muito curto e empresa vazia", () => {
    expect(leadSchema.safeParse({ ...validLead, name: "M" }).success).toBe(false);
    expect(leadSchema.safeParse({ ...validLead, company: "" }).success).toBe(false);
  });
});

describe("quizLeadPayloadSchema", () => {
  const payload = {
    lead: validLead,
    answers: {
      segmento: "clinica",
      dor: "followup",
      equipe: "media",
      leads: "alto",
      controle: "planilha",
      objetivo: "vendas",
    },
    diagnosis: {
      segment: "clinica",
      segmentLabel: "Clínica",
      score: 47,
      maturity: "media",
      plan: "Pro",
    },
    tracking: { utm: { utm_source: "google" }, referrer: "https://google.com" },
  };

  it("aceita um payload completo", () => {
    expect(quizLeadPayloadSchema.safeParse(payload).success).toBe(true);
  });

  it("aplica defaults de tracking quando ausente", () => {
    const parsed = quizLeadPayloadSchema.safeParse({ ...payload, tracking: {} });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.tracking.utm).toEqual({});
      expect(parsed.data.tracking.referrer).toBe("");
    }
  });

  it("rejeita answer com valor fora da enum", () => {
    const bad = { ...payload, answers: { ...payload.answers, controle: "telepatia" } };
    expect(quizLeadPayloadSchema.safeParse(bad).success).toBe(false);
  });

  it("rejeita score fora de 0..100", () => {
    const bad = { ...payload, diagnosis: { ...payload.diagnosis, score: 140 } };
    expect(quizLeadPayloadSchema.safeParse(bad).success).toBe(false);
  });
});
