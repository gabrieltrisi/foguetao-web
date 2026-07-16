"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Archive,
  ArchiveRestore,
  Ban,
  CircleCheck,
  CirclePause,
  CirclePlay,
  Pencil,
  Trash2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { StatList } from "@/components/business/kpi-block";
import { DetailPageLayout } from "@/components/patterns/page-patterns";
import { ConfirmDialog } from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/toast";
import { useSession } from "@/providers/session-provider";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { usePipelines } from "@/hooks/crm/use-pipelines";
import { useCampaign, useCampaignAction, useDeleteCampaign } from "@/hooks/marketing/use-campaigns";
import { useCampaignOwnerOptions } from "@/hooks/marketing/use-campaign-owners";
import {
  availableActions,
  campaignActionLabel,
  channelLabel,
  formatBudget,
  formatDate,
  formatPeriod,
  messageForCampaignError,
  objectiveLabel,
  statusMeta,
} from "@/lib/marketing/campaigns";
import { isApiError } from "@/types/api/error";
import type { CampaignAction } from "@/types/api/marketing";

/**
 * Detalhe da campanha — apenas campos do contrato.
 *
 * NÃO há aba de métricas nem gráfico: investido, leads, CPL, conversões,
 * receita e ROAS não existem no domínio de campanhas. Exibi-los exigiria mock,
 * então os blocos foram removidos.
 */
const ACTION_ICON: Record<CampaignAction, LucideIcon> = {
  activate: CirclePlay,
  pause: CirclePause,
  complete: CircleCheck,
  cancel: Ban,
  archive: Archive,
  restore: ArchiveRestore,
};

export function CampaignDetail({ campaignId }: { campaignId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const { can } = useSession();
  const detail = useCampaign(campaignId);
  const action = useCampaignAction(campaignId);
  const remove = useDeleteCampaign();
  const owners = useCampaignOwnerOptions();
  const pipelines = usePipelines({ limit: 100 });
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  if (!can(PERMISSIONS.CAMPAIGNS_READ)) {
    return (
      <p className="text-body2 text-ink-3 py-16 text-center">
        Você não tem permissão para ver campanhas.
      </p>
    );
  }
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

  const c = detail.data;
  const meta = statusMeta(c.status);
  const archived = c.status === "ARCHIVED";

  /**
   * A UI só oferece transições válidas; `activate` exige `campaigns.publish`, as
   * demais `campaigns.update`. O backend continua sendo a autoridade.
   */
  const actions = availableActions(c.status).filter((a) =>
    a === "activate" ? can(PERMISSIONS.CAMPAIGNS_PUBLISH) : can(PERMISSIONS.CAMPAIGNS_UPDATE),
  );

  async function runAction(a: CampaignAction) {
    try {
      await action.mutateAsync(a);
      toast({ title: `${campaignActionLabel[a]}: concluído`, variant: "success" });
    } catch (error) {
      toast({ title: messageForCampaignError(error), variant: "error" });
    }
  }

  async function handleDelete() {
    try {
      await remove.mutateAsync(campaignId);
      toast({ title: "Campanha excluída", variant: "success" });
      router.push("/campaigns");
    } catch (error) {
      toast({ title: messageForCampaignError(error), variant: "error" });
    }
  }

  const ownerName = c.ownerUserId ? (owners.nameById.get(c.ownerUserId) ?? "—") : "—";
  const pipelineName = c.pipelineId
    ? ((pipelines.data?.items ?? []).find((p) => p.id === c.pipelineId)?.name ?? "—")
    : "—";

  const aside = (
    <div className="flex flex-col gap-4">
      <Card className="p-4">
        <p className="text-caption text-ink-3 mb-3 font-semibold tracking-wide uppercase">
          Campanha
        </p>
        <StatList
          items={[
            { label: "Status", value: <Badge tone={meta.tone}>{meta.label}</Badge> },
            { label: "Canal", value: channelLabel(c.channel) },
            { label: "Objetivo", value: objectiveLabel(c.objective) },
            { label: "Orçamento", value: formatBudget(c.budget, c.currency) },
            { label: "Moeda", value: c.currency },
            { label: "Período", value: formatPeriod(c.startAt, c.endAt) },
            { label: "Responsável", value: ownerName },
            { label: "Pipeline", value: pipelineName },
          ]}
        />
      </Card>
      {c.externalProvider ? (
        <Card className="p-4">
          <p className="text-caption text-ink-3 mb-3 font-semibold tracking-wide uppercase">
            Provider externo
          </p>
          <StatList
            items={[
              { label: "Provider", value: c.externalProvider },
              { label: "ID externo", value: c.externalId ?? "—" },
            ]}
          />
        </Card>
      ) : null}
      <Card className="p-4">
        <p className="text-caption text-ink-3 mb-3 font-semibold tracking-wide uppercase">
          Registro
        </p>
        <StatList
          items={[
            { label: "Criada em", value: formatDate(c.createdAt) },
            { label: "Atualizada em", value: formatDate(c.updatedAt) },
            ...(c.archivedAt ? [{ label: "Arquivada em", value: formatDate(c.archivedAt) }] : []),
          ]}
        />
      </Card>
    </div>
  );

  return (
    <DetailPageLayout
      title={c.name}
      subtitle={`${objectiveLabel(c.objective)} · ${channelLabel(c.channel)}`}
      back={{ href: "/campaigns", label: "Campanhas" }}
      actions={
        <>
          {can(PERMISSIONS.CAMPAIGNS_UPDATE) && !archived ? (
            <Button asChild size="sm" variant="secondary">
              <Link href={`/campaigns/${c.id}/edit`}>
                <Pencil />
                Editar
              </Link>
            </Button>
          ) : null}
          {actions.map((a) => {
            const Icon = ACTION_ICON[a];
            return (
              <Button
                key={a}
                size="sm"
                variant={a === "activate" || a === "restore" ? "primary" : "secondary"}
                loading={action.isPending && action.variables === a}
                disabled={action.isPending}
                onClick={() => runAction(a)}
              >
                <Icon />
                {campaignActionLabel[a]}
              </Button>
            );
          })}
          {can(PERMISSIONS.CAMPAIGNS_DELETE) ? (
            <Button
              size="sm"
              variant="ghost"
              aria-label="Excluir campanha"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 />
            </Button>
          ) : null}
        </>
      }
      aside={aside}
    >
      <div className="flex flex-col gap-5">
        {archived ? (
          <Card className="border-line bg-surface p-4">
            <p className="text-body2 text-ink-2">
              Campanha arquivada — somente leitura. Restaure para voltar a editá-la (ela volta como
              rascunho).
            </p>
          </Card>
        ) : null}

        <Card className="p-5">
          <p className="font-display text-h3 text-ink mb-2 font-semibold">Descrição</p>
          <p className="text-body2 text-ink-2 whitespace-pre-wrap">
            {c.description ?? "Sem descrição."}
          </p>
        </Card>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Excluir campanha?"
        description={`A campanha “${c.name}” deixará de aparecer nas listagens. Esta ação não pode ser desfeita pela interface.`}
        confirmLabel="Excluir"
        destructive
        onConfirm={handleDelete}
      />
    </DetailPageLayout>
  );
}
