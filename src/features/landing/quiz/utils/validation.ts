/**
 * Schemas Zod do quiz. Usados no cliente (formulário de lead, react-hook-form)
 * e como fronteira de validação no route handler (`/api/landing/quiz-lead`).
 * As enums são explícitas de propósito: a validação não deve depender das
 * constantes de UI (fronteira estável entre browser e servidor).
 */
import { z } from "zod";

const onlyDigits = (v: string) => v.replace(/\D/g, "");

/** Formulário de captação (Nome, Email, WhatsApp, Empresa). */
export const leadSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome").max(120),
  email: z.string().trim().email("E-mail inválido").max(255),
  whatsapp: z
    .string()
    .trim()
    .min(1, "Informe seu WhatsApp")
    .max(24)
    .refine((v) => {
      const d = onlyDigits(v);
      return d.length >= 10 && d.length <= 13;
    }, "WhatsApp inválido (com DDD)"),
  company: z.string().trim().min(2, "Informe a empresa").max(120),
});

export type LeadFormValues = z.infer<typeof leadSchema>;

export const segmentoEnum = z.enum([
  "consultoria",
  "agencia",
  "academia",
  "imobiliaria",
  "clinica",
  "ecommerce",
  "infoproduto",
  "outro",
]);
export const dorEnum = z.enum(["followup", "organizacao", "equipe", "whatsapp", "conversao", "automacao"]);
export const equipeEnum = z.enum(["solo", "pequena", "media", "grande"]);
export const leadsEnum = z.enum(["poucos", "medio", "alto", "muito_alto"]);
export const controleEnum = z.enum(["planilha", "whatsapp", "crm", "notion", "memoria", "outro"]);
export const objetivoEnum = z.enum(["vendas", "organizacao", "escalar", "automatizar", "indicadores"]);

/** Respostas completas (todas as 6 respondidas). */
export const completeAnswersSchema = z.object({
  segmento: segmentoEnum,
  dor: dorEnum,
  equipe: equipeEnum,
  leads: leadsEnum,
  controle: controleEnum,
  objetivo: objetivoEnum,
});

/** Payload aceito pelo route handler de captação de lead. */
export const quizLeadPayloadSchema = z.object({
  lead: leadSchema,
  answers: completeAnswersSchema,
  diagnosis: z.object({
    segment: z.string().min(1).max(60),
    segmentLabel: z.string().min(1).max(120),
    score: z.number().int().min(0).max(100),
    maturity: z.enum(["muito-baixa", "baixa", "media", "alta", "excelente"]),
    plan: z.string().min(1).max(60),
  }),
  tracking: z.object({
    utm: z.record(z.string(), z.string().max(300)).default({}),
    referrer: z.string().max(500).default(""),
  }),
});

export type QuizLeadPayloadParsed = z.infer<typeof quizLeadPayloadSchema>;
