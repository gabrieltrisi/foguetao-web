import { z } from "zod";

/** Schema de validação local do login (sem backend nesta etapa). */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Informe seu e-mail.")
    .email("Digite um e-mail válido."),
  password: z.string().min(1, "Informe sua senha."),
  remember: z.boolean().optional(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
