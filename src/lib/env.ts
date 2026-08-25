import { z } from "zod";

/**
 * Validação defensiva das variáveis de ambiente no startup.
 * NEXT_PUBLIC_API_URL é a URL base do backend (foguetao-api), ex.:
 * http://localhost:3000. O prefixo /api/v1 é anexado pela camada HTTP.
 */
const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z
    .string()
    .min(1, "NEXT_PUBLIC_API_URL é obrigatória")
    .refine((v) => v.startsWith("http://") || v.startsWith("https://"), {
      message: "NEXT_PUBLIC_API_URL deve começar com http:// ou https://",
    }),
  /**
   * Feature flag da central de notificações (F7.7). Off por padrão: desligada, o
   * sino/painel não aparecem. Aceita "true"/"1" como ligado.
   */
  NEXT_PUBLIC_ENABLE_NOTIFICATION_CENTER: z
    .string()
    .optional()
    .transform((v) => v === "true" || v === "1"),
});

function loadEnv() {
  const parsed = envSchema.safeParse({
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_ENABLE_NOTIFICATION_CENTER: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATION_CENTER,
  });
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `- ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Configuração de ambiente inválida:\n${issues}`);
  }
  return parsed.data;
}

export const env = loadEnv();
