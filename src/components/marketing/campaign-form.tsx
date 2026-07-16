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
import { useSession } from "@/providers/session-provider";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { usePipelines } from "@/hooks/crm/use-pipelines";
import { useCampaign, useCreateCampaign, useUpdateCampaign } from "@/hooks/marketing/use-campaigns";
import { useCampaignOwnerOptions } from "@/hooks/marketing/use-campaign-owners";
import {
  CAMPAIGN_CHANNELS,
  CAMPAIGN_OBJECTIVES,
  channelLabel,
  messageForCampaignError,
  objectiveLabel,
  toDateInput,
  toIsoOrNull,
} from "@/lib/marketing/campaigns";
import { isApiError } from "@/types/api/error";
import type { CampaignInput } from "@/types/api/marketing";

/**
 * Criar/editar campanha.
 *
 * Só campos do contrato: sem metadata, sem config, sem version/expectedVersion,
 * e sem nenhuma métrica de mídia. `budget` trafega como STRING decimal — nunca
 * como float — e o status nunca é editado aqui (isso é das ações do detalhe).
 */
const NONE = "";
const BUDGET_RE = /^\d+(\.\d{1,2})?$/;

type FormState = {
  name: string;
  description: string;
  channel: string;
  objective: string;
  budget: string;
  currency: string;
  startAt: string;
  endAt: string;
  ownerUserId: string;
  pipelineId: string;
};

const empty: FormState = {
  name: "",
  description: "",
  channel: "INTERNAL",
  objective: "LEAD_GENERATION",
  budget: "",
  currency: "BRL",
  startAt: "",
  endAt: "",
  ownerUserId: NONE,
  pipelineId: NONE,
};

export function CampaignForm({ campaignId }: { campaignId?: string }) {
  const isEdit = Boolean(campaignId);
  const { can } = useSession();
  const detail = useCampaign(campaignId ?? "");

  const allowed = isEdit ? can(PERMISSIONS.CAMPAIGNS_UPDATE) : can(PERMISSIONS.CAMPAIGNS_CREATE);
  if (!allowed) {
    return (
      <p className="text-body2 text-ink-3 py-16 text-center">
        Você não tem permissão para {isEdit ? "editar" : "criar"} campanhas.
      </p>
    );
  }

  if (isEdit) {
    if (detail.isLoading) {
      return <p className="text-body2 text-ink-3 py-16 text-center">Carregando…</p>;
    }
    if (detail.isError || !detail.data) {
      const notFound = isApiError(detail.error) && detail.error.statusCode === 404;
      return (
        <ErrorState
          title={notFound ? "Campanha não encontrada." : "Falha ao carregar a campanha."}
          onRetry={notFound ? undefined : () => detail.refetch()}
        />
      );
    }
    // Arquivada é somente leitura até restaurar (o backend responde 409).
    if (detail.data.status === "ARCHIVED") {
      return (
        <ErrorState title="Campanha arquivada." message="Restaure a campanha antes de editá-la." />
      );
    }
  }

  const c = detail.data;
  const initial: FormState = c
    ? {
        name: c.name,
        description: c.description ?? "",
        channel: c.channel,
        objective: c.objective,
        budget: c.budget ?? "",
        currency: c.currency,
        startAt: toDateInput(c.startAt),
        endAt: toDateInput(c.endAt),
        ownerUserId: c.ownerUserId ?? NONE,
        pipelineId: c.pipelineId ?? NONE,
      }
    : empty;

  return <CampaignFormFields key={campaignId ?? "new"} initial={initial} campaignId={campaignId} />;
}

function CampaignFormFields({ initial, campaignId }: { initial: FormState; campaignId?: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const isEdit = Boolean(campaignId);
  const create = useCreateCampaign();
  const update = useUpdateCampaign(campaignId ?? "");
  const owners = useCampaignOwnerOptions();
  const pipelines = usePipelines({ limit: 100 });

  const [form, setForm] = React.useState<FormState>(initial);
  const set = (k: keyof FormState) => (v: string) => setForm((f) => ({ ...f, [k]: v }));
  const pending = create.isPending || update.isPending;
  const backHref = isEdit && campaignId ? `/campaigns/${campaignId}` : "/campaigns";

  const budgetError =
    form.budget.trim() && !BUDGET_RE.test(form.budget.trim())
      ? "Use um número com até 2 casas decimais (ex.: 1500.00)."
      : undefined;
  const datesError =
    form.startAt && form.endAt && form.endAt < form.startAt
      ? "O término não pode ser anterior ao início."
      : undefined;
  const nameError =
    form.name.trim().length > 0 && form.name.trim().length < 2
      ? "Mínimo de 2 caracteres."
      : undefined;

  const invalid = form.name.trim().length < 2 || Boolean(budgetError) || Boolean(datesError);

  const pipelineOptions = [
    { value: NONE, label: "Nenhum pipeline" },
    ...(pipelines.data?.items ?? []).map((p) => ({ value: p.id, label: p.name })),
  ];
  const ownerOptions = [{ value: NONE, label: "Sem responsável" }, ...owners.options];

  async function handleSave() {
    /**
     * O CreateCampaignDto NÃO aceita `null` (só o Update limpa com null), então
     * no create um campo vazio é OMITIDO e no update vira `null`. `budget` vai
     * como string decimal — nunca float.
     */
    const blank = isEdit ? null : undefined;
    const budget = form.budget.trim();
    const payload: CampaignInput = {
      name: form.name.trim(),
      description: form.description.trim() || blank,
      channel: form.channel,
      objective: form.objective,
      budget: budget ? budget : blank,
      currency: form.currency.trim().toUpperCase() || "BRL",
      startAt: toIsoOrNull(form.startAt) ?? blank,
      endAt: toIsoOrNull(form.endAt) ?? blank,
      ownerUserId: form.ownerUserId || blank,
      pipelineId: form.pipelineId || blank,
    };
    try {
      if (isEdit && campaignId) {
        await update.mutateAsync(payload);
        toast({ title: "Campanha atualizada", variant: "success" });
        router.push(`/campaigns/${campaignId}`);
      } else {
        const created = await create.mutateAsync(payload);
        toast({ title: "Campanha criada", variant: "success" });
        router.push(`/campaigns/${created.id}`);
      }
    } catch (error) {
      toast({ title: messageForCampaignError(error), variant: "error" });
    }
  }

  return (
    <FormPageLayout
      title={isEdit ? "Editar campanha" : "Nova campanha"}
      description={
        isEdit
          ? "Atualize os dados da campanha."
          : "A campanha é criada como rascunho — ative depois pelo detalhe."
      }
      back={{ href: backHref, label: "Campanhas" }}
      footer={
        <>
          <Button asChild variant="secondary" size="sm">
            <Link href={backHref}>Cancelar</Link>
          </Button>
          <Button size="sm" loading={pending} disabled={invalid} onClick={handleSave}>
            {isEdit ? "Salvar alterações" : "Salvar campanha"}
          </Button>
        </>
      }
    >
      <Card className="p-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField id="cf-name" label="Nome" required error={nameError} className="sm:col-span-2">
            {(p) => (
              <Input
                placeholder="Ex.: Captação de alunos — agosto"
                value={form.name}
                onChange={(e) => set("name")(e.target.value)}
                {...p}
              />
            )}
          </FormField>

          <FormField id="cf-desc" label="Descrição" className="sm:col-span-2">
            {(p) => (
              <Textarea
                rows={3}
                placeholder="Objetivo, público, observações…"
                value={form.description}
                onChange={(e) => set("description")(e.target.value)}
                {...p}
              />
            )}
          </FormField>

          <FormField id="cf-channel" label="Canal">
            {(p) => (
              <Combobox
                id={p.id}
                options={CAMPAIGN_CHANNELS.map((c) => ({ value: c, label: channelLabel(c) }))}
                value={form.channel}
                onValueChange={set("channel")}
              />
            )}
          </FormField>

          <FormField id="cf-obj" label="Objetivo">
            {(p) => (
              <Combobox
                id={p.id}
                options={CAMPAIGN_OBJECTIVES.map((o) => ({ value: o, label: objectiveLabel(o) }))}
                value={form.objective}
                onValueChange={set("objective")}
              />
            )}
          </FormField>

          <FormField
            id="cf-budget"
            label="Orçamento"
            error={budgetError}
            description="Valor decimal, ex.: 1500.00"
          >
            {(p) => (
              <Input
                inputMode="decimal"
                placeholder="0.00"
                value={form.budget}
                onChange={(e) => set("budget")(e.target.value)}
                {...p}
              />
            )}
          </FormField>

          <FormField id="cf-currency" label="Moeda" description="Código ISO, ex.: BRL">
            {(p) => (
              <Input
                maxLength={3}
                value={form.currency}
                onChange={(e) => set("currency")(e.target.value.toUpperCase())}
                {...p}
              />
            )}
          </FormField>

          <FormField id="cf-start" label="Início">
            {(p) => (
              <Input
                type="date"
                value={form.startAt}
                onChange={(e) => set("startAt")(e.target.value)}
                {...p}
              />
            )}
          </FormField>

          <FormField id="cf-end" label="Término" error={datesError}>
            {(p) => (
              <Input
                type="date"
                value={form.endAt}
                onChange={(e) => set("endAt")(e.target.value)}
                {...p}
              />
            )}
          </FormField>

          <FormField
            id="cf-owner"
            label="Responsável"
            description={
              owners.canReadMembers
                ? "Membro ativo que possa ver campanhas."
                : "Você não tem permissão para listar membros."
            }
          >
            {(p) => (
              <Combobox
                id={p.id}
                options={ownerOptions}
                value={form.ownerUserId}
                onValueChange={set("ownerUserId")}
                disabled={!owners.canReadMembers}
              />
            )}
          </FormField>

          <FormField id="cf-pipeline" label="Pipeline">
            {(p) => (
              <Combobox
                id={p.id}
                options={pipelineOptions}
                value={form.pipelineId}
                onValueChange={set("pipelineId")}
              />
            )}
          </FormField>
        </div>
      </Card>
    </FormPageLayout>
  );
}
