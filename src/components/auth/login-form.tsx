"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { loginSchema, type LoginFormValues } from "@/lib/validations/auth";
import { useLogin } from "@/hooks/auth/use-login";
import { isApiError } from "@/types/api/error";
import { CommandButton, TelemetryLabel } from "@/components/site/primitives";

function messageForError(error: unknown): string {
  if (isApiError(error)) {
    if (error.isUnavailable) return "Servidor indisponível. Tente novamente em instantes.";
    if (error.statusCode === 429)
      return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
    if (error.isUnauthorized) return "E-mail ou senha incorretos.";
  }
  return "Não foi possível entrar. Tente novamente.";
}

/* Estilo "console": inputs escuros, rótulos mono. A LÓGICA não muda. */
const fieldClass =
  "h-11 rounded-lg border-white/12 bg-white/[0.04] text-white shadow-none placeholder:text-white/25 focus-visible:border-brand focus-visible:ring-brand/25 disabled:bg-white/[0.02] disabled:text-white/30 aria-[invalid=true]:border-danger";
const labelClass = "font-mono text-[11px] tracking-[0.2em] text-white/45 uppercase";

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
        title: "Acesso concedido",
        description: "Abrindo o centro de comando…",
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
      <TelemetryLabel live className="mb-6">
        Acesso · Missão 001
      </TelemetryLabel>

      <h1 className="font-display text-[clamp(1.9rem,4vw,2.6rem)] leading-[1.02] font-bold tracking-[-0.02em] text-white">
        Bem-vindo de volta.
      </h1>
      <p className="mt-2 text-sm text-white/60">Identifique-se para retomar o comando.</p>

      <AnimatePresence initial={false}>
        {authError ? (
          <motion.div
            role="alert"
            initial={{ opacity: 0, y: -8, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto", marginTop: 24 }}
            exit={{ opacity: 0, y: -8, height: 0, marginTop: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="border-danger/40 bg-danger/[0.08] flex items-center gap-3 overflow-hidden rounded-lg border px-4 py-3"
          >
            <span className="bg-danger size-2 shrink-0 animate-pulse rounded-full" />
            <span className="text-danger font-mono text-[10px] tracking-[0.2em] uppercase">
              Negado
            </span>
            <span className="text-[13px] text-white/85">{authError}</span>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-7 flex flex-col gap-5" noValidate>
        <div className="flex flex-col gap-2">
          <Label htmlFor="email" className={labelClass}>
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
            className={fieldClass}
            {...register("email")}
          />
          {errors.email ? (
            <p id="email-error" role="alert" className="text-danger text-[12px]">
              {errors.email.message}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className={labelClass}>
              Senha
            </Label>
            <Link
              href="/login"
              className="font-mono text-[10px] tracking-[0.12em] text-white/40 uppercase transition-colors hover:text-white"
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
            className={fieldClass}
            {...register("password")}
          />
          {errors.password ? (
            <p id="password-error" role="alert" className="text-danger text-[12px]">
              {errors.password.message}
            </p>
          ) : null}
        </div>

        <div className="flex items-center gap-2.5">
          <Controller
            name="remember"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="remember"
                className="border-white/25 bg-white/5"
                checked={field.value ?? false}
                onCheckedChange={(checked) => field.onChange(checked === true)}
                onBlur={field.onBlur}
              />
            )}
          />
          <Label htmlFor="remember" className="font-mono text-[11px] tracking-[0.1em] text-white/50">
            Manter sessão aberta
          </Label>
        </div>

        <CommandButton type="submit" loading={isSubmitting} className="mt-1">
          Entrar no comando
        </CommandButton>
      </form>

      <p className="mt-6 text-center font-mono text-[11px] tracking-[0.1em] text-white/40">
        Sem acesso?{" "}
        <Link href="/register" className="text-brand transition-colors hover:text-white">
          Criar acesso
        </Link>
      </p>

      <div className="mt-8 flex items-center justify-center gap-2 border-t border-white/8 pt-6">
        <span className="bg-brand size-1.5 rounded-full" />
        <span className="font-mono text-[10px] tracking-[0.2em] text-white/30 uppercase">
          Conexão segura · TLS · dados nunca compartilhados
        </span>
      </div>
    </div>
  );
}
