"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { PhoneInput } from "@/components/ui/phone-input";
import { Combobox } from "@/components/ui/combobox";
import { MultiSelect } from "@/components/ui/combobox";
import { AssigneeSelector } from "@/components/business/assignee-selector";
import { FormPageLayout } from "@/components/patterns/page-patterns";
import { useToast } from "@/components/ui/toast";
import { organizations } from "@/mocks/crm/organizations";

const STATUS = [
  { value: "lead", label: "Lead" },
  { value: "ativo", label: "Ativo" },
  { value: "cliente", label: "Cliente" },
  { value: "inativo", label: "Inativo" },
];
const TAGS = ["VIP", "Enterprise", "Inbound", "Trial", "Parceiro", "Evento", "SMB", "Newsletter"].map(
  (t) => ({ value: t, label: t }),
);
const PEOPLE = [
  { id: "cr", name: "Camila Ribeiro" },
  { id: "rm", name: "Rafael Monteiro" },
  { id: "ba", name: "Bruno Alcântara" },
  { id: "lp", name: "Larissa Prado" },
];

export function ContactForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [org, setOrg] = React.useState("");
  const [status, setStatus] = React.useState("lead");
  const [tags, setTags] = React.useState<string[]>([]);
  const [owner, setOwner] = React.useState("cr");
  const [saving, setSaving] = React.useState(false);

  const orgOptions = organizations.map((o) => ({ value: o.id, label: o.name }));

  async function handleSave() {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    toast({ title: "Contato criado (mock)", variant: "success" });
    router.push("/contacts");
  }

  return (
    <FormPageLayout
      title="Novo contato"
      description="Cadastre um novo contato na sua base."
      back={{ href: "/contacts", label: "Contatos" }}
      footer={
        <>
          <Button asChild variant="secondary" size="sm">
            <Link href="/contacts">Cancelar</Link>
          </Button>
          <Button size="sm" loading={saving} onClick={handleSave}>
            Salvar contato
          </Button>
        </>
      }
    >
      <Card className="p-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField id="cf-name" label="Nome" required>
            {(p) => <Input placeholder="Nome completo" {...p} />}
          </FormField>
          <FormField id="cf-role" label="Cargo">
            {(p) => <Input placeholder="Ex.: Gerente comercial" {...p} />}
          </FormField>
          <FormField id="cf-email" label="E-mail" required>
            {(p) => <Input type="email" placeholder="email@empresa.com.br" {...p} />}
          </FormField>
          <FormField id="cf-phone" label="Telefone">
            {(p) => <PhoneInput {...p} />}
          </FormField>
          <FormField id="cf-org" label="Organização">
            {(p) => (
              <Combobox
                id={p.id}
                options={orgOptions}
                value={org}
                onValueChange={setOrg}
                placeholder="Selecione a organização"
              />
            )}
          </FormField>
          <FormField id="cf-status" label="Status">
            {(p) => <Combobox id={p.id} options={STATUS} value={status} onValueChange={setStatus} />}
          </FormField>
          <FormField id="cf-owner" label="Responsável">
            {(p) => <AssigneeSelector id={p.id} people={PEOPLE} value={owner} onValueChange={setOwner} />}
          </FormField>
          <FormField id="cf-tags" label="Tags">
            {(p) => <MultiSelect id={p.id} options={TAGS} value={tags} onValueChange={setTags} />}
          </FormField>
        </div>
      </Card>
    </FormPageLayout>
  );
}
