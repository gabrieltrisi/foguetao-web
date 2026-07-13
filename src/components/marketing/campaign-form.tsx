"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { DateRange } from "react-day-picker";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Combobox } from "@/components/ui/combobox";
import { CurrencyInput } from "@/components/ui/currency-input";
import { DateRangePicker } from "@/components/ui/date-picker";
import { FormPageLayout } from "@/components/patterns/page-patterns";
import { useToast } from "@/components/ui/toast";

const CHANNELS = [
  { value: "meta", label: "Meta Ads" },
  { value: "google", label: "Google Ads" },
  { value: "tiktok", label: "TikTok Ads" },
  { value: "instagram", label: "Instagram" },
  { value: "email", label: "E-mail" },
  { value: "afiliado", label: "Afiliado" },
];
const OBJECTIVES = [
  { value: "conversao", label: "Conversão" },
  { value: "trafego", label: "Tráfego" },
  { value: "leads", label: "Leads" },
  { value: "vendas", label: "Vendas" },
  { value: "reconhecimento", label: "Reconhecimento" },
];

export function CampaignForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [channel, setChannel] = React.useState("meta");
  const [objective, setObjective] = React.useState("conversao");
  const [budget, setBudget] = React.useState(6000);
  const [range, setRange] = React.useState<DateRange | undefined>();
  const [saving, setSaving] = React.useState(false);

  async function handleSave() {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    toast({ title: "Campanha criada (mock)", variant: "success" });
    router.push("/campaigns");
  }

  return (
    <FormPageLayout
      title="Nova campanha"
      description="Configure uma nova campanha de marketing."
      back={{ href: "/campaigns", label: "Campanhas" }}
      footer={
        <>
          <Button asChild variant="secondary" size="sm"><Link href="/campaigns">Cancelar</Link></Button>
          <Button size="sm" loading={saving} onClick={handleSave}>Salvar campanha</Button>
        </>
      }
    >
      <Card className="p-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField id="cf-name" label="Nome" required className="sm:col-span-2">
            {(p) => <Input placeholder="Ex.: Black Week — Conversão" {...p} />}
          </FormField>
          <FormField id="cf-channel" label="Canal">
            {(p) => <Combobox id={p.id} options={CHANNELS} value={channel} onValueChange={setChannel} />}
          </FormField>
          <FormField id="cf-obj" label="Objetivo">
            {(p) => <Combobox id={p.id} options={OBJECTIVES} value={objective} onValueChange={setObjective} />}
          </FormField>
          <FormField id="cf-budget" label="Orçamento">
            {(p) => <CurrencyInput id={p.id} value={budget} onValueChange={setBudget} />}
          </FormField>
          <FormField id="cf-period" label="Período">
            {(p) => <DateRangePicker id={p.id} value={range} onValueChange={setRange} />}
          </FormField>
        </div>
      </Card>
    </FormPageLayout>
  );
}
