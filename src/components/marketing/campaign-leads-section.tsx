"use client";

import * as React from "react";
import Link from "next/link";
import { Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { ErrorState } from "@/components/ui/error-state";
import { useSession } from "@/providers/session-provider";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useCampaignAttributions } from "@/hooks/marketing/use-attribution";
import { filledUtms, formatCapturedAt, kindLabel } from "@/lib/marketing/attribution";

/**
 * Leads atribuídos à campanha.
 *
 * `contactCount` é contagem de CONTATOS DISTINTOS vinda do backend — é dado de
 * CRM, não métrica de mídia. Não existe (e não é calculado aqui) gasto, CPL,
 * receita, ROAS ou conversão: o contrato não fornece nenhum desses.
 */
const PAGE_SIZE = 10;

export function CampaignLeadsSection({ campaignId }: { campaignId: string }) {
  const { can } = useSession();
  const [page, setPage] = React.useState(1);
  const { data, isLoading, isError, refetch } = useCampaignAttributions(campaignId, {
    page,
    limit: PAGE_SIZE,
  });

  // O backend exige as duas permissões para esta rota.
  if (!can(PERMISSIONS.MARKETING_ATTRIBUTION_READ)) return null;

  if (isError) {
    return (
      <ErrorState
        variant="card"
        title="Não foi possível carregar os leads."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="font-display text-h3 text-ink font-semibold">Leads atribuídos</p>
        {data ? (
          <Badge tone="neutral">
            {data.contactCount} {data.contactCount === 1 ? "contato" : "contatos"}
          </Badge>
        ) : null}
      </div>

      {isLoading ? (
        <p className="text-body2 text-ink-3">Carregando leads…</p>
      ) : !data || data.total === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <span className="bg-surface text-ink-3 flex size-10 items-center justify-center rounded-xl">
            <Users className="size-5" aria-hidden />
          </span>
          <p className="text-body2 text-ink">Nenhum lead atribuído a esta campanha.</p>
          <p className="text-caption text-ink-3">
            A origem é registrada no contato, na aba Origem.
          </p>
        </div>
      ) : (
        <>
          <div className="divide-line flex flex-col divide-y">
            {data.items.map((a) => {
              const utms = filledUtms(a);
              return (
                <div key={a.id} className="flex items-start justify-between gap-3 py-3 first:pt-0">
                  <div className="min-w-0">
                    <Link
                      href={`/contacts/${a.contactId}`}
                      className="text-body2 text-ink hover:text-brand font-medium"
                    >
                      Ver contato
                    </Link>
                    <p className="text-caption text-ink-3 mt-0.5">
                      {a.leadSource.name} · {kindLabel(a.leadSource.kind)} ·{" "}
                      {formatCapturedAt(a.capturedAt)}
                    </p>
                    {utms.length > 0 ? (
                      <p className="text-caption text-ink-3 mt-1 truncate font-mono">
                        {utms.map((u) => `${u.label}=${u.value}`).join(" · ")}
                      </p>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
          {data.totalPages > 1 ? (
            <div className="flex items-center justify-between gap-3">
              <span className="text-small text-ink-3">
                {data.total} {data.total === 1 ? "toque" : "toques"} · página {data.page} de{" "}
                {data.totalPages}
              </span>
              <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
            </div>
          ) : null}
        </>
      )}
    </Card>
  );
}
