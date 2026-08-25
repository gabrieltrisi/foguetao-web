"use client";

import * as React from "react";
import { Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Combobox } from "@/components/ui/combobox";
import { FormField } from "@/components/ui/form-field";
import { ErrorState } from "@/components/ui/error-state";
import { useToast } from "@/components/ui/toast";
import { useSession } from "@/providers/session-provider";
import { useCompany, useUpdateCompany } from "@/hooks/company/use-company";
import { PERMISSIONS } from "@/lib/auth/permissions";
import {
  CURRENCY_OPTIONS,
  LOCALE_OPTIONS,
  TIMEZONE_OPTIONS,
  companyPlanMeta,
  companyStatusMeta,
  formatDate,
  messageForCompanyError,
  withCurrent,
} from "@/lib/company/company";
import { isApiError } from "@/types/api/error";
import type { ApiCompany, UpdateCompanyInput } from "@/types/api/company";

interface FormState {
  name: string;
  legalName: string;
  document: string;
  email: string;
  phone: string;
  timezone: string;
  locale: string;
  currency: string;
}

function toForm(c: ApiCompany): FormState {
  return {
    name: c.name,
    legalName: c.legalName ?? "",
    document: c.document ?? "",
    email: c.email ?? "",
    phone: c.phone ?? "",
    timezone: c.timezone,
    locale: c.locale,
    currency: c.currency,
  };
}

export function CompanyGeneral() {
  const { can } = useSession();
  const { data: company, isLoading, isError, error, refetch } = useCompany();

  if (!can(PERMISSIONS.COMPANY_READ)) {
    return (
      <p className="py-10 text-center text-body2 text-ink-3">
        Você não tem permissão para ver os dados desta empresa.
      </p>
    );
  }
  if (isLoading) {
    return <p className="py-10 text-center text-body2 text-ink-3">Carregando dados da empresa…</p>;
  }
  if (isError || !company) {
    const notFound = isApiError(error) && error.statusCode === 404;
    return (
      <ErrorState
        title={notFound ? "Empresa não encontrada." : "Não foi possível carregar a empresa."}
        message={isApiError(error) ? messageForCompanyError(error) : undefined}
        onRetry={notFound ? undefined : () => refetch()}
      />
    );
  }

  // `key` remonta o formulário quando a empresa ativa muda — sem efeito.
  return <CompanyGeneralForm key={company.id} company={company} />;
}

function CompanyGeneralForm({ company }: { company: ApiCompany }) {
  const { toast } = useToast();
  const { can } = useSession();
  const update = useUpdateCompany();
  const initial = toForm(company);
  const [form, setForm] = React.useState<FormState>(initial);
  const set = (k: keyof FormState) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const canEdit = can(PERMISSIONS.COMPANY_UPDATE);
  const status = companyStatusMeta[company.status];
  const dirty = (Object.keys(initial) as (keyof FormState)[]).some((k) => form[k] !== initial[k]);

  async function handleSave() {
    // Envia SÓ o que mudou: o backend audita os campos alterados, e mandar
    // tudo sempre geraria ruído. String vazia é omitida — o backend não aceita
    // "" para limpar um campo opcional.
    const payload: UpdateCompanyInput = {};
    for (const k of Object.keys(initial) as (keyof FormState)[]) {
      if (form[k] !== initial[k]) {
        const value = form[k].trim();
        if (value) payload[k] = value;
      }
    }
    if (Object.keys(payload).length === 0) return;

    try {
      await update.mutateAsync(payload);
      toast({ title: "Dados salvos", variant: "success" });
    } catch (error) {
      toast({ title: messageForCompanyError(error), variant: "error" });
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <Card className="flex flex-col gap-5 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-h3 font-semibold text-ink">Dados da empresa</h2>
            <Badge tone={status.tone}>{status.label}</Badge>
          </div>
          <Badge tone="brand">Plano {companyPlanMeta[company.plan].label}</Badge>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="c-name" label="Nome" required>
            {(p) => (
              <Input
                value={form.name}
                onChange={(e) => set("name")(e.target.value)}
                disabled={!canEdit}
                {...p}
              />
            )}
          </FormField>
          <FormField
            id="c-slug"
            label="Identificador"
            description="Definido na criação e imutável."
          >
            {(p) => <Input value={company.slug} readOnly disabled {...p} />}
          </FormField>
          <FormField id="c-legal" label="Razão social">
            {(p) => (
              <Input
                value={form.legalName}
                onChange={(e) => set("legalName")(e.target.value)}
                disabled={!canEdit}
                {...p}
              />
            )}
          </FormField>
          <FormField id="c-doc" label="Documento (CNPJ)">
            {(p) => (
              <Input
                value={form.document}
                onChange={(e) => set("document")(e.target.value)}
                disabled={!canEdit}
                {...p}
              />
            )}
          </FormField>
          <FormField id="c-phone" label="Telefone">
            {(p) => (
              <Input
                value={form.phone}
                onChange={(e) => set("phone")(e.target.value)}
                disabled={!canEdit}
                {...p}
              />
            )}
          </FormField>
          <FormField id="c-email" label="E-mail">
            {(p) => (
              <Input
                type="email"
                value={form.email}
                onChange={(e) => set("email")(e.target.value)}
                disabled={!canEdit}
                {...p}
              />
            )}
          </FormField>
          <FormField id="c-tz" label="Fuso horário">
            {(p) => (
              <Combobox
                id={p.id}
                options={withCurrent(TIMEZONE_OPTIONS, company.timezone)}
                value={form.timezone}
                onValueChange={set("timezone")}
                disabled={!canEdit}
              />
            )}
          </FormField>
          <FormField id="c-lang" label="Idioma">
            {(p) => (
              <Combobox
                id={p.id}
                options={withCurrent(LOCALE_OPTIONS, company.locale)}
                value={form.locale}
                onValueChange={set("locale")}
                disabled={!canEdit}
              />
            )}
          </FormField>
          <FormField id="c-cur" label="Moeda">
            {(p) => (
              <Combobox
                id={p.id}
                options={withCurrent(CURRENCY_OPTIONS, company.currency)}
                value={form.currency}
                onValueChange={set("currency")}
                disabled={!canEdit}
              />
            )}
          </FormField>
          <FormField id="c-created" label="Criada em">
            {(p) => <Input value={formatDate(company.createdAt)} readOnly disabled {...p} />}
          </FormField>
        </div>

        {canEdit ? (
          <div className="flex items-center justify-end gap-2 border-t border-line pt-5">
            <Button variant="secondary" disabled={!dirty} onClick={() => setForm(initial)}>
              Cancelar
            </Button>
            <Button
              loading={update.isPending}
              disabled={!dirty || update.isPending}
              onClick={handleSave}
            >
              Salvar alterações
            </Button>
          </div>
        ) : (
          <div className="flex items-start gap-2 border-t border-line pt-5 text-body2 text-ink-2">
            <Info className="mt-0.5 size-4 shrink-0 text-info" aria-hidden />
            <span>
              Você tem acesso de leitura a estes dados. Alterá-los exige permissão de edição.
            </span>
          </div>
        )}
      </Card>
    </div>
  );
}
