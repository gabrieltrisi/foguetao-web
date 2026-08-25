"use client";

import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { leadSchema, type LeadFormValues } from "../utils/validation";

/**
 * Captação do lead — SÓ após o diagnóstico. Validação com Zod + react-hook-form.
 * Os erros de entrega ficam no seam do servidor; aqui tratamos só a submissão.
 */
export function LeadForm({
  onSubmit,
  submitting,
  error,
}: {
  onSubmit: (values: LeadFormValues) => void;
  submitting: boolean;
  error: string | null;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    mode: "onBlur",
    defaultValues: { name: "", email: "", whatsapp: "", company: "" },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="pb-2">
      <h2 className="font-display text-[clamp(1.5rem,5vw,2rem)] font-bold leading-tight text-white">
        Seu plano de ação está pronto
      </h2>
      <p className="mt-2 text-[14px] leading-relaxed text-white/55">
        Deixe seus dados para receber o diagnóstico completo e liberar seu teste de 14 dias.
      </p>

      <div className="mt-6 flex flex-col gap-4">
        <Field label="Nome" error={errors.name?.message}>
          <input
            {...register("name")}
            type="text"
            autoComplete="name"
            placeholder="Como podemos te chamar?"
            className={inputCls(!!errors.name)}
          />
        </Field>
        <Field label="E-mail" error={errors.email?.message}>
          <input
            {...register("email")}
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="voce@empresa.com.br"
            className={inputCls(!!errors.email)}
          />
        </Field>
        <Field label="WhatsApp" error={errors.whatsapp?.message}>
          <input
            {...register("whatsapp")}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="(11) 99999-0000"
            className={inputCls(!!errors.whatsapp)}
          />
        </Field>
        <Field label="Empresa" error={errors.company?.message}>
          <input
            {...register("company")}
            type="text"
            autoComplete="organization"
            placeholder="Nome do seu negócio"
            className={inputCls(!!errors.company)}
          />
        </Field>
      </div>

      {error ? (
        <p role="alert" className="mt-4 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-[13px] text-[#fca5a5]">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="mt-6 flex min-h-13 w-full items-center justify-center gap-2 rounded-xl bg-brand px-6 text-[15px] font-semibold text-white shadow-[0_10px_30px_-10px_rgba(224,7,15,0.6)] transition-colors hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0f12] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {submitting ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden /> Enviando…
          </>
        ) : (
          "Ver meu diagnóstico completo"
        )}
      </button>

      <p className="mt-3 flex items-center justify-center gap-1.5 text-[12px] text-white/40">
        <Lock className="size-3" aria-hidden />
        Seus dados ficam seguros. Sem spam.
      </p>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-white/70">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-[12px] text-[#fca5a5]">{error}</span> : null}
    </label>
  );
}

function inputCls(hasError: boolean) {
  return cn(
    "h-12 w-full rounded-lg border bg-white/[0.03] px-3.5 text-[15px] text-white placeholder:text-white/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
    hasError ? "border-danger/50" : "border-white/10 hover:border-white/20",
  );
}
