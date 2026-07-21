"use client";

import * as React from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "@/lib/validations/auth";
import { useForgotPassword } from "@/hooks/auth/use-password-reset";
import { isApiError } from "@/types/api/error";
import {
  AuthHeader,
  AuthSubmit,
  AuthAlert,
  AuthFieldError,
  AuthState,
  AuthLinkButton,
  authFieldClass,
  authLabelClass,
} from "@/components/auth/auth-ui";

function messageForError(error: unknown): string {
  if (isApiError(error)) {
    if (error.isUnavailable) return "Servidor indisponível. Tente novamente em instantes.";
    if (error.statusCode === 429)
      return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
  }
  return "Não foi possível enviar o e-mail agora. Tente novamente em instantes.";
}

export function ForgotPasswordForm() {
  const forgot = useForgotPassword();
  const [sentTo, setSentTo] = React.useState<string | null>(null);
  const [authError, setAuthError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotPasswordFormValues) {
    setAuthError(null);
    const email = values.email.trim();
    try {
      await forgot.mutateAsync(email);
      setSentTo(email);
    } catch (error) {
      setAuthError(messageForError(error));
    }
  }

  // Sucesso: mensagem genérica (não revela se o e-mail existe — anti-enumeração).
  if (sentTo) {
    return (
      <AuthState
        icon={MailCheck}
        title="Verifique seu e-mail"
        actions={
          <AuthLinkButton href="/login" variant="ghost">
            Voltar para o login
          </AuthLinkButton>
        }
      >
        Se <span className="font-medium text-white/80">{sentTo}</span> estiver cadastrado, enviamos
        um link para redefinir sua senha. O envio pode levar alguns instantes — confira também a
        caixa de spam.
      </AuthState>
    );
  }

  return (
    <div>
      <AuthHeader title="Recupere seu acesso">
        Informe seu e-mail e enviaremos as instruções para redefinir sua senha.
      </AuthHeader>

      {authError ? <AuthAlert>{authError}</AuthAlert> : null}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-7 flex flex-col gap-5" noValidate>
        <div className="flex flex-col gap-2">
          <Label htmlFor="email" className={authLabelClass}>
            E-mail
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="voce@empresa.com.br"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            disabled={isSubmitting}
            className={authFieldClass}
            {...register("email")}
          />
          {errors.email ? <AuthFieldError id="email-error">{errors.email.message}</AuthFieldError> : null}
        </div>

        <AuthSubmit loading={isSubmitting} className="mt-1">
          Enviar instruções
        </AuthSubmit>
      </form>

      <p className="mt-8 text-center text-[13.5px] text-white/50">
        Lembrou a senha?{" "}
        <Link href="/login" className="font-semibold text-white transition-colors hover:text-brand">
          Voltar para o login
        </Link>
      </p>
    </div>
  );
}
