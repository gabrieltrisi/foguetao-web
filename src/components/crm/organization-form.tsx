"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Combobox } from "@/components/ui/combobox";
import { FormPageLayout } from "@/components/patterns/page-patterns";
import { ErrorState } from "@/components/ui/error-state";
import { useToast } from "@/components/ui/toast";
import { useOrganization, useCreateOrganization, useUpdateOrganization } from "@/hooks/crm/use-organizations";
import { organizationSizeLabel } from "@/lib/crm/display";
import { isApiError } from "@/types/api/error";

const SIZE_OPTIONS = [
  { value: "", label: "Não informado" },
  ...(Object.keys(organizationSizeLabel) as (keyof typeof organizationSizeLabel)[]).map((k) => ({
    value: k,
    label: organizationSizeLabel[k],
  })),
];

type FormState = {
  name: string;
  legalName: string;
  document: string;
  email: string;
  phone: string;
  website: string;
  industry: string;
  size: string;
};

const empty: FormState = {
  name: "",
  legalName: "",
  document: "",
  email: "",
  phone: "",
  website: "",
  industry: "",
  size: "",
};

function messageFor(error: unknown): string {
  if (isApiError(error)) {
    if (error.code === "ORGANIZATION_DOCUMENT_ALREADY_EXISTS") return "Já existe uma organização com este documento.";
    if (error.code === "VALIDATION_ERROR") return "Verifique os campos e tente novamente.";
    if (error.isForbidden) return "Você não tem permissão para esta ação.";
    return error.message;
  }
  return "Não foi possível salvar a organização.";
}

export function OrganizationForm({ organizationId }: { organizationId?: string }) {
  const isEdit = Boolean(organizationId);
  const detail = useOrganization(organizationId ?? "");

  if (isEdit) {
    if (detail.isLoading) return <p className="py-16 text-center text-body2 text-ink-3">Carregando…</p>;
    if (detail.isError || !detail.data) {
      const notFound = isApiError(detail.error) && detail.error.statusCode === 404;
      return <ErrorState title={notFound ? "Organização não encontrada." : "Falha ao carregar a organização."} onRetry={notFound ? undefined : () => detail.refetch()} />;
    }
  }

  const o = detail.data;
  const initial: FormState = o
    ? {
        name: o.name,
        legalName: o.legalName ?? "",
        document: o.document ?? "",
        email: o.email ?? "",
        phone: o.phone ?? "",
        website: o.website ?? "",
        industry: o.industry ?? "",
        size: o.size ?? "",
      }
    : empty;

  return <OrganizationFormFields key={organizationId ?? "new"} initial={initial} organizationId={organizationId} />;
}

function OrganizationFormFields({ initial, organizationId }: { initial: FormState; organizationId?: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const isEdit = Boolean(organizationId);
  const create = useCreateOrganization();
  const update = useUpdateOrganization(organizationId ?? "");

  const [form, setForm] = React.useState<FormState>(initial);
  const set = (k: keyof FormState) => (v: string) => setForm((f) => ({ ...f, [k]: v }));
  const pending = create.isPending || update.isPending;
  const backHref = isEdit && organizationId ? `/organizations/${organizationId}` : "/organizations";

  async function handleSave() {
    const payload = {
      name: form.name.trim(),
      legalName: form.legalName.trim() || undefined,
      document: form.document.trim() || undefined,
      email: form.email.trim() || undefined,
      phone: form.phone.trim() || undefined,
      website: form.website.trim() || undefined,
      industry: form.industry.trim() || undefined,
      size: form.size || undefined,
    };
    try {
      if (isEdit && organizationId) {
        await update.mutateAsync(payload);
        toast({ title: "Organização atualizada", variant: "success" });
        router.push(`/organizations/${organizationId}`);
      } else {
        const created = await create.mutateAsync(payload);
        toast({ title: "Organização criada", variant: "success" });
        router.push(`/organizations/${created.id}`);
      }
    } catch (error) {
      toast({ title: messageFor(error), variant: "error" });
    }
  }

  return (
    <FormPageLayout
      title={isEdit ? "Editar organização" : "Nova organização"}
      description={isEdit ? "Atualize os dados da organização." : "Cadastre uma nova empresa."}
      back={{ href: backHref, label: "Organizações" }}
      footer={
        <>
          <Button asChild variant="secondary" size="sm">
            <Link href={backHref}>Cancelar</Link>
          </Button>
          <Button size="sm" loading={pending} disabled={form.name.trim().length < 2} onClick={handleSave}>
            {isEdit ? "Salvar alterações" : "Salvar organização"}
          </Button>
        </>
      }
    >
      <Card className="p-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField id="of-name" label="Nome" required>
            {(p) => <Input placeholder="Nome da empresa" value={form.name} onChange={(e) => set("name")(e.target.value)} {...p} />}
          </FormField>
          <FormField id="of-legal" label="Razão social">
            {(p) => <Input value={form.legalName} onChange={(e) => set("legalName")(e.target.value)} {...p} />}
          </FormField>
          <FormField id="of-doc" label="Documento (CNPJ)">
            {(p) => <Input value={form.document} onChange={(e) => set("document")(e.target.value)} {...p} />}
          </FormField>
          <FormField id="of-industry" label="Segmento">
            {(p) => <Input placeholder="Ex.: Tecnologia" value={form.industry} onChange={(e) => set("industry")(e.target.value)} {...p} />}
          </FormField>
          <FormField id="of-email" label="E-mail">
            {(p) => <Input type="email" value={form.email} onChange={(e) => set("email")(e.target.value)} {...p} />}
          </FormField>
          <FormField id="of-phone" label="Telefone">
            {(p) => <Input value={form.phone} onChange={(e) => set("phone")(e.target.value)} {...p} />}
          </FormField>
          <FormField id="of-website" label="Website">
            {(p) => <Input placeholder="https://" value={form.website} onChange={(e) => set("website")(e.target.value)} {...p} />}
          </FormField>
          <FormField id="of-size" label="Porte">
            {(p) => <Combobox id={p.id} options={SIZE_OPTIONS} value={form.size} onValueChange={set("size")} />}
          </FormField>
        </div>
      </Card>
    </FormPageLayout>
  );
}
