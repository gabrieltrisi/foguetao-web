"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { loginSchema, type LoginFormValues } from "@/lib/validations/auth";
import { useLogin } from "@/hooks/auth/use-login";
import { useResendVerification } from "@/hooks/auth/use-verify-email";
import { isApiError } from "@/types/api/error";
import { CheckEmailPanel } from "@/components/auth/check-email-panel";
import {
  AuthHeader,
  AuthSubmit,
  AuthAlert,
  AuthFieldError,
  authFieldClass,
  authLabelClass,
} from "@/components/auth/auth-ui";

function messageForError(error: unknown): string {
  if (isApiError(error)) {
    if (error.isUnavailable) return "Não foi possível entrar agora. Tente novamente em instantes.";
    if (error.statusCode === 429)
      return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
    if (error.code === "TRIAL_EXPIRED")
      return "Seu período de teste terminou. Regularize o pagamento para reativar o acesso.";
    if (error.statusCode === 403) return "Esta conta está indisponível. Fale com o suporte.";
    if (error.isUnauthorized) return "E-mail ou senha incorretos.";
  }
  return "Não foi possível entrar agora. Tente novamente em instantes.";
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const login = useLogin();
  const resend = useResendVerification();
  const [authError, setAuthError] = React.useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: false },
  });

  async function onSubmit(values: LoginFormValues) {
    setAuthError(null);
    const email = values.email.trim();
    try {
      await login.mutateAsync({ email, password: values.password });
      toast({ title: "Acesso liberado", description: "Abrindo seu painel…", variant: "success" });
      // `next` só é aceito se for um caminho interno same-origin. Barra dupla
      // ("//host") ou "/\" são URLs protocol-relative → open redirect.
      const next = searchParams.get("next");
      const safeNext =
        next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\")
          ? next
          : "/dashboard";
      router.replace(safeNext);
    } catch (error) {
      // E-mail não confirmado: leva à tela de confirmação (com reenvio).
      if (isApiError(error) && error.code === "EMAIL_NOT_VERIFIED") {
        setUnverifiedEmail(email);
        return;
      }
      setAuthError(messageForError(error));
    }
  }

  if (unverifiedEmail) {
    return (
      <CheckEmailPanel
        email={unverifiedEmail}
        onResend={async () => {
          await resend.mutateAsync(unverifiedEmail);
          toast({ title: "Reenviado", description: "Confira sua caixa de entrada.", variant: "success" });
        }}
        resending={resend.isPending}
      />
    );
  }

  return (
    <div>
      <AuthHeader title="Bem-vindo de volta">
        Acesse sua operação e continue de onde parou.
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

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className={authLabelClass}>
              Senha
            </Label>
            <Link
              href="/forgot-password"
              className="text-[12.5px] text-white/50 transition-colors hover:text-white/80"
            >
              Esqueci a senha
            </Link>
          </div>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            placeholder="Sua senha"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "password-error" : undefined}
            disabled={isSubmitting}
            className={authFieldClass}
            {...register("password")}
          />
          {errors.password ? (
            <AuthFieldError id="password-error">{errors.password.message}</AuthFieldError>
          ) : null}
        </div>

        <div className="flex items-center gap-2.5">
          <Controller
            name="remember"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="remember"
                className="border-white/25 bg-white/5 data-[state=checked]:border-brand data-[state=checked]:bg-brand"
                checked={field.value ?? false}
                onCheckedChange={(checked) => field.onChange(checked === true)}
                onBlur={field.onBlur}
              />
            )}
          />
          <Label htmlFor="remember" className="text-[13px] text-white/60">
            Manter sessão aberta
          </Label>
        </div>

        <AuthSubmit loading={isSubmitting} className="mt-1">
          Entrar
        </AuthSubmit>
      </form>

      <p className="mt-8 text-center text-[13.5px] text-white/50">
        Ainda não tem conta?{" "}
        <Link href="/register" className="font-semibold text-white transition-colors hover:text-brand">
          Criar conta
        </Link>
      </p>
    </div>
  );
}
