"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { registerSchema, type RegisterFormValues } from "@/lib/validations/auth";
import { useRegister } from "@/hooks/auth/use-register";
import { useResendVerification } from "@/hooks/auth/use-verify-email";
import { isApiError } from "@/types/api/error";
import { CheckEmailPanel } from "@/components/auth/check-email-panel";
import {
  AuthHeader,
  AuthSubmit,
  AuthAlert,
  AuthFieldError,
  AuthNote,
  authFieldClass,
  authLabelClass,
} from "@/components/auth/auth-ui";

function messageForError(error: unknown): string {
  if (isApiError(error)) {
    if (error.isUnavailable) return "Servidor indisponível. Tente novamente em instantes.";
    if (error.statusCode === 409) return "Este e-mail já tem uma conta. Entre em vez de cadastrar.";
    if (error.statusCode === 429)
      return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
    if (error.statusCode === 400) return "Verifique os dados e a força da senha.";
  }
  return "Não foi possível concluir o cadastro. Tente novamente.";
}

const PASSWORD_HINT = "Mín. 10 caracteres · maiúscula · minúscula · número · símbolo";

export function RegisterForm() {
  const { toast } = useToast();
  const registerAccount = useRegister();
  const resend = useResendVerification();
  const [authError, setAuthError] = React.useState<string | null>(null);
  const [sentTo, setSentTo] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  async function onSubmit(values: RegisterFormValues) {
    setAuthError(null);
    try {
      await registerAccount.mutateAsync({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
      });
      toast({
        title: "Confirme seu e-mail",
        description: "Enviamos um link de confirmação.",
        variant: "success",
      });
      setSentTo(values.email.trim());
    } catch (error) {
      setAuthError(messageForError(error));
    }
  }

  // Após o cadastro: tela de "confirme seu e-mail" (não há login sem confirmar).
  if (sentTo) {
    return (
      <CheckEmailPanel
        email={sentTo}
        onResend={async () => {
          await resend.mutateAsync(sentTo);
          toast({ title: "Reenviado", description: "Confira sua caixa de entrada.", variant: "success" });
        }}
        resending={resend.isPending}
      />
    );
  }

  return (
    <div>
      <AuthHeader title="Coloque sua operação em movimento">
        Crie seu acesso e comece a organizar sua operação comercial.
      </AuthHeader>

      {authError ? <AuthAlert>{authError}</AuthAlert> : null}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-7 flex flex-col gap-5" noValidate>
        <div className="flex flex-col gap-2">
          <Label htmlFor="name" className={authLabelClass}>
            Nome
          </Label>
          <Input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Seu nome"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "name-error" : undefined}
            disabled={isSubmitting}
            className={authFieldClass}
            {...register("name")}
          />
          {errors.name ? <AuthFieldError id="name-error">{errors.name.message}</AuthFieldError> : null}
        </div>

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

        <div className="flex flex-col gap-2">
          <Label htmlFor="password" className={authLabelClass}>
            Senha
          </Label>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            placeholder="Crie uma senha forte"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "password-error" : "password-hint"}
            disabled={isSubmitting}
            className={authFieldClass}
            {...register("password")}
          />
          {errors.password ? (
            <AuthFieldError id="password-error">{errors.password.message}</AuthFieldError>
          ) : (
            <p id="password-hint" className="text-[12px] text-white/40">
              {PASSWORD_HINT}
            </p>
          )}
        </div>

        <AuthSubmit loading={isSubmitting} className="mt-1">
          Criar conta
        </AuthSubmit>
      </form>

      <AuthNote>14 dias grátis · sem cartão de crédito</AuthNote>

      <p className="mt-6 text-center text-[13.5px] text-white/50">
        Já tem conta?{" "}
        <Link href="/login" className="font-semibold text-white transition-colors hover:text-brand">
          Entrar
        </Link>
      </p>
    </div>
  );
}
