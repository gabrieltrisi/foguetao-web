"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Combobox } from "@/components/ui/combobox";
import { FormField } from "@/components/ui/form-field";
import { useToast } from "@/components/ui/toast";
import { company, companyKpis, companyStatusLabel, companyStatusTone } from "@/mocks/admin/company";

const timezones = ["America/Sao_Paulo (GMT-3)", "America/New_York (GMT-5)", "Europe/Lisbon (GMT+0)"].map((v) => ({ value: v, label: v }));
const languages = ["Português (Brasil)", "English (US)", "Español"].map((v) => ({ value: v, label: v }));
const currencies = ["Real (BRL)", "Dólar (USD)", "Euro (EUR)"].map((v) => ({ value: v, label: v }));
const segments = ["Agência de Marketing", "E-commerce", "Serviços", "Educação", "Saúde"].map((v) => ({ value: v, label: v }));

export function CompanyGeneral() {
  const { toast } = useToast();
  const [form, setForm] = React.useState(company);
  const set = (k: keyof typeof company) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="flex flex-col gap-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {companyKpis.map((k) => (
          <Card key={k.label} className="p-4">
            <p className="text-caption font-medium uppercase tracking-wide text-ink-2">{k.label}</p>
            <p className="mt-1 font-display text-h2 font-bold text-ink tabular-nums">{k.value}</p>
          </Card>
        ))}
      </div>

      <Card className="flex flex-col gap-5 p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-h3 font-semibold text-ink">Dados da empresa</h2>
            <Badge tone={companyStatusTone[form.status]}>{companyStatusLabel[form.status]}</Badge>
          </div>
          <Badge tone="brand">Plano {form.plan}</Badge>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="c-name" label="Nome">{(p) => <Input id={p.id} value={form.name} onChange={(e) => set("name")(e.target.value)} />}</FormField>
          <FormField id="c-legal" label="Razão social">{(p) => <Input id={p.id} value={form.legalName} onChange={(e) => set("legalName")(e.target.value)} />}</FormField>
          <FormField id="c-doc" label="Documento (CNPJ)">{(p) => <Input id={p.id} value={form.document} onChange={(e) => set("document")(e.target.value)} />}</FormField>
          <FormField id="c-phone" label="Telefone">{(p) => <Input id={p.id} value={form.phone} onChange={(e) => set("phone")(e.target.value)} />}</FormField>
          <FormField id="c-email" label="E-mail">{(p) => <Input id={p.id} type="email" value={form.email} onChange={(e) => set("email")(e.target.value)} />}</FormField>
          <FormField id="c-site" label="Site">{(p) => <Input id={p.id} value={form.site} onChange={(e) => set("site")(e.target.value)} />}</FormField>
          <FormField id="c-tz" label="Fuso horário">{(p) => <Combobox id={p.id} options={timezones} value={form.timezone} onValueChange={set("timezone")} />}</FormField>
          <FormField id="c-lang" label="Idioma">{(p) => <Combobox id={p.id} options={languages} value={form.language} onValueChange={set("language")} />}</FormField>
          <FormField id="c-cur" label="Moeda">{(p) => <Combobox id={p.id} options={currencies} value={form.currency} onValueChange={set("currency")} />}</FormField>
          <FormField id="c-seg" label="Segmento">{(p) => <Combobox id={p.id} options={segments} value={form.segment} onValueChange={set("segment")} />}</FormField>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-line pt-5">
          <Button variant="secondary" onClick={() => setForm(company)}>Cancelar</Button>
          <Button onClick={() => toast({ title: "Dados salvos (mock)", variant: "success" })}>Salvar alterações</Button>
        </div>
      </Card>
    </div>
  );
}
