"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldCheck, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { loginSchema, type LoginFormValues } from "@/lib/validations/auth";
import { useLogin } from "@/hooks/auth/use-login";
import { isApiError } from "@/types/api/error";

function messageForError(error: unknown): string {
  if (isApiError(error)) {
    if (error.isUnavailable) return "Servidor indisponível. Tente novamente em instantes.";
    if (error.statusCode === 429) return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
    if (error.isUnauthorized) return "E-mail ou senha incorretos.";
  }
  return "Não foi possível entrar. Tente novamente.";
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const login = useLogin();
  const [authError, setAuthError] = React.useState<string | null>(null);

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
    try {
      await login.mutateAsync({ email: values.email.trim(), password: values.password });
      toast({
        title: "Login realizado",
        description: "Redirecionando para o painel…",
        variant: "success",
      });
      const next = searchParams.get("next");
      router.replace(next && next.startsWith("/") ? next : "/dashboard");
    } catch (error) {
      setAuthError(messageForError(error));
    }
  }

  return (
    <div className="mx-auto w-full max-w-sm">
      <h1 className="font-display text-h1 font-bold text-ink">Bem-vindo de volta</h1>
      <p className="mt-1 text-body2 text-ink-2">Entre na sua conta para continuar.</p>

      {authError ? (
        <div
          role="alert"
          className="mt-5 flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/5 p-3 text-body2 text-danger"
        >
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>{authError}</span>
        </div>
      ) : null}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="voce@empresa.com.br"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            disabled={isSubmitting}
            {...register("email")}
          />
          {errors.email ? (
            <p id="email-error" role="alert" className="text-small text-danger">
              {errors.email.message}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Senha</Label>
            <Link
              href="/login"
              className="text-small font-medium text-brand transition-colors hover:text-brand-dark"
            >
              Esqueci minha senha
            </Link>
          </div>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            placeholder="Sua senha"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "password-error" : undefined}
            disabled={isSubmitting}
            {...register("password")}
          />
          {errors.password ? (
            <p id="password-error" role="alert" className="text-small text-danger">
              {errors.password.message}
            </p>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <Controller
            name="remember"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="remember"
                checked={field.value ?? false}
                onCheckedChange={(checked) => field.onChange(checked === true)}
                onBlur={field.onBlur}
              />
            )}
          />
          <Label htmlFor="remember" className="font-normal text-ink-2">
            Lembrar de mim
          </Label>
        </div>

        <Button type="submit" size="lg" loading={isSubmitting} className="w-full">
          Entrar
        </Button>
      </form>

      <p className="mt-5 text-center text-body2 text-ink-2">
        Não tem uma conta?{" "}
        <Link href="/login" className="font-semibold text-brand transition-colors hover:text-brand-dark">
          Criar uma conta
        </Link>
      </p>

      <p className="mt-6 flex items-center justify-center gap-1.5 text-small text-ink-3">
        <ShieldCheck className="size-4" aria-hidden />
        Conexão segura · Foguetão nunca compartilha seus dados.
      </p>
    </div>
  );
}
