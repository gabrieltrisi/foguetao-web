"use client";

import { useState } from "react";
import { CheckCircle2, Link2, Loader2, ShieldAlert, Webhook } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/toast";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useSession } from "@/providers/session-provider";
import {
  useConfigureEvolutionWebhook,
  useConnectEvolution,
  useDisconnectEvolution,
  useEvolutionCapabilities,
  useEvolutionConnection,
  useEvolutionExistingConnection,
  useEvolutionWebhookState,
} from "@/hooks/integrations/use-evolution";
import {
  presentEvolutionStatus,
  type StatusTone,
} from "@/lib/integrations/evolution-presentation";
import { evolutionErrorMessage } from "@/lib/integrations/evolution-errors";
import { cn } from "@/lib/utils";
import type { ApiEvolutionCapabilities } from "@/types/api/evolution";
import { EvolutionConnectionForm } from "./evolution-connection-form";
import { EvolutionQrPanel } from "./evolution-qr-panel";

const TONE_PILL: Record<StatusTone, string> = {
  neutral: "bg-surface text-ink-2 border-line",
  info: "bg-info/10 text-info border-info/30",
  success: "bg-success/10 text-success border-success/30",
  warning: "bg-warning/10 text-warning border-warning/30",
  danger: "bg-danger/10 text-danger border-danger/30",
};

function CapabilitiesCard({ caps }: { caps: ApiEvolutionCapabilities }) {
  const rows: { label: string; on: boolean }[] = [
    { label: "Mensagens de texto", on: caps.messaging.text },
    { label: "Imagens", on: caps.messaging.image },
    { label: "Documentos", on: caps.messaging.document },
    { label: "Grupos", on: caps.features.groups },
    { label: "Broadcast", on: caps.features.broadcast },
    { label: "Templates", on: caps.features.templates },
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recursos disponíveis</CardTitle>
        <CardDescription>
          O que a integração Evolution suporta nesta versão. Recursos desativados podem chegar
          depois.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {rows.map((r) => (
            <li key={r.label} className="flex items-center gap-2 text-body">
              <span
                className={cn(
                  "inline-flex size-5 items-center justify-center rounded-full text-white",
                  r.on ? "bg-success" : "bg-line",
                )}
                aria-hidden
              >
                {r.on ? "✓" : "–"}
              </span>
              <span className={r.on ? "text-ink" : "text-ink-3"}>{r.label}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function WebhookRow({ connectionId }: { connectionId: string }) {
  const { toast } = useToast();
  const webhook = useEvolutionWebhookState(connectionId);
  const configure = useConfigureEvolutionWebhook(connectionId);
  const configured = webhook.data?.configured ?? false;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line p-4">
      <div className="flex items-start gap-3">
        <Webhook className="mt-0.5 size-5 text-ink-3" aria-hidden />
        <div>
          <p className="text-body font-medium text-ink">Webhook de recebimento</p>
          <p className="text-small text-ink-2">
            {webhook.isLoading
              ? "Verificando…"
              : configured
                ? "Configurado — mensagens recebidas serão entregues ao CRM."
                : "Ainda não configurado. Configure para receber mensagens."}
          </p>
        </div>
      </div>
      <Button
        variant={configured ? "secondary" : "primary"}
        size="sm"
        loading={configure.isPending}
        onClick={() =>
          configure.mutate(undefined, {
            onSuccess: () =>
              toast({ title: "Webhook configurado", variant: "success" }),
            onError: (err) =>
              toast({
                title: "Falha ao configurar webhook",
                description: evolutionErrorMessage(err),
                variant: "error",
              }),
          })
        }
      >
        {configured ? "Reconfigurar" : "Configurar"}
      </Button>
    </div>
  );
}

function ConnectionPanel({
  connectionId,
  onDisconnected,
}: {
  connectionId: string;
  onDisconnected: () => void;
}) {
  const { toast } = useToast();
  const conn = useEvolutionConnection(connectionId, { poll: true });
  const connect = useConnectEvolution(connectionId);
  const disconnect = useDisconnectEvolution(connectionId);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (conn.isLoading) {
    return (
      <div className="flex items-center gap-2 text-ink-2">
        <Loader2 className="size-4 animate-spin" aria-hidden /> Carregando conexão…
      </div>
    );
  }
  if (conn.isError || !conn.data) {
    return (
      <Card>
        <CardContent className="py-6 text-body text-ink-2">
          {evolutionErrorMessage(conn.error, "Não foi possível carregar a conexão.")}
        </CardContent>
      </Card>
    );
  }

  const data = conn.data;
  const view = presentEvolutionStatus(data.status);

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>{data.displayName}</CardTitle>
              <CardDescription>{view.description}</CardDescription>
            </div>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-small font-medium",
                TONE_PILL[view.tone],
              )}
            >
              {data.status === "CONNECTED" ? (
                <CheckCircle2 className="size-3.5" aria-hidden />
              ) : view.isTransitional ? (
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
              ) : null}
              {view.label}
            </span>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {view.showQr ? (
            <EvolutionQrPanel connectionId={connectionId} active={view.showQr} />
          ) : null}

          <div className="flex flex-wrap gap-2">
            {view.canConnect ? (
              <Button
                loading={connect.isPending}
                onClick={() =>
                  connect.mutate(undefined, {
                    onError: (err) =>
                      toast({
                        title: "Falha ao conectar",
                        description: evolutionErrorMessage(err),
                        variant: "error",
                      }),
                  })
                }
              >
                <Link2 className="size-4" aria-hidden />
                {data.status === "CONNECTED" ? "Reconectar" : "Conectar"}
              </Button>
            ) : null}

            {view.canDisconnect ? (
              <Button variant="secondary" onClick={() => setConfirmOpen(true)}>
                Desconectar
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <WebhookRow connectionId={connectionId} />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Desconectar instância?"
        description="A instância será desconectada do WhatsApp. A conexão, o histórico e as conversas são preservados — você pode reconectar depois gerando um novo QR."
        confirmLabel="Desconectar"
        destructive
        onConfirm={() =>
          disconnect.mutate(undefined, {
            onSuccess: () => {
              toast({ title: "Instância desconectada", variant: "success" });
              onDisconnected();
            },
            onError: (err) =>
              toast({
                title: "Falha ao desconectar",
                description: evolutionErrorMessage(err),
                variant: "error",
              }),
          })
        }
      />
    </div>
  );
}

export function EvolutionOnboarding() {
  const { can } = useSession();
  const canRead = can(PERMISSIONS.INTEGRATIONS_CONNECTIONS_READ);
  const canCreate = can(PERMISSIONS.INTEGRATIONS_CONNECTIONS_CREATE);

  const caps = useEvolutionCapabilities();
  const existing = useEvolutionExistingConnection();
  // Id derivado: uma conexão recém-criada tem prioridade sobre a descoberta.
  const [createdId, setCreatedId] = useState<string | null>(null);
  const connectionId = createdId ?? existing.data?.id ?? null;

  if (!canRead) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="WhatsApp (Evolution)" description="Integração de mensagens." />
        <Card>
          <CardContent className="flex items-center gap-3 py-6 text-body text-ink-2">
            <ShieldAlert className="size-5 text-ink-3" aria-hidden />
            Você não tem permissão para ver as integrações desta empresa.
          </CardContent>
        </Card>
      </div>
    );
  }

  const loading = caps.isLoading || existing.isLoading;
  const hasConnection = Boolean(connectionId);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="WhatsApp (Evolution)"
        description="Conecte uma instância da Evolution API para enviar e receber mensagens de WhatsApp."
      />

      {loading ? (
        <div className="flex items-center gap-2 text-ink-2">
          <Loader2 className="size-4 animate-spin" aria-hidden /> Carregando…
        </div>
      ) : caps.isError || !caps.data ? (
        <Card>
          <CardContent className="py-6 text-body text-ink-2">
            {evolutionErrorMessage(caps.error, "Não foi possível carregar a integração.")}
          </CardContent>
        </Card>
      ) : (
        <>
          <CapabilitiesCard caps={caps.data} />

          {hasConnection ? (
            <ConnectionPanel
              connectionId={connectionId as string}
              onDisconnected={() => {
                /* mantém a conexão visível (desconectada), permitindo reconectar */
              }}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Nova conexão</CardTitle>
                <CardDescription>
                  Informe os dados da sua instância Evolution para provisionar a conexão.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {canCreate ? (
                  <EvolutionConnectionForm
                    capabilities={caps.data}
                    onCreated={(conn) => setCreatedId(conn.connectionId)}
                  />
                ) : (
                  <p className="text-body text-ink-2">
                    Você não tem permissão para criar conexões. Peça a um administrador.
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
