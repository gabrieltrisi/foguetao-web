"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Combobox, MultiSelect } from "@/components/ui/combobox";
import { CurrencyInput } from "@/components/ui/currency-input";
import { NumberInput } from "@/components/ui/number-input";
import { DatePicker } from "@/components/ui/date-picker";
import { AssigneeSelector } from "@/components/business/assignee-selector";
import { FormPageLayout } from "@/components/patterns/page-patterns";
import { useToast } from "@/components/ui/toast";
import { pipelineStages } from "@/mocks/crm/deals";
import { organizations } from "@/mocks/crm/organizations";

const TAGS = ["Upsell", "Renovação", "Enterprise", "Inbound", "Indicação", "Expansão"].map((t) => ({
  value: t,
  label: t,
}));
const PEOPLE = [
  { id: "cr", name: "Camila Ribeiro" },
  { id: "rm", name: "Rafael Monteiro" },
  { id: "ba", name: "Bruno Alcântara" },
  { id: "lp", name: "Larissa Prado" },
];

export function DealForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [org, setOrg] = React.useState("");
  const [stage, setStage] = React.useState<string>(pipelineStages[0].id);
  const [value, setValue] = React.useState(0);
  const [prob, setProb] = React.useState(20);
  const [owner, setOwner] = React.useState("cr");
  const [tags, setTags] = React.useState<string[]>([]);
  const [close, setClose] = React.useState<Date | undefined>();
  const [saving, setSaving] = React.useState(false);

  const orgOptions = organizations.map((o) => ({ value: o.id, label: o.name }));
  const stageOptions = pipelineStages.map((s) => ({ value: s.id, label: s.label }));

  async function handleSave() {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    toast({ title: "Oportunidade criada (mock)", variant: "success" });
    router.push("/deals");
  }

  return (
    <FormPageLayout
      title="Nova oportunidade"
      description="Registre uma nova oportunidade no pipeline."
      back={{ href: "/deals", label: "Oportunidades" }}
      footer={
        <>
          <Button asChild variant="secondary" size="sm">
            <Link href="/deals">Cancelar</Link>
          </Button>
          <Button size="sm" loading={saving} onClick={handleSave}>
            Salvar oportunidade
          </Button>
        </>
      }
    >
      <Card className="p-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField id="df-title" label="Título" required className="sm:col-span-2">
            {(p) => <Input placeholder="Ex.: Plano Performance anual" {...p} />}
          </FormField>
          <FormField id="df-org" label="Organização">
            {(p) => <Combobox id={p.id} options={orgOptions} value={org} onValueChange={setOrg} placeholder="Selecione" />}
          </FormField>
          <FormField id="df-contact" label="Contato">
            {(p) => <Input placeholder="Nome do contato" {...p} />}
          </FormField>
          <FormField id="df-stage" label="Etapa">
            {(p) => <Combobox id={p.id} options={stageOptions} value={stage} onValueChange={setStage} />}
          </FormField>
          <FormField id="df-value" label="Valor">
            {(p) => <CurrencyInput id={p.id} value={value} onValueChange={setValue} />}
          </FormField>
          <FormField id="df-prob" label="Probabilidade (%)">
            {() => <NumberInput value={prob} onValueChange={setProb} min={0} max={100} step={5} />}
          </FormField>
          <FormField id="df-close" label="Data de fechamento">
            {(p) => <DatePicker id={p.id} value={close} onValueChange={setClose} />}
          </FormField>
          <FormField id="df-owner" label="Responsável">
            {(p) => <AssigneeSelector id={p.id} people={PEOPLE} value={owner} onValueChange={setOwner} />}
          </FormField>
          <FormField id="df-tags" label="Tags">
            {(p) => <MultiSelect id={p.id} options={TAGS} value={tags} onValueChange={setTags} />}
          </FormField>
        </div>
      </Card>
    </FormPageLayout>
  );
}
