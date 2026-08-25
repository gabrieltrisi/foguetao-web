"use client";

import Link from "next/link";
import { Plus, ShieldAlert } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { StatList } from "@/components/business/kpi-block";
import { AdminIcon } from "@/components/admin/admin-icon";
import { DetailPageLayout } from "@/components/patterns/page-patterns";
import { useSession } from "@/providers/session-provider";
import { useCatalogItem, useConnections } from "@/hooks/integrations/use-integrations";
import { PERMISSIONS } from "@/lib/auth/permissions";
import {
  authModeMeta,
  availabilityMeta,
  capabilityLabel,
  catalogCategoryMeta,
  connectionStatusMeta,
  formatDateTime,
} from "@/lib/integrations/display";
import { isApiError } from "@/types/api/error";

/** Detalhe de um item do CATÁLOGO (produto), não de uma conexão da empresa. */
export function IntegrationDetail({ catalogKey }: { catalogKey: string }) {
  const { can } = useSession();
  const { data: item, isLoading, isError, error, refetch } = useCatalogItem(catalogKey);

  // Conexões desta empresa para este provider. Só busca quando o item é
  // conectável (itens "em breve" não têm provider e nunca terão conexão).
  const connections = useConnections(
    item?.provider ? { provider: item.provider, limit: 50 } : undefined,
  );

  if (!can(PERMISSIONS.INTEGRATIONS_CONNECTIONS_READ)) {
    return (
      <p className="py-16 text-center text-body2 text-ink-3">
        Você não tem permissão para ver integrações.
      </p>
    );
  }
  if (isLoading) {
    return <p className="py-16 text-center text-body2 text-ink-3">Carregando integração…</p>;
  }
  if (isError || !item) {
    const notFound = isApiError(error) && error.statusCode === 404;
    return (
      <ErrorState
        title={notFound ? "Integração não encontrada." : "Não foi possível carregar a integração."}
        onRetry={notFound ? undefined : () => refetch()}
      />
    );
  }

  const availability = availabilityMeta[item.availability];
  const canCreate = can(PERMISSIONS.INTEGRATIONS_CONNECTIONS_CREATE) && item.connectable;
  const items = item.provider ? (connections.data?.items ?? []) : [];

  const aside = (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={availability.tone}>{availability.label}</Badge>
          {item.mock ? <Badge tone="info">MOCK</Badge> : null}
        </div>
        <StatList
          items={[
            { label: "Categoria", value: catalogCategoryMeta[item.category] },
            { label: "Autenticação prevista", value: authModeMeta[item.authMode] },
            { label: "Adapter implementado", value: item.implemented ? "Sim" : "Não" },
          ]}
        />
      </Card>

      <Card className="flex flex-col gap-2 p-4">
        <p className="text-caption font-semibold uppercase tracking-wide text-ink-3">
          Capabilities previstas
        </p>
        {item.capabilities.length === 0 ? (
          <p className="text-body2 text-ink-3">
            Nenhuma capability declarada — não há adapter registrado.
          </p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {item.capabilities.map((c) => (
              <span key={c} className="rounded bg-surface px-2 py-1 text-caption text-ink-2">
                {capabilityLabel[c] ?? c}
              </span>
            ))}
          </div>
        )}
      </Card>
    </div>
  );

  return (
    <DetailPageLayout
      title={item.name}
      subtitle={catalogCategoryMeta[item.category]}
      back={{ href: "/integrations", label: "Integrações" }}
      actions={
        canCreate ? (
          <Button asChild size="sm">
            <Link href={`/integrations/connections/new?provider=${item.key}`}>
              <Plus />
              Criar configuração
            </Link>
          </Button>
        ) : null
      }
      aside={aside}
    >
      <div className="flex flex-col gap-4">
        <Card className="flex items-start gap-2 p-4 text-body2 text-ink-2">
          <ShieldAlert className="mt-0.5 size-4 shrink-0 text-info" aria-hidden />
          <span>
            Nenhuma conexão com serviços externos será realizada. Esta área prepara a estrutura
            (configuração, credenciais, logs) para quando a integração real existir.
          </span>
        </Card>

        <Card className="flex flex-col gap-3 p-5">
          <span className="flex size-11 items-center justify-center rounded-xl bg-surface text-ink">
            <AdminIcon name={item.icon} className="size-6" />
          </span>
          <p className="text-body2 text-ink-2">{item.description}</p>
          <div>
            <p className="text-caption font-semibold uppercase tracking-wide text-ink-3">
              O que fará
            </p>
            <p className="mt-1 text-body2 text-ink-2">{item.docsSummary}</p>
          </div>
          <div>
            <p className="text-caption font-semibold uppercase tracking-wide text-ink-3">
              Limitações atuais
            </p>
            <p className="mt-1 text-body2 text-ink-2">{item.limitations}</p>
          </div>
        </Card>

        <Card className="flex flex-col gap-3 p-5">
          <p className="font-display text-h3 font-semibold text-ink">Conexões da empresa</p>
          {!item.provider ? (
            <p className="text-body2 text-ink-3">
              Esta integração ainda não pode ter conexões.
            </p>
          ) : connections.isLoading ? (
            <p className="text-body2 text-ink-3">Carregando…</p>
          ) : items.length === 0 ? (
            <p className="text-body2 text-ink-3">
              Nenhuma conexão configurada para esta integração.
            </p>
          ) : (
            <ul className="flex flex-col gap-2" aria-label="Conexões desta integração">
              {items.map((c) => {
                const status = connectionStatusMeta[c.status];
                return (
                  <li key={c.id}>
                    <Link
                      href={`/integrations/connections/${c.id}`}
                      className="flex items-center justify-between gap-3 rounded-lg border border-line p-3 transition-colors hover:border-brand/40"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-ink">{c.name}</span>
                        <span className="block text-caption text-ink-3">
                          Última verificação: {formatDateTime(c.lastConnectedAt)}
                        </span>
                      </span>
                      <Badge tone={status.tone}>{status.label}</Badge>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </DetailPageLayout>
  );
}
