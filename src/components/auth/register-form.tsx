"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { registerSchema, type RegisterFormValues } from "@/lib/validations/auth";
import { useRegister } from "@/hooks/auth/use-register";
import { isApiError } from "@/types/api/error";
import { CommandButton, TelemetryLabel } from "@/components/site/primitives";

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

/* Mesmo idioma "console" do login. Só a intenção muda: criar acesso. */
const fieldClass =
  "h-11 rounded-lg border-white/12 bg-white/[0.04] text-white shadow-none placeholder:text-white/25 focus-visible:border-brand focus-visible:ring-brand/25 disabled:bg-white/[0.02] disabled:text-white/30 aria-[invalid=true]:border-danger";
const labelClass = "font-mono text-[11px] tracking-[0.2em] text-white/45 uppercase";

const PASSWORD_HINT = "Mín. 10 caracteres · maiúscula · minúscula · número · símbolo";

export function RegisterForm() {
  const router = useRouter();
  const { toast } = useToast();
  const registerAccount = useRegister();
  const [authError, setAuthError] = React.useState<string | null>(null);

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
        title: "Missão criada",
        description: "Abrindo o centro de comando…",
        variant: "success",
      });
      router.replace("/dashboard");
    } catch (error) {
      setAuthError(messageForError(error));
    }
  }

  return (
    <div className="mx-auto w-full max-w-sm">
      <TelemetryLabel live className="mb-6">
        Nova missão · Trial
      </TelemetryLabel>

      <h1 className="font-display text-[clamp(1.9rem,4vw,2.6rem)] leading-[1.02] font-bold tracking-[-0.02em] text-white">
        Assuma o comando.
      </h1>
      <p className="mt-2 text-sm text-white/60">
        Crie sua credencial e entre direto no centro de comando.
      </p>

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
          <Label htmlFor="name" className={labelClass}>
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
            className={fieldClass}
            {...register("name")}
          />
          {errors.name ? (
            <p id="name-error" role="alert" className="text-danger text-[12px]">
              {errors.name.message}
            </p>
          ) : null}
        </div>

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
          <Label htmlFor="password" className={labelClass}>
            Senha
          </Label>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            placeholder="Crie uma senha forte"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "password-error" : "password-hint"}
            disabled={isSubmitting}
            className={fieldClass}
            {...register("password")}
          />
          {errors.password ? (
            <p id="password-error" role="alert" className="text-danger text-[12px]">
              {errors.password.message}
            </p>
          ) : (
            <p id="password-hint" className="font-mono text-[10px] tracking-[0.08em] text-white/35">
              {PASSWORD_HINT}
            </p>
          )}
        </div>

        <CommandButton type="submit" loading={isSubmitting} className="mt-1">
          Iniciar lançamento
        </CommandButton>
      </form>

      <p className="mt-6 text-center font-mono text-[11px] tracking-[0.1em] text-white/40">
        Já tem acesso?{" "}
        <Link href="/login" className="text-brand transition-colors hover:text-white">
          Entrar no comando
        </Link>
      </p>

      <div className="mt-8 flex items-center justify-center gap-2 border-t border-white/8 pt-6">
        <span className="bg-brand size-1.5 rounded-full" />
        <span className="font-mono text-[10px] tracking-[0.2em] text-white/30 uppercase">
          14 dias · sem cartão · dados nunca compartilhados
        </span>
      </div>
    </div>
  );
}
