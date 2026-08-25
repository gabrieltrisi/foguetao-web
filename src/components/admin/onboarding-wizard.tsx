"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Building2, Rocket } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { useSession } from "@/providers/session-provider";
import { useCreateCompany } from "@/hooks/company/use-company";
import { isApiError } from "@/types/api/error";
import {
  createCompanySchema,
  timezoneOptions,
  DEFAULT_TIMEZONE,
  type CreateCompanyFormValues,
} from "@/lib/validations/company";

function messageForError(error: unknown): string {
  if (isApiError(error)) {
    if (error.isUnavailable) return "Servidor indisponível. Tente novamente em instantes.";
    if (error.statusCode === 429)
      return "Muitas empresas criadas em pouco tempo. Aguarde alguns minutos.";
    if (error.statusCode === 400) return "Dados inválidos. Revise o nome da empresa.";
  }
  return "Não foi possível criar a empresa. Tente novamente.";
}

/**
 * Onboarding — criação da PRIMEIRA empresa do usuário. Enxuto e real: cria a
 * empresa via `POST /api/companies` (o criador vira OWNER), define-a como ativa
 * e leva ao dashboard. Sem passos cosméticos: coleta apenas o que o backend
 * realmente persiste.
 */
export function OnboardingWizard() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useSession();
  const createCompany = useCreateCompany();
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateCompanyFormValues>({
    resolver: zodResolver(createCompanySchema),
    defaultValues: { name: "", phone: "", timezone: DEFAULT_TIMEZONE },
  });

  async function onSubmit(values: CreateCompanyFormValues) {
    setSubmitError(null);
    try {
      await createCompany.mutateAsync({
        name: values.name.trim(),
        phone: values.phone?.trim() ? values.phone.trim() : undefined,
        timezone: values.timezone,
      });
      toast({
        title: "Empresa criada!",
        description: "Tudo pronto — abrindo seu painel.",
        variant: "success",
      });
      router.replace("/dashboard");
    } catch (error) {
      setSubmitError(messageForError(error));
    }
  }

  const firstName = user?.name?.trim().split(/\s+/)[0];

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <Card className="flex flex-col gap-6 p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
            <Rocket className="size-6" aria-hidden />
          </span>
          <div>
            <h2 className="font-display text-h3 font-semibold text-ink">
              {firstName ? `Vamos lá, ${firstName}!` : "Vamos lá!"}
            </h2>
            <p className="text-body2 text-ink-2">
              Crie sua empresa para começar a usar o Foguetão. Você poderá ajustar todos os
              dados depois em Configurações.
            </p>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {submitError ? (
            <motion.div
              role="alert"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 overflow-hidden rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-body2 text-danger"
            >
              {submitError}
            </motion.div>
          ) : null}
        </AnimatePresence>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-2">
            <Label htmlFor="company-name">Nome da empresa *</Label>
            <Input
              id="company-name"
              placeholder="Ex.: Foguetão Marketing"
              autoFocus
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "company-name-error" : undefined}
              disabled={isSubmitting}
              {...register("name")}
            />
            {errors.name ? (
              <p id="company-name-error" role="alert" className="text-caption text-danger">
                {errors.name.message}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="company-phone">Telefone (opcional)</Label>
            <Input
              id="company-phone"
              type="tel"
              placeholder="+55 11 99999-0000"
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? "company-phone-error" : undefined}
              disabled={isSubmitting}
              {...register("phone")}
            />
            {errors.phone ? (
              <p id="company-phone-error" role="alert" className="text-caption text-danger">
                {errors.phone.message}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="company-timezone">Fuso horário</Label>
            <Controller
              name="timezone"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting}>
                  <SelectTrigger id="company-timezone">
                    <SelectValue placeholder="Selecione o fuso" />
                  </SelectTrigger>
                  <SelectContent>
                    {timezoneOptions.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <Button type="submit" className="mt-1 w-full" loading={isSubmitting}>
            <Building2 className="size-4" aria-hidden />
            Criar empresa e continuar
            <ArrowRight className="size-4" aria-hidden />
          </Button>
        </form>
      </Card>

      <p className="text-center text-caption text-ink-3">
        Ao criar a empresa você se torna o administrador (OWNER) da conta.
      </p>
    </div>
  );
}
