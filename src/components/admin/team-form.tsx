"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Combobox } from "@/components/ui/combobox";
import { FormField } from "@/components/ui/form-field";
import { FormPageLayout } from "@/components/patterns/page-patterns";
import { useToast } from "@/components/ui/toast";
import { roles } from "@/mocks/admin/roles";

const companies = ["Matriz SP", "Filial RJ", "Filial MG"].map((v) => ({ value: v, label: v }));

export function TeamForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState("comercial");
  const [org, setOrg] = React.useState("Matriz SP");
  const [twoFactor, setTwoFactor] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  const roleOptions = roles.map((r) => ({ value: r.id, label: r.name }));

  const save = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    toast({ title: "Convite enviado (mock)", variant: "success" });
    router.push("/team");
  };

  return (
    <FormPageLayout
      title="Criar usuário"
      description="Convide um novo membro para a organização."
      back={{ href: "/team", label: "Equipe" }}
      footer={
        <>
          <Button variant="secondary" onClick={() => router.push("/team")}>Cancelar</Button>
          <Button loading={saving} onClick={save} disabled={!name || !email}>Enviar convite</Button>
        </>
      }
    >
      <Card className="flex flex-col gap-4 p-5">
        <FormField id="t-name" label="Nome completo" required>{(p) => <Input id={p.id} value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Ana Martins" />}</FormField>
        <FormField id="t-email" label="E-mail" required>{(p) => <Input id={p.id} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ana@empresa.com" />}</FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="t-role" label="Papel">{(p) => <Combobox id={p.id} options={roleOptions} value={role} onValueChange={setRole} />}</FormField>
          <FormField id="t-org" label="Empresa">{(p) => <Combobox id={p.id} options={companies} value={org} onValueChange={setOrg} />}</FormField>
        </div>
        <div className="flex items-center justify-between gap-3 rounded-lg border border-line bg-surface p-3">
          <div>
            <p className="text-body2 font-medium text-ink">Exigir 2FA</p>
            <p className="text-caption text-ink-3">O usuário deverá configurar a autenticação em duas etapas no primeiro acesso.</p>
          </div>
          <Switch checked={twoFactor} onCheckedChange={setTwoFactor} aria-label="Exigir 2FA" />
        </div>
      </Card>
    </FormPageLayout>
  );
}
