"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, KeyRound, Pause, Play, Play as Run, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/alert-dialog";
import { ErrorState } from "@/components/ui/error-state";
import { StatList } from "@/components/business/kpi-block";
import { DetailPageLayout } from "@/components/patterns/page-patterns";
import { useToast } from "@/components/ui/toast";
import { useSession } from "@/providers/session-provider";
import {
  useConnection,
  useConnectionLogs,
  useConnectConnection,
  useDeleteConnection,
  useDisconnectConnection,
  useIntegrationCatalog,
  useTestConnection,
} from "@/hooks/integrations/use-integrations";
import { PERMISSIONS } from "@/lib/auth/permissions";
import {
  capabilityLabel,
  connectionStatusMeta,
  formatDateTime,
  formatDuration,
  logStatusMeta,
  messageForIntegrationError,
  operationLabel,
} from "@/lib/integrations/display";
import { isApiError } from "@/types/api/error";

export function ConnectionDetail({ id }: { id: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const { can } = useSession();
  const { data: connection, isLoading, isError, error, refetch } = useConnection(id);

  const canReadLogs = can(PERMISSIONS.INTEGRATIONS_LOGS_READ);
  const logs = useConnectionLogs(id, { limit: 10 }, canReadLogs);

  const catalog = useIntegrationCatalog();
  const test = useTestConnection(id);
  const connect = useConnectConnection(id);
  const disconnect = useDisconnectConnection(id);
  const del = useDeleteConnection();

  const [confirmDelete, setConfirmDelete] = React.useState(false);

  if (!can(PERMISSIONS.INTEGRATIONS_CONNECTIONS_READ)) {
    return (
      <p className="py-16 text-center text-body2 text-ink-3">
        Você não tem permissão para ver conexões.
      </p>
    );
  }
  if (isLoading) {
    return <p className="py-16 text-center text-body2 text-ink-3">Carregando conexão…</p>;
  }
  if (isError || !connection) {
    const notFound = isApiError(error) && error.statusCode === 404;
    return (
      <ErrorState
        title={notFound ? "Conexão não encontrada." : "Não foi possível carregar a conexão."}
        onRetry={notFound ? undefined : () => refetch()}
      />
    );
  }

  const status = connectionStatusMeta[connection.status];
  const catalogItem = catalog.data?.items.find((i) => i.provider === connection.provider);
  const onError = (e: unknown) => toast({ title: messageForIntegrationError(e), variant: "error" });

  const isConnected = connection.status === "CONNECTED";
  const isRevoked = connection.status === "REVOKED";
  // Não há permissão dedicada a ativar/pausar: o backend exige `update`.
  const canOperate = can(PERMISSIONS.INTEGRATIONS_CONNECTIONS_UPDATE) && !isRevoked;
  const canTest = can(PERMISSIONS.INTEGRATIONS_CONNECTIONS_TEST) && !isRevoked;
  const canEdit = can(PERMISSIONS.INTEGRATIONS_CONNECTIONS_UPDATE) && !isRevoked;
  const canDelete = can(PERMISSIONS.INTEGRATIONS_CONNECTIONS_DELETE);

  const configEntries = Object.entries(connection.config ?? {});

  const aside = (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={status.tone}>{status.label}</Badge>
          {catalogItem?.mock ? <Badge tone="info">MOCK</Badge> : null}
          {!connection.implemented ? <Badge tone="neutral">Sem adapter</Badge> : null}
        </div>
        <StatList
          items={[
            { label: "Integração", value: catalogItem?.name ?? connection.provider },
            { label: "Ambiente", value: connection.environment === "SANDBOX" ? "Sandbox" : "Produção" },
            { label: "Última verificação", value: formatDateTime(connection.lastConnectedAt) },
            { label: "Último sucesso", value: formatDateTime(connection.lastSuccessfulAt) },
            { label: "Última falha", value: formatDateTime(connection.lastFailureAt) },
          ]}
        />
      </Card>

      <Card className="flex flex-col gap-2 p-4">
        <p className="flex items-center gap-2 text-caption font-semibold uppercase tracking-wide text-ink-3">
          <KeyRound className="size-3.5" aria-hidden /> Credenciais
        </p>
        {/* Só indicadores. A API não expõe o segredo e nenhuma tela o reexibe. */}
        <StatList
          items={[
            {
              label: "Cadastradas",
              value: connection.credentialsSummary?.total ?? 0,
            },
            { label: "Revogadas", value: connection.credentialsSummary?.revoked ?? 0 },
            { label: "Expiradas", value: connection.credentialsSummary?.expired ?? 0 },
          ]}
        />
        <p className="text-caption text-ink-3">
          Valores de credencial nunca são exibidos novamente após salvos.
        </p>
      </Card>

      {connection.capabilities.length > 0 ? (
        <Card className="flex flex-col gap-2 p-4">
          <p className="text-caption font-semibold uppercase tracking-wide text-ink-3">
            Capabilities
          </p>
          <div className="flex flex-wrap gap-1.5">
            {connection.capabilities.map((c) => (
              <span key={c} className="rounded bg-surface px-2 py-1 text-caption text-ink-2">
                {capabilityLabel[c] ?? c}
              </span>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );

  return (
    <DetailPageLayout
      title={connection.name}
      subtitle={catalogItem?.name ?? connection.provider}
      back={{ href: "/integrations/connections", label: "Conexões" }}
      actions={
        <>
          {canTest ? (
            <Button
              size="sm"
              variant="secondary"
              loading={test.isPending}
              onClick={() =>
                test.mutate(undefined, {
                  onSuccess: (r) =>
                    toast({
                      title: r.success ? "Teste concluído com sucesso" : "Teste retornou falha",
                      variant: r.success ? "success" : "error",
                    }),
                  onError,
                })
              }
            >
              <Run />
              Testar estrutura
            </Button>
          ) : null}
          {canOperate ? (
            isConnected ? (
              <Button
                size="sm"
                variant="secondary"
                loading={disconnect.isPending}
                onClick={() =>
                  disconnect.mutate(undefined, {
                    onSuccess: () => toast({ title: "Conexão pausada", variant: "success" }),
                    onError,
                  })
                }
              >
                <Pause />
                Pausar
              </Button>
            ) : (
              <Button
                size="sm"
                loading={connect.isPending}
                onClick={() =>
                  connect.mutate(undefined, {
                    onSuccess: () => toast({ title: "Conexão ativada", variant: "success" }),
                    onError,
                  })
                }
              >
                <Play />
                Ativar
              </Button>
            )
          ) : null}
          {canEdit ? (
            <Button asChild size="sm" variant="secondary">
              <Link href={`/integrations/connections/${id}/edit`}>Editar</Link>
            </Button>
          ) : null}
          {canDelete ? (
            <Button
              size="icon-sm"
              variant="secondary"
              aria-label="Excluir conexão"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 />
            </Button>
          ) : null}
        </>
      }
      aside={aside}
    >
      <div className="flex flex-col gap-4">
        {connection.lastErrorCode ? (
          <Card className="flex items-start gap-2 p-4 text-body2 text-danger">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>
              <span className="font-medium">{connection.lastErrorCode}</span>
              {connection.lastErrorMessageSanitized
                ? ` — ${connection.lastErrorMessageSanitized}`
                : null}
            </span>
          </Card>
        ) : null}

        <Card className="flex flex-col gap-3 p-5">
          <p className="font-display text-h3 font-semibold text-ink">Configuração</p>
          <p className="text-caption text-ink-3">
            Somente dados não sensíveis. Segredos ficam cifrados e nunca aparecem aqui.
          </p>
          {configEntries.length === 0 ? (
            <p className="text-body2 text-ink-3">Sem configuração.</p>
          ) : (
            <StatList
              items={configEntries.map(([k, v]) => ({ label: k, value: String(v) }))}
            />
          )}
        </Card>

        <Card className="flex flex-col gap-3 p-5">
          <p className="font-display text-h3 font-semibold text-ink">Últimas execuções</p>
          {!canReadLogs ? (
            <p className="text-body2 text-ink-3">
              Você não tem permissão para ver os logs desta conexão.
            </p>
          ) : logs.isLoading ? (
            <p className="text-body2 text-ink-3">Carregando…</p>
          ) : (logs.data?.items.length ?? 0) === 0 ? (
            <p className="text-body2 text-ink-3">
              Nenhuma execução registrada. Use “Testar estrutura” para gerar a primeira.
            </p>
          ) : (
            <ul className="flex flex-col gap-2" aria-label="Logs da conexão">
              {logs.data?.items.map((log) => {
                const meta = logStatusMeta[log.status];
                return (
                  <li
                    key={log.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line p-3"
                  >
                    <span className="min-w-0">
                      <span className="block font-medium text-ink">
                        {operationLabel[log.operation] ?? log.operation}
                      </span>
                      <span className="block text-caption text-ink-3">
                        {formatDateTime(log.createdAt)} · {formatDuration(log.durationMs)} · tentativa{" "}
                        {log.attempt}
                        {log.errorCode ? ` · ${log.errorCode}` : ""}
                      </span>
                    </span>
                    <Badge tone={meta.tone}>{meta.label}</Badge>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Excluir conexão?"
        description="As credenciais associadas serão revogadas. Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        destructive
        onConfirm={() => {
          setConfirmDelete(false);
          del.mutate(id, {
            onSuccess: () => {
              toast({ title: "Conexão excluída", variant: "success" });
              router.push("/integrations/connections");
            },
            onError,
          });
        }}
      />
    </DetailPageLayout>
  );
}
