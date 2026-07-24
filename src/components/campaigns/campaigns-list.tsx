"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarClock, Copy, Megaphone, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SearchInput } from "@/components/ui/search-input";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { ListSkeleton } from "@/components/ui/list-skeleton";
import { ConfirmDialog } from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/toast";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useSession } from "@/providers/session-provider";
import {
  useCampaigns,
  useDeleteCampaign,
  useDuplicateCampaign,
} from "@/hooks/campaigns/use-campaigns";
import { formatDateTime } from "@/lib/campaigns/display";
import { CampaignStatusBadge } from "./campaign-status-badge";
import type { ApiCampaign } from "@/types/api/campaigns";

export function CampaignsList() {
  const { can } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [search, setSearch] = React.useState("");
  const list = useCampaigns(search ? { search } : undefined);
  const dup = useDuplicateCampaign();
  const del = useDeleteCampaign();
  const [toDelete, setToDelete] = React.useState<ApiCampaign | null>(null);

  const canCreate = can(PERMISSIONS.MESSAGING_CAMPAIGNS_CREATE);
  const items = list.data?.items ?? [];

  const newButton = canCreate ? (
    <Button asChild>
      <Link href="/whatsapp/campaigns/new">
        <Plus /> Nova campanha
      </Link>
    </Button>
  ) : null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Campanhas"
        description="Disparos de WhatsApp agendados para datas e promoções."
        actions={newButton}
      />

      <div className="max-w-sm">
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome…"
        />
      </div>

      {list.isLoading ? (
        <ListSkeleton rows={4} />
      ) : list.isError ? (
        <ErrorState title="Não foi possível carregar as campanhas" onRetry={() => list.refetch()} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="Nenhuma campanha ainda"
          description="Crie sua primeira campanha de WhatsApp."
          action={newButton ?? undefined}
        />
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((c) => (
            <Card key={c.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/whatsapp/campaigns/${c.id}`}
                    className="truncate font-display text-h3 font-semibold text-ink hover:text-brand"
                  >
                    {c.name}
                  </Link>
                  <CampaignStatusBadge status={c.status} />
                </div>
                <p className="mt-0.5 truncate text-small text-ink-3">
                  {c.messagePreview ?? "Sem mensagem"}
                </p>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-caption text-ink-2">
                  <span className="inline-flex items-center gap-1">
                    <CalendarClock className="size-3.5" aria-hidden />
                    {c.scheduledAt ? formatDateTime(c.scheduledAt, c.timezone) : "Sem data"}
                  </span>
                  <span>
                    {c.counters.eligible} elegíveis
                    {c.counters.excluded > 0 ? ` · ${c.counters.excluded} excluídos` : ""}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Duplicar"
                  loading={dup.isPending}
                  onClick={() =>
                    dup.mutate(c.id, {
                      onSuccess: (n) => {
                        toast({ title: "Campanha duplicada", variant: "success" });
                        router.push(`/whatsapp/campaigns/${n.id}/edit`);
                      },
                      onError: () => toast({ title: "Falha ao duplicar", variant: "error" }),
                    })
                  }
                >
                  <Copy />
                </Button>
                {c.status === "DRAFT" && can(PERMISSIONS.MESSAGING_CAMPAIGNS_DELETE) ? (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Excluir"
                    onClick={() => setToDelete(c)}
                  >
                    <Trash2 />
                  </Button>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Excluir rascunho?"
        description={`A campanha "${toDelete?.name ?? ""}" será removida. Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        destructive
        onConfirm={() => {
          if (!toDelete) return;
          del.mutate(toDelete.id, {
            onSuccess: () => toast({ title: "Campanha excluída", variant: "success" }),
            onError: () => toast({ title: "Falha ao excluir", variant: "error" }),
          });
          setToDelete(null);
        }}
      />
    </div>
  );
}
