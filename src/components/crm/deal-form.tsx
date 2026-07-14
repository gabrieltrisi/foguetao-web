"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { Combobox } from "@/components/ui/combobox";
import { FormPageLayout } from "@/components/patterns/page-patterns";
import { ErrorState } from "@/components/ui/error-state";
import { useToast } from "@/components/ui/toast";
import { useDeal, useCreateDeal, useUpdateDeal } from "@/hooks/crm/use-deals";
import { usePipelines, usePipelineStages } from "@/hooks/crm/use-pipelines";
import { useContacts } from "@/hooks/crm/use-contacts";
import { useOrganizations } from "@/hooks/crm/use-organizations";
import { messageForDealError, dealPriorityMeta } from "@/lib/crm/deal-errors";
import { parseMoneyInput } from "@/lib/crm/money";
import { isApiError } from "@/types/api/error";
import type { DealPriority } from "@/types/api/crm-deals";

const PRIORITY_OPTIONS = (["LOW", "MEDIUM", "HIGH", "URGENT"] as DealPriority[]).map((p) => ({
  value: p,
  label: dealPriorityMeta[p].label,
}));

interface FormState {
  title: string;
  description: string;
  /** String decimal — nunca number. */
  value: string;
  currency: string;
  priority: string;
  pipelineId: string;
  stageId: string;
  contactId: string;
  organizationId: string;
  expectedCloseDate: string;
}

const empty: FormState = {
  title: "",
  description: "",
  value: "",
  currency: "BRL",
  priority: "MEDIUM",
  pipelineId: "",
  stageId: "",
  contactId: "",
  organizationId: "",
  expectedCloseDate: "",
};

export function DealForm({ dealId }: { dealId?: string }) {
  const isEdit = Boolean(dealId);
  const detail = useDeal(dealId ?? "");

  if (isEdit) {
    if (detail.isLoading) return <p className="py-16 text-center text-body2 text-ink-3">Carregando…</p>;
    if (detail.isError || !detail.data) {
      const notFound = isApiError(detail.error) && detail.error.statusCode === 404;
      return (
        <ErrorState
          title={notFound ? "Oportunidade não encontrada." : "Falha ao carregar a oportunidade."}
          onRetry={notFound ? undefined : () => detail.refetch()}
        />
      );
    }
  }

  const d = detail.data;
  const initial: FormState = d
    ? {
        title: d.title,
        description: d.description ?? "",
        value: d.value,
        currency: d.currency,
        priority: d.priority,
        pipelineId: d.pipelineId,
        stageId: d.stageId,
        contactId: d.contactId ?? "",
        organizationId: d.organizationId ?? "",
        expectedCloseDate: d.expectedCloseDate ? d.expectedCloseDate.slice(0, 10) : "",
      }
    : empty;

  return <DealFormFields key={dealId ?? "new"} initial={initial} dealId={dealId} version={d?.version} />;
}

function DealFormFields({
  initial,
  dealId,
  version,
}: {
  initial: FormState;
  dealId?: string;
  version?: number;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const isEdit = Boolean(dealId);

  const [form, setForm] = React.useState<FormState>(initial);
  const set = (k: keyof FormState) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const pipelines = usePipelines({ limit: 50 });
  const stages = usePipelineStages(form.pipelineId);
  const contacts = useContacts({ limit: 100 });
  const orgs = useOrganizations({ limit: 100 });
  const create = useCreateDeal();
  const update = useUpdateDeal(dealId ?? "", form.pipelineId);

  const pending = create.isPending || update.isPending;
  const backHref = isEdit && dealId ? `/deals/${dealId}` : "/deals";

  // Só etapas ABERTAS podem receber uma oportunidade nova/editada.
  const openStages = (stages.data ?? []).filter((s) => s.category === "OPEN");

  async function handleSave() {
    const value = form.value.trim() ? parseMoneyInput(form.value) : undefined;
    if (form.value.trim() && value === null) {
      toast({ title: "Valor monetário inválido.", variant: "error" });
      return;
    }

    const payload: Record<string, unknown> = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      // value permanece STRING decimal — sem conversão para number
      value,
      currency: form.currency || undefined,
      priority: form.priority,
      contactId: form.contactId || undefined,
      organizationId: form.organizationId || undefined,
      expectedCloseDate: form.expectedCloseDate || undefined,
    };
    if (!isEdit) {
      payload.pipelineId = form.pipelineId || undefined;
      payload.stageId = form.stageId || undefined;
    } else if (version !== undefined) {
      payload.expectedVersion = version;
    }

    try {
      if (isEdit && dealId) {
        await update.mutateAsync(payload);
        toast({ title: "Oportunidade atualizada", variant: "success" });
        router.push(`/deals/${dealId}`);
      } else {
        const created = await create.mutateAsync(payload);
        toast({ title: "Oportunidade criada", variant: "success" });
        router.push(`/deals/${created.id}`);
      }
    } catch (error) {
      toast({ title: messageForDealError(error), variant: "error" });
    }
  }

  return (
    <FormPageLayout
      title={isEdit ? "Editar oportunidade" : "Nova oportunidade"}
      description={isEdit ? "Atualize os dados da oportunidade." : "Cadastre uma nova oportunidade."}
      back={{ href: backHref, label: "Oportunidades" }}
      footer={
        <>
          <Button asChild variant="secondary" size="sm">
            <Link href={backHref}>Cancelar</Link>
          </Button>
          <Button size="sm" loading={pending} disabled={!form.title.trim()} onClick={handleSave}>
            {isEdit ? "Salvar alterações" : "Criar oportunidade"}
          </Button>
        </>
      }
    >
      <Card className="p-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField id="df-title" label="Título" required className="sm:col-span-2">
            {(p) => <Input placeholder="Ex.: Contrato anual - ACME" value={form.title} onChange={(e) => set("title")(e.target.value)} {...p} />}
          </FormField>
          <FormField id="df-desc" label="Descrição" className="sm:col-span-2">
            {(p) => <Textarea value={form.description} onChange={(e) => set("description")(e.target.value)} {...p} />}
          </FormField>
          <FormField id="df-value" label="Valor" description="Use ponto ou vírgula: 1500.00">
            {(p) => <Input inputMode="decimal" placeholder="0,00" value={form.value} onChange={(e) => set("value")(e.target.value)} {...p} />}
          </FormField>
          <FormField id="df-currency" label="Moeda">
            {(p) => <Input maxLength={3} value={form.currency} onChange={(e) => set("currency")(e.target.value.toUpperCase())} {...p} />}
          </FormField>

          {!isEdit ? (
            <>
              <FormField id="df-pipeline" label="Pipeline" description="Padrão: pipeline default da empresa">
                {(p) => (
                  <Combobox
                    id={p.id}
                    options={[{ value: "", label: "Pipeline padrão" }, ...(pipelines.data?.items ?? []).map((x) => ({ value: x.id, label: x.name }))]}
                    value={form.pipelineId}
                    onValueChange={(v) => setForm((f) => ({ ...f, pipelineId: v, stageId: "" }))}
                  />
                )}
              </FormField>
              <FormField id="df-stage" label="Etapa" description="Padrão: primeira etapa aberta">
                {(p) => (
                  <Combobox
                    id={p.id}
                    options={[{ value: "", label: "Primeira etapa aberta" }, ...openStages.map((s) => ({ value: s.id, label: s.name }))]}
                    value={form.stageId}
                    onValueChange={set("stageId")}
                    disabled={!form.pipelineId}
                  />
                )}
              </FormField>
            </>
          ) : null}

          <FormField id="df-priority" label="Prioridade">
            {(p) => <Combobox id={p.id} options={PRIORITY_OPTIONS} value={form.priority} onValueChange={set("priority")} />}
          </FormField>
          <FormField id="df-close" label="Previsão de fechamento">
            {(p) => <Input type="date" value={form.expectedCloseDate} onChange={(e) => set("expectedCloseDate")(e.target.value)} {...p} />}
          </FormField>
          <FormField id="df-contact" label="Contato">
            {(p) => (
              <Combobox
                id={p.id}
                options={[{ value: "", label: "Sem contato" }, ...(contacts.data?.items ?? []).map((c) => ({ value: c.id, label: c.fullName }))]}
                value={form.contactId}
                onValueChange={set("contactId")}
              />
            )}
          </FormField>
          <FormField id="df-org" label="Organização">
            {(p) => (
              <Combobox
                id={p.id}
                options={[{ value: "", label: "Sem organização" }, ...(orgs.data?.items ?? []).map((o) => ({ value: o.id, label: o.name }))]}
                value={form.organizationId}
                onValueChange={set("organizationId")}
              />
            )}
          </FormField>
        </div>
      </Card>
    </FormPageLayout>
  );
}
