"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Combobox } from "@/components/ui/combobox";
import { AssigneeSelector } from "@/components/business/assignee-selector";
import { FormPageLayout } from "@/components/patterns/page-patterns";
import { useToast } from "@/components/ui/toast";

const SEGMENTS = ["Tecnologia", "Varejo", "Saúde", "Serviços", "Educação", "Indústria"].map((s) => ({
  value: s,
  label: s,
}));
const STATUS = [
  { value: "ativo", label: "Ativo" },
  { value: "prospect", label: "Prospect" },
  { value: "inativo", label: "Inativo" },
];
const PEOPLE = [
  { id: "cr", name: "Camila Ribeiro" },
  { id: "rm", name: "Rafael Monteiro" },
  { id: "ba", name: "Bruno Alcântara" },
  { id: "lp", name: "Larissa Prado" },
];

export function OrganizationForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [segment, setSegment] = React.useState("Tecnologia");
  const [status, setStatus] = React.useState("prospect");
  const [owner, setOwner] = React.useState("cr");
  const [saving, setSaving] = React.useState(false);

  async function handleSave() {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    toast({ title: "Organização criada (mock)", variant: "success" });
    router.push("/organizations");
  }

  return (
    <FormPageLayout
      title="Nova organização"
      description="Cadastre uma nova empresa."
      back={{ href: "/organizations", label: "Organizações" }}
      footer={
        <>
          <Button asChild variant="secondary" size="sm">
            <Link href="/organizations">Cancelar</Link>
          </Button>
          <Button size="sm" loading={saving} onClick={handleSave}>
            Salvar organização
          </Button>
        </>
      }
    >
      <Card className="p-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField id="of-name" label="Nome" required>
            {(p) => <Input placeholder="Nome da empresa" {...p} />}
          </FormField>
          <FormField id="of-segment" label="Segmento">
            {(p) => <Combobox id={p.id} options={SEGMENTS} value={segment} onValueChange={setSegment} />}
          </FormField>
          <FormField id="of-site" label="Site">
            {(p) => <Input placeholder="empresa.com.br" {...p} />}
          </FormField>
          <FormField id="of-local" label="Localização">
            {(p) => <Input placeholder="Cidade, UF" {...p} />}
          </FormField>
          <FormField id="of-owner" label="Responsável">
            {(p) => <AssigneeSelector id={p.id} people={PEOPLE} value={owner} onValueChange={setOwner} />}
          </FormField>
          <FormField id="of-status" label="Status">
            {(p) => <Combobox id={p.id} options={STATUS} value={status} onValueChange={setStatus} />}
          </FormField>
        </div>
      </Card>
    </FormPageLayout>
  );
}
