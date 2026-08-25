"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, Pencil } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { ListSkeleton } from "@/components/ui/list-skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useSession } from "@/providers/session-provider";
import { useCampaign, useDuplicateCampaign } from "@/hooks/campaigns/use-campaigns";
import { formatDateTime } from "@/lib/campaigns/display";
import { messageForCampaignError } from "@/lib/campaigns/errors";
import { CampaignStatusBadge } from "./campaign-status-badge";
import { CampaignExecutionActions } from "./campaign-execution-actions";
import { CampaignMetricsPanel } from "./campaign-metrics-panel";
import { CampaignRecipientsTable } from "./campaign-recipients-table";
import { CampaignTimeline } from "./campaign-timeline";

const AUDIENCE_LABEL: Record<string, string> = {
  ALL: "Todos os contatos",
  TAGS: "Por tags",
  CONTACTS: "Contatos específicos",
};

export function CampaignDetail({ id }: { id: string }) {
  const { can } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const q = useCampaign(id);
  const dup = useDuplicateCampaign();

  if (q.isLoading) return <ListSkeleton rows={4} />;
  if (q.isError || !q.data) return <ErrorState title="Campanha não encontrada" />;
  const c = q.data;
  const canEdit =
    (c.status === "DRAFT" || c.status === "SCHEDULED") && can(PERMISSIONS.MESSAGING_CAMPAIGNS_UPDATE);

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <PageHeader
        title={c.name}
        description={c.description ?? undefined}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <CampaignExecutionActions campaign={c} size="md" />
            <Button
              variant="secondary"
              loading={dup.isPending}
              onClick={() =>
                dup.mutate(c.id, {
                  onSuccess: (n) => router.push(`/whatsapp/campaigns/${n.id}/edit`),
                  onError: (e) => toast({ title: messageForCampaignError(e), variant: "error" }),
                })
              }
            >
              <Copy /> Duplicar
            </Button>
            {canEdit ? (
              <Button asChild>
                <Link href={`/whatsapp/campaigns/${c.id}/edit`}>
                  <Pencil /> Editar
                </Link>
              </Button>
            ) : null}
          </div>
        }
      />

      <div className="flex items-center gap-3">
        <CampaignStatusBadge status={c.status} />
        <span className="text-caption text-ink-3">
          {c.scheduledAt
            ? `Agendada para ${formatDateTime(c.scheduledAt, c.timezone)} (${c.timezone})`
            : "Sem agendamento"}
        </span>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Visão geral</TabsTrigger>
          <TabsTrigger value="recipients">Destinatários</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="flex flex-col gap-4">
          <CampaignMetricsPanel campaign={c} />

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Conteúdo</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <Row label="Público" value={c.audience ? AUDIENCE_LABEL[c.audience.kind] : "—"} />
                <Row label="Timezone" value={c.timezone} />
                <p className="whitespace-pre-wrap pt-2 text-body2 text-ink">
                  {c.message ?? c.messagePreview ?? "—"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Público</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <Row label="Snapshot total" value={String(c.counters.total)} />
                <Row
                  label="Elegíveis"
                  value={<strong className="text-success">{c.counters.eligible}</strong>}
                />
                <Row label="Excluídos" value={String(c.counters.excluded)} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recipients">
          <CampaignRecipientsTable campaignId={c.id} timezone={c.timezone} />
        </TabsContent>

        <TabsContent value="timeline">
          <CampaignTimeline campaignId={c.id} timezone={c.timezone} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[160px_1fr] gap-2 border-b border-line/60 pb-2 text-body2">
      <span className="text-ink-3">{label}</span>
      <span className="text-ink">{value}</span>
    </div>
  );
}
