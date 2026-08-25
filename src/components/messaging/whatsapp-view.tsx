"use client";

import { Plug, RefreshCw, Smartphone, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { ConfirmDialog } from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/toast";
import { useSession } from "@/providers/session-provider";
import {
  useConnectAccount,
  useDisconnectAccount,
  useMessagingAccounts,
  useTestAccount,
} from "@/hooks/messaging/use-messaging-accounts";
import { accountMeta, isConnected, messageForMessagingError } from "@/lib/messaging/display";
import { formatDateTime } from "@/lib/crm/display";
import type { ApiMessagingAccount } from "@/types/api/messaging";

/**
 * Contas de mensageria REAIS (`/messaging/accounts`): listar, conectar,
 * desconectar e testar.
 *
 * O QR Code NÃO tem contrato — nem endpoint, nem campo no model. A conexão é
 * delegada ao executor da IntegrationConnection (só MOCK funciona hoje). Por
 * isso o pareamento por QR aparece como indisponível, sem simular backend.
 * Criar conta exige uma IntegrationConnection MESSAGING (módulo Integrações).
 */
export function WhatsAppView() {
  const { can } = useSession();
  const { data, isLoading, isError, refetch } = useMessagingAccounts();

  if (!can("messaging.accounts.read")) {
    return (
      <p className="py-10 text-center text-body2 text-ink-3">
        Você não tem permissão para ver as contas de mensageria.
      </p>
    );
  }
  if (isError) {
    return <ErrorState title="Não foi possível carregar as contas." onRetry={() => refetch()} />;
  }
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-44 w-full" />
        ))}
      </div>
    );
  }

  const accounts = data?.items ?? [];

  return (
    <div className="flex flex-col gap-4">
      <p className="flex items-center gap-2 rounded-lg border border-line bg-surface px-4 py-2.5 text-caption text-ink-2">
        <Plug className="size-4 shrink-0 text-ink-3" aria-hidden />
        O pareamento por QR Code ainda não tem contrato no backend —{" "}
        <strong className="font-semibold">disponível em breve</strong>. A conexão usa o executor da
        integração vinculada à conta.
      </p>

      {accounts.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 p-10 text-center">
          <Smartphone className="size-6 text-ink-3" aria-hidden />
          <p className="text-body2 font-medium text-ink">Nenhuma conta de mensageria.</p>
          <p className="max-w-sm text-body2 text-ink-3">
            As contas são criadas a partir de uma conexão de integração do tipo MESSAGING.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {accounts.map((acc) => (
            <AccountCard key={acc.id} account={acc} />
          ))}
        </div>
      )}
    </div>
  );
}

function AccountCard({ account }: { account: ApiMessagingAccount }) {
  const { toast } = useToast();
  const { can } = useSession();
  const connect = useConnectAccount();
  const disconnect = useDisconnectAccount();
  const test = useTestAccount();

  const meta = accountMeta(account.status);
  const connected = isConnected(account.status);
  const canConnect = can("messaging.accounts.connect");
  const pending = connect.isPending || disconnect.isPending || test.isPending;
  const onError = (e: unknown) => toast({ title: messageForMessagingError(e), variant: "error" });

  return (
    <Card className={cn("flex flex-col gap-4 p-5", pending && "opacity-70")}>
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-success/10 text-success">
          <Smartphone className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-h3 font-semibold text-ink">{account.name}</p>
          <p className="truncate text-caption text-ink-3">
            {account.phoneNumber ?? account.displayName ?? account.provider}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 rounded-lg border border-line bg-surface px-3 py-2">
        <Badge tone={meta.tone}>{meta.label}</Badge>
        <span className="truncate text-caption text-ink-3">
          {account.lastConnectedAt ? `Conectada: ${formatDateTime(account.lastConnectedAt)}` : "—"}
        </span>
      </div>

      {canConnect ? (
        <div className="flex flex-wrap items-center gap-2">
          {connected ? (
            <>
              <Button
                variant="secondary"
                size="sm"
                loading={test.isPending}
                onClick={() =>
                  test.mutate(account.id, {
                    onSuccess: () => toast({ title: "Conta testada", variant: "success" }),
                    onError,
                  })
                }
              >
                <RefreshCw />
                Testar
              </Button>
              <ConfirmDialog
                trigger={
                  <Button variant="ghost" size="sm" className="text-danger">
                    <Trash2 />
                    Desconectar
                  </Button>
                }
                title={`Desconectar ${account.name}?`}
                description="As conversas continuam salvas, mas novas mensagens não serão recebidas."
                confirmLabel="Desconectar"
                destructive
                onConfirm={() =>
                  disconnect.mutate(account.id, {
                    onSuccess: () => toast({ title: "Conta desconectada", variant: "warning" }),
                    onError,
                  })
                }
              />
            </>
          ) : (
            <Button
              size="sm"
              loading={connect.isPending}
              onClick={() =>
                connect.mutate(account.id, {
                  onSuccess: () => toast({ title: "Conta conectada", variant: "success" }),
                  onError,
                })
              }
            >
              <Plug />
              Conectar
            </Button>
          )}
        </div>
      ) : null}
    </Card>
  );
}
