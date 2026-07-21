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

/**
 * Cadastro. As regras de senha espelham a política do backend
 * (validatePasswordPolicy): mín. 10, maiúscula, minúscula, número e especial.
 * Validar aqui evita um round-trip só pra receber 400 do servidor.
 */
export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Informe seu nome.")
    .max(120, "Nome muito longo."),
  email: z
    .string()
    .min(1, "Informe seu e-mail.")
    .email("Digite um e-mail válido.")
    .max(255, "E-mail muito longo."),
  password: z
    .string()
    .min(10, "A senha precisa de ao menos 10 caracteres.")
    .regex(/[A-Z]/, "Inclua ao menos uma letra maiúscula.")
    .regex(/[a-z]/, "Inclua ao menos uma letra minúscula.")
    .regex(/[0-9]/, "Inclua ao menos um número.")
    .regex(/[^A-Za-z0-9]/, "Inclua ao menos um caractere especial."),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;

/** Solicitação de recuperação de senha (apenas e-mail). */
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Informe seu e-mail.")
    .email("Digite um e-mail válido.")
    .max(255, "E-mail muito longo."),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

/**
 * Redefinição de senha. Espelha a política do backend (mín. 10, maiúscula,
 * minúscula, número e especial) e exige a confirmação da nova senha. O token
 * vem da URL, não do formulário.
 */
export const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(10, "A senha precisa de ao menos 10 caracteres.")
      .regex(/[A-Z]/, "Inclua ao menos uma letra maiúscula.")
      .regex(/[a-z]/, "Inclua ao menos uma letra minúscula.")
      .regex(/[0-9]/, "Inclua ao menos um número.")
      .regex(/[^A-Za-z0-9]/, "Inclua ao menos um caractere especial."),
    confirmPassword: z.string().min(1, "Confirme a nova senha."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
