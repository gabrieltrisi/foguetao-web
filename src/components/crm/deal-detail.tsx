"use client";

import * as React from "react";
import Link from "next/link";
import { Archive, ArchiveRestore, MoreHorizontal, Pencil, RotateCcw, Trophy, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatList } from "@/components/business/kpi-block";
import { DetailPageLayout } from "@/components/patterns/page-patterns";
import { ErrorState } from "@/components/ui/error-state";
import { useToast } from "@/components/ui/toast";
import { useSession } from "@/providers/session-provider";
import {
  useDeal,
  useDealHistory,
  useDealActivities,
  useWinDeal,
  useLoseDeal,
  useReopenDeal,
  useArchiveDeal,
  useRestoreDeal,
} from "@/hooks/crm/use-deals";
import { usePipelineStages } from "@/hooks/crm/use-pipelines";
import { messageForDealError, dealStatusMeta, dealPriorityMeta, dealActivityLabel, formatDuration } from "@/lib/crm/deal-errors";
import { formatMoney } from "@/lib/crm/money";
import { formatDate, formatDateTime } from "@/lib/crm/display";
import { isApiError } from "@/types/api/error";

export function DealDetail({ id }: { id: string }) {
  const { toast } = useToast();
  const { can } = useSession();
  const { data: deal, isLoading, isError, error, refetch } = useDeal(id);

  // Abas: history e activities são LAZY — só buscam quando a aba é aberta.
  const [tab, setTab] = React.useState("resumo");

  const history = useDealHistory(id, tab === "historico");
  const activities = useDealActivities(id, tab === "atividades");
  const stages = usePipelineStages(deal?.pipelineId ?? "");

  const win = useWinDeal(id, deal?.pipelineId);
  const lose = useLoseDeal(id, deal?.pipelineId);
  const reopen = useReopenDeal(id, deal?.pipelineId);
  const archive = useArchiveDeal(id, deal?.pipelineId);
  const restore = useRestoreDeal(id, deal?.pipelineId);

  if (isLoading) {
    return <p className="py-16 text-center text-body2 text-ink-3">Carregando oportunidade…</p>;
  }
  if (isError || !deal) {
    const notFound = isApiError(error) && error.statusCode === 404;
    return (
      <ErrorState
        title={notFound ? "Oportunidade não encontrada." : "Não foi possível carregar a oportunidade."}
        onRetry={notFound ? undefined : () => refetch()}
      />
    );
  }

  const status = dealStatusMeta[deal.status];
  const priority = dealPriorityMeta[deal.priority];
  const isOpen = deal.status === "OPEN";
  const isArchived = deal.status === "ARCHIVED";
  const isClosed = deal.status === "WON" || deal.status === "LOST";
  const stageName = stages.data?.find((s) => s.id === deal.stageId)?.name ?? "—";
  const onError = (e: unknown) => toast({ title: messageForDealError(e), variant: "error" });
  const v = { expectedVersion: deal.version };

  const canWin = can("crm.deals.win") && isOpen;
  const canLose = can("crm.deals.lose") && isOpen;
  const canReopen = can("crm.deals.reopen") && isClosed;
  const canArchive = can("crm.deals.update") && !isArchived;
  const canRestore = can("crm.deals.update") && isArchived;
  const canEdit = can("crm.deals.update");

  const aside = (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={status.tone}>{status.label}</Badge>
          <Badge tone={priority.tone}>{priority.label}</Badge>
        </div>
        <div>
          <p className="text-caption font-medium uppercase tracking-wide text-ink-2">Valor</p>
          <p className="font-display text-h2 font-bold text-ink">{formatMoney(deal.value, deal.currency)}</p>
          <p className="text-caption text-ink-3">Ponderado: {formatMoney(deal.weightedValue, deal.currency)}</p>
        </div>
      </Card>
      <Card className="p-4">
        <StatList
          items={[
            { label: "Etapa", value: stageName },
            { label: "Versão", value: String(deal.version) },
            { label: "Previsão", value: formatDate(deal.expectedCloseDate) },
            { label: "Última etapa em", value: formatDateTime(deal.lastStageChangedAt) },
          ]}
        />
      </Card>
    </div>
  );

  return (
    <DetailPageLayout
      title={deal.title}
      subtitle={deal.description ?? undefined}
      back={{ href: "/deals", label: "Oportunidades" }}
      actions={
        <>
          {canEdit ? (
            <Button asChild size="sm" variant="secondary">
              <Link href={`/deals/${id}/edit`}>
                <Pencil />
                Editar
              </Link>
            </Button>
          ) : null}
          {canWin || canLose || canReopen || canArchive || canRestore ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon-sm" variant="secondary" aria-label="Mais ações">
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {canWin ? (
                  <DropdownMenuItem onSelect={() => win.mutate(v, { onSuccess: () => toast({ title: "Oportunidade ganha", variant: "success" }), onError })}>
                    <Trophy aria-hidden /> Marcar como ganha
                  </DropdownMenuItem>
                ) : null}
                {canLose ? (
                  <DropdownMenuItem onSelect={() => lose.mutate(v, { onSuccess: () => toast({ title: "Oportunidade perdida", variant: "warning" }), onError })}>
                    <XCircle aria-hidden /> Marcar como perdida
                  </DropdownMenuItem>
                ) : null}
                {canReopen ? (
                  <DropdownMenuItem onSelect={() => reopen.mutate(v, { onSuccess: () => toast({ title: "Oportunidade reaberta", variant: "success" }), onError })}>
                    <RotateCcw aria-hidden /> Reabrir
                  </DropdownMenuItem>
                ) : null}
                {(canWin || canLose || canReopen) && (canArchive || canRestore) ? <DropdownMenuSeparator /> : null}
                {canArchive ? (
                  <DropdownMenuItem onSelect={() => archive.mutate(v, { onSuccess: () => toast({ title: "Oportunidade arquivada", variant: "success" }), onError })}>
                    <Archive aria-hidden /> Arquivar
                  </DropdownMenuItem>
                ) : null}
                {canRestore ? (
                  <DropdownMenuItem onSelect={() => restore.mutate(v, { onSuccess: () => toast({ title: "Oportunidade restaurada", variant: "success" }), onError })}>
                    <ArchiveRestore aria-hidden /> Restaurar
                  </DropdownMenuItem>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </>
      }
      aside={aside}
    >
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="overflow-x-auto">
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
          <TabsTrigger value="atividades">Atividades</TabsTrigger>
        </TabsList>

        <TabsContent value="resumo">
          <Card className="p-5">
            <StatList
              items={[
                { label: "Valor", value: formatMoney(deal.value, deal.currency) },
                { label: "Moeda", value: deal.currency },
                { label: "Status", value: status.label },
                { label: "Prioridade", value: priority.label },
                { label: "Origem", value: deal.source ?? "—" },
                { label: "Ganha em", value: formatDateTime(deal.wonAt) },
                { label: "Perdida em", value: formatDateTime(deal.lostAt) },
                { label: "Motivo da perda", value: deal.lostReasonText ?? "—" },
                { label: "Criada em", value: formatDate(deal.createdAt) },
              ]}
            />
          </Card>
        </TabsContent>

        {/* Histórico de etapas — buscado apenas ao abrir esta aba */}
        <TabsContent value="historico">
          <Card className="p-5">
            {history.isLoading ? (
              <p className="text-body2 text-ink-3">Carregando histórico…</p>
            ) : history.isError ? (
              <p className="text-body2 text-danger">Falha ao carregar o histórico.</p>
            ) : (history.data?.length ?? 0) === 0 ? (
              <p className="text-body2 text-ink-3">Sem histórico de etapas.</p>
            ) : (
              <ol className="flex flex-col gap-4">
                {history.data!.map((h) => (
                  <li key={h.id} className="flex gap-3">
                    <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand" aria-hidden />
                    <div>
                      <p className="text-body2 font-medium text-ink">
                        {stages.data?.find((s) => s.id === h.toStageId)?.name ?? "Etapa"}
                      </p>
                      <p className="text-caption text-ink-3">
                        {formatDateTime(h.enteredAt)} · permanência: {formatDuration(h.durationSeconds)}
                        {h.reason ? ` · ${h.reason}` : ""}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </TabsContent>

        {/* Timeline — buscada apenas ao abrir esta aba */}
        <TabsContent value="atividades">
          <Card className="p-5">
            {activities.isLoading ? (
              <p className="text-body2 text-ink-3">Carregando atividades…</p>
            ) : activities.isError ? (
              <p className="text-body2 text-danger">Falha ao carregar as atividades.</p>
            ) : (activities.data?.items.length ?? 0) === 0 ? (
              <p className="text-body2 text-ink-3">Nenhuma atividade.</p>
            ) : (
              <ol className="flex flex-col gap-4">
                {activities.data!.items.map((a) => (
                  <li key={a.id} className="flex gap-3">
                    <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand" aria-hidden />
                    <div>
                      <p className="text-body2 font-medium text-ink">{a.title}</p>
                      <p className="text-caption text-ink-3">
                        <Badge tone="neutral" className="mr-1.5 normal-case">{dealActivityLabel[a.type] ?? a.type}</Badge>
                        {formatDateTime(a.occurredAt)}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </DetailPageLayout>
  );
}
