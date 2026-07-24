"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, Pencil } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { ListSkeleton } from "@/components/ui/list-skeleton";
import { useToast } from "@/components/ui/toast";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useSession } from "@/providers/session-provider";
import { useCampaign, useDuplicateCampaign } from "@/hooks/campaigns/use-campaigns";
import { EXCLUSION_LABELS, formatDateTime } from "@/lib/campaigns/display";
import { CampaignStatusBadge } from "./campaign-status-badge";

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
  const canEdit = (c.status === "DRAFT" || c.status === "SCHEDULED") && can(PERMISSIONS.MESSAGING_CAMPAIGNS_UPDATE);

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <PageHeader
        title={c.name}
        description={c.description ?? undefined}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              loading={dup.isPending}
              onClick={() =>
                dup.mutate(c.id, {
                  onSuccess: (n) => router.push(`/whatsapp/campaigns/${n.id}/edit`),
                  onError: () => toast({ title: "Falha ao duplicar", variant: "error" }),
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

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Resumo</CardTitle>
          <CampaignStatusBadge status={c.status} />
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Row label="Agendamento" value={c.scheduledAt ? `${formatDateTime(c.scheduledAt, c.timezone)} (${c.timezone})` : "Sem data"} />
          <Row label="Público" value={c.audience ? AUDIENCE_LABEL[c.audience.kind] : "—"} />
          <Row label="Elegíveis" value={<strong className="text-success">{c.counters.eligible}</strong>} />
          <Row label="Excluídos" value={String(c.counters.excluded)} />
          <Row label="Enviados / Entregues / Lidos" value={`${c.counters.sent} / ${c.counters.delivered} / ${c.counters.read}`} />
          <Row label="Falhas" value={String(c.counters.failed)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mensagem</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-body2 text-ink">{c.message ?? c.messagePreview ?? "—"}</p>
        </CardContent>
      </Card>

      <p className="text-caption text-ink-3">
        A execução (envio em lotes, progresso e falhas por destinatário) chega na Sprint C2.
        Motivos de exclusão possíveis: {Object.values(EXCLUSION_LABELS).join(", ")}.
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[200px_1fr] gap-2 border-b border-line/60 pb-2 text-body2">
      <span className="text-ink-3">{label}</span>
      <span className="text-ink">{value}</span>
    </div>
  );
}
