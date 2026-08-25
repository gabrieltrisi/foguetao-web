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
import { FormPageLayout } from "@/components/patterns/page-patterns";
import { ErrorState } from "@/components/ui/error-state";
import { useToast } from "@/components/ui/toast";
import { useCreateContact, useUpdateContact } from "@/hooks/crm/use-contacts";
import { useContact } from "@/hooks/crm/use-contact-detail";
import { useOrganizations } from "@/hooks/crm/use-organizations";
import { contactStatusOptions } from "@/lib/crm/display";
import { isApiError, ErrorCode } from "@/types/api/error";

const STATUS = contactStatusOptions.filter((o) => o.value);

type FormState = {
  firstName: string;
  lastName: string;
  jobTitle: string;
  email: string;
  phone: string;
  whatsappPhone: string;
  organizationId: string;
  status: string;
};

const empty: FormState = {
  firstName: "",
  lastName: "",
  jobTitle: "",
  email: "",
  phone: "",
  whatsappPhone: "",
  organizationId: "",
  status: "LEAD",
};

function messageFor(error: unknown): string {
  if (isApiError(error)) {
    if (error.code === ErrorCode.VALIDATION_ERROR) return "Verifique os campos e tente novamente.";
    if (error.code === "CONTACT_EMAIL_ALREADY_EXISTS") return "Já existe um contato com este e-mail.";
    if (error.code === "CONTACT_PHONE_ALREADY_EXISTS") return "Já existe um contato com este telefone.";
    if (error.isForbidden) return "Você não tem permissão para esta ação.";
    return error.message;
  }
  return "Não foi possível salvar o contato.";
}

/** Casca: em modo edição, aguarda os dados e inicializa o formulário via key. */
export function ContactForm({ contactId }: { contactId?: string }) {
  const isEdit = Boolean(contactId);
  const detail = useContact(contactId ?? "");

  if (isEdit) {
    if (detail.isLoading) return <p className="py-16 text-center text-body2 text-ink-3">Carregando…</p>;
    if (detail.isError || !detail.data) {
      const notFound = isApiError(detail.error) && detail.error.statusCode === 404;
      return <ErrorState title={notFound ? "Contato não encontrado." : "Falha ao carregar o contato."} onRetry={notFound ? undefined : () => detail.refetch()} />;
    }
  }

  const c = detail.data?.contact;
  const initial: FormState = c
    ? {
        firstName: c.firstName ?? "",
        lastName: c.lastName ?? "",
        jobTitle: c.jobTitle ?? "",
        email: c.email ?? "",
        phone: c.phone ?? "",
        whatsappPhone: c.whatsappPhone ?? "",
        organizationId: c.organizationId ?? "",
        status: c.status ?? "LEAD",
      }
    : empty;

  return <ContactFormFields key={contactId ?? "new"} initial={initial} contactId={contactId} />;
}

function ContactFormFields({ initial, contactId }: { initial: FormState; contactId?: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const isEdit = Boolean(contactId);
  const orgs = useOrganizations({ limit: 100 });
  const create = useCreateContact();
  const update = useUpdateContact(contactId ?? "");

  const [form, setForm] = React.useState<FormState>(initial);
  const set = (k: keyof FormState) => (v: string) => setForm((f) => ({ ...f, [k]: v }));
  const orgOptions = [
    { value: "", label: "Sem organização" },
    ...(orgs.data?.items ?? []).map((o) => ({ value: o.id, label: o.name })),
  ];
  const pending = create.isPending || update.isPending;
  const backHref = isEdit && contactId ? `/contacts/${contactId}` : "/contacts";

  async function handleSave() {
    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim() || undefined,
      jobTitle: form.jobTitle.trim() || undefined,
      email: form.email.trim() || undefined,
      phone: form.phone.trim() || undefined,
      whatsappPhone: form.whatsappPhone.trim() || undefined,
      organizationId: form.organizationId || undefined,
      status: form.status,
    };
    try {
      if (isEdit && contactId) {
        await update.mutateAsync(payload);
        toast({ title: "Contato atualizado", variant: "success" });
        router.push(`/contacts/${contactId}`);
      } else {
        const created = await create.mutateAsync(payload);
        toast({ title: "Contato criado", variant: "success" });
        router.push(`/contacts/${created.id}`);
      }
    } catch (error) {
      toast({ title: messageFor(error), variant: "error" });
    }
  }

  return (
    <FormPageLayout
      title={isEdit ? "Editar contato" : "Novo contato"}
      description={isEdit ? "Atualize os dados do contato." : "Cadastre um novo contato na sua base."}
      back={{ href: backHref, label: "Contatos" }}
      footer={
        <>
          <Button asChild variant="secondary" size="sm">
            <Link href={backHref}>Cancelar</Link>
          </Button>
          <Button size="sm" loading={pending} disabled={!form.firstName.trim()} onClick={handleSave}>
            {isEdit ? "Salvar alterações" : "Salvar contato"}
          </Button>
        </>
      }
    >
      <Card className="p-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField id="cf-first" label="Nome" required>
            {(p) => <Input placeholder="Nome" value={form.firstName} onChange={(e) => set("firstName")(e.target.value)} {...p} />}
          </FormField>
          <FormField id="cf-last" label="Sobrenome">
            {(p) => <Input placeholder="Sobrenome" value={form.lastName} onChange={(e) => set("lastName")(e.target.value)} {...p} />}
          </FormField>
          <FormField id="cf-email" label="E-mail">
            {(p) => <Input type="email" placeholder="email@empresa.com.br" value={form.email} onChange={(e) => set("email")(e.target.value)} {...p} />}
          </FormField>
          <FormField id="cf-phone" label="Telefone">
            {(p) => <PhoneInput value={form.phone} onValueChange={set("phone")} {...p} />}
          </FormField>
          <FormField id="cf-wa" label="WhatsApp">
            {(p) => <PhoneInput value={form.whatsappPhone} onValueChange={set("whatsappPhone")} {...p} />}
          </FormField>
          <FormField id="cf-role" label="Cargo">
            {(p) => <Input placeholder="Ex.: Gerente comercial" value={form.jobTitle} onChange={(e) => set("jobTitle")(e.target.value)} {...p} />}
          </FormField>
          <FormField id="cf-org" label="Organização">
            {(p) => <Combobox id={p.id} options={orgOptions} value={form.organizationId} onValueChange={set("organizationId")} placeholder="Selecione a organização" />}
          </FormField>
          <FormField id="cf-status" label="Status">
            {(p) => <Combobox id={p.id} options={STATUS} value={form.status} onValueChange={set("status")} />}
          </FormField>
        </div>
      </Card>
    </FormPageLayout>
  );
}
