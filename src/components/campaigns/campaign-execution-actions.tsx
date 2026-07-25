"use client";

import * as React from "react";
import { Play, Pause, Send, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  ConfirmDialog,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/toast";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useSession } from "@/providers/session-provider";
import {
  useCancelCampaign,
  usePauseCampaign,
  useResumeCampaign,
  useSendNowCampaign,
} from "@/hooks/campaigns/use-campaigns";
import { campaignActionsByStatus } from "@/lib/campaigns/actions";
import { messageForCampaignError } from "@/lib/campaigns/errors";
import type { ApiCampaign } from "@/types/api/campaigns";

/**
 * Ações OPERACIONAIS de uma campanha (enviar agora / pausar / retomar / cancelar).
 * Só mostra ações VÁLIDAS pelo estado (máquina de estados) E permitidas (RBAC).
 * Atualiza após a resposta do backend (sem otimismo em transição crítica).
 */
export function CampaignExecutionActions({
  campaign,
  size = "sm",
}: {
  campaign: ApiCampaign;
  size?: "sm" | "md";
}) {
  const { can } = useSession();
  const { toast } = useToast();
  const [sendOpen, setSendOpen] = React.useState(false);
  const [cancelOpen, setCancelOpen] = React.useState(false);

  const sendNow = useSendNowCampaign(campaign.id);
  const pause = usePauseCampaign(campaign.id);
  const resume = useResumeCampaign(campaign.id);
  const cancel = useCancelCampaign(campaign.id);

  const avail = campaignActionsByStatus(campaign.status);
  const canSend = can(PERMISSIONS.MESSAGING_CAMPAIGNS_SEND);
  const canCancel = can(PERMISSIONS.MESSAGING_CAMPAIGNS_CANCEL);

  const showSend = avail.sendNow && canSend;
  const showPause = avail.pause && canSend;
  const showResume = avail.resume && canSend;
  const showCancel = avail.cancel && canCancel;

  if (!showSend && !showPause && !showResume && !showCancel) return null;

  const onErr = (err: unknown) =>
    toast({ title: messageForCampaignError(err), variant: "error" });

  return (
    <div className="flex flex-wrap items-center gap-2">
      {showSend ? (
        <Button size={size} onClick={() => setSendOpen(true)} loading={sendNow.isPending}>
          <Send /> Enviar agora
        </Button>
      ) : null}

      {showPause ? (
        <ConfirmDialog
          trigger={
            <Button size={size} variant="secondary" loading={pause.isPending}>
              <Pause /> Pausar
            </Button>
          }
          title="Pausar a campanha?"
          description="Novos destinatários deixam de ser processados. Mensagens já enfileiradas podem continuar sendo entregues, e as métricas seguem sendo atualizadas."
          confirmLabel="Pausar"
          onConfirm={() =>
            pause.mutate(undefined, {
              onSuccess: () => toast({ title: "Campanha pausada", variant: "success" }),
              onError: onErr,
            })
          }
        />
      ) : null}

      {showResume ? (
        <ConfirmDialog
          trigger={
            <Button size={size} loading={resume.isPending}>
              <Play /> Retomar
            </Button>
          }
          title="Retomar a campanha?"
          description="A campanha continua a partir dos destinatários pendentes. Não há reenvio dos já processados."
          confirmLabel="Retomar"
          onConfirm={() =>
            resume.mutate(undefined, {
              onSuccess: () => toast({ title: "Campanha retomada", variant: "success" }),
              onError: onErr,
            })
          }
        />
      ) : null}

      {showCancel ? (
        <Button
          size={size}
          variant="ghost"
          className="text-danger hover:bg-danger/10"
          onClick={() => setCancelOpen(true)}
          loading={cancel.isPending}
        >
          <XCircle /> Cancelar
        </Button>
      ) : null}

      {/* Enviar agora — resumo + confirmação (não confia no modal p/ segurança). */}
      <AlertDialog open={sendOpen} onOpenChange={setSendOpen}>
        <AlertDialogContent>
          <AlertDialogTitle>Enviar campanha agora?</AlertDialogTitle>
          <AlertDialogDescription>
            Você está prestes a iniciar o envio para{" "}
            <strong>{campaign.counters.eligible}</strong> destinatário(s) elegíveis. O processamento
            começa imediatamente e respeita o limite configurado da conta.
          </AlertDialogDescription>
          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 text-small">
            <dt className="text-ink-3">Elegíveis</dt>
            <dd className="text-ink">{campaign.counters.eligible}</dd>
            <dt className="text-ink-3">Excluídos</dt>
            <dd className="text-ink">{campaign.counters.excluded}</dd>
          </dl>
          <div className="mt-6 flex justify-end gap-2">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="primary"
              onClick={() =>
                sendNow.mutate(undefined, {
                  onSuccess: () => toast({ title: "Envio iniciado", variant: "success" }),
                  onError: onErr,
                })
              }
            >
              Enviar agora
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancelar — destrutivo; explica o que continua a ser entregue. */}
      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent>
          <AlertDialogTitle>Cancelar a campanha?</AlertDialogTitle>
          <AlertDialogDescription>
            O cancelamento impede novos destinatários de entrarem no envio. Mensagens já enviadas ou
            em processamento podem continuar sendo entregues — isso não é revertido.
          </AlertDialogDescription>
          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 text-small">
            <dt className="text-ink-3">Enviados</dt>
            <dd className="text-ink">{campaign.counters.sent}</dd>
            <dt className="text-ink-3">Entregues</dt>
            <dd className="text-ink">{campaign.counters.delivered}</dd>
          </dl>
          <div className="mt-6 flex justify-end gap-2">
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              variant="danger"
              onClick={() =>
                cancel.mutate(undefined, {
                  onSuccess: () => toast({ title: "Campanha cancelada", variant: "success" }),
                  onError: onErr,
                })
              }
            >
              Cancelar campanha
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
