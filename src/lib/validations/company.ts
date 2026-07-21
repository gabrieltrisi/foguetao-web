import { z } from "zod";

/**
 * Criação de empresa no onboarding. Espelha o CreateCompanyDto do backend:
 * `name` é obrigatório (2–120); `phone` e `timezone` são opcionais. Os demais
 * campos (locale, currency, slug) têm default no backend.
 */
export const createCompanySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Informe o nome da empresa.")
    .max(120, "Nome muito longo."),
  phone: z
    .string()
    .trim()
    .max(40, "Telefone muito longo.")
    .optional()
    .or(z.literal("")),
  timezone: z.string().min(1, "Selecione o fuso horário."),
});

export type CreateCompanyFormValues = z.infer<typeof createCompanySchema>;

/** Fusos horários brasileiros mais comuns (IANA) — aceitos pelo backend. */
export const timezoneOptions: { value: string; label: string }[] = [
  { value: "America/Sao_Paulo", label: "Brasília (São Paulo) — GMT-3" },
  { value: "America/Bahia", label: "Bahia — GMT-3" },
  { value: "America/Fortaleza", label: "Fortaleza — GMT-3" },
  { value: "America/Recife", label: "Recife — GMT-3" },
  { value: "America/Cuiaba", label: "Cuiabá — GMT-4" },
  { value: "America/Manaus", label: "Manaus — GMT-4" },
  { value: "America/Rio_Branco", label: "Rio Branco (Acre) — GMT-5" },
];

export const DEFAULT_TIMEZONE = "America/Sao_Paulo";
