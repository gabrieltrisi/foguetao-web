"use client";

import * as React from "react";
import { Plus, QrCode, RefreshCw, Smartphone, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal, ModalContent, ModalTrigger } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/toast";
import { QRCodeMock } from "@/components/messaging/qr-mock";
import { whatsappAccounts } from "@/mocks/messaging/accounts";
import type { AccountStatus, WhatsAppAccount } from "@/types/messaging";

const statusConfig: Record<AccountStatus, { label: string; dot: string; text: string }> = {
  connected: { label: "Conectado", dot: "bg-success", text: "text-success" },
  pending: { label: "Aguardando leitura", dot: "bg-warning", text: "text-warning" },
  disconnected: { label: "Desconectado", dot: "bg-ink-3", text: "text-ink-3" },
};

function QRModalContent({ account }: { account?: WhatsAppAccount }) {
  const [seed, setSeed] = React.useState("foguetao-wa");
  return (
    <ModalContent
      title={account ? `Conectar ${account.name}` : "Conectar WhatsApp"}
      description="Abra o WhatsApp no celular › Aparelhos conectados › Conectar aparelho."
    >
      <div className="flex flex-col items-center gap-4">
        <div className="rounded-xl border border-line p-3">
          <QRCodeMock seed={seed} size={188} />
        </div>
        <p className="flex items-center gap-1.5 text-caption text-ink-3">
          <span className="size-1.5 animate-pulse rounded-full bg-warning" aria-hidden />
          Aguardando leitura do QR Code…
        </p>
        <Button variant="secondary" size="sm" onClick={() => setSeed(`foguetao-${seed.length}`)}>
          <RefreshCw />
          Gerar novo QR
        </Button>
      </div>
    </ModalContent>
  );
}

export function WhatsAppView() {
  const { toast } = useToast();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {whatsappAccounts.map((acc) => {
        const s = statusConfig[acc.status];
        const connected = acc.status === "connected";
        return (
          <Card key={acc.id} className="flex flex-col gap-4 p-5">
            <div className="flex items-start gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-success/10 text-success">
                <Smartphone className="size-5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-h3 font-semibold text-ink">{acc.name}</p>
                <p className="truncate text-caption text-ink-3">{acc.number}</p>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-line bg-surface px-3 py-2">
              <span className={cn("inline-flex items-center gap-1.5 text-body2 font-medium", s.text)}>
                <span className={cn("size-2 rounded-full", s.dot)} aria-hidden />
                {s.label}
              </span>
              <span className="text-caption text-ink-3">Sinc.: {acc.lastSync}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {connected ? (
                <>
                  <Button variant="secondary" size="sm" onClick={() => toast({ title: "Sincronizando… (mock)" })}>
                    <RefreshCw />
                    Sincronizar
                  </Button>
                  <ConfirmDialog
                    trigger={
                      <Button variant="ghost" size="sm" className="text-danger">
                        <Trash2 />
                        Desconectar
                      </Button>
                    }
                    title={`Desconectar ${acc.name}?`}
                    description="As conversas continuam salvas, mas novas mensagens não serão recebidas."
                    confirmLabel="Desconectar"
                    destructive
                    onConfirm={() => toast({ title: "Conta desconectada (mock)", variant: "warning" })}
                  />
                </>
              ) : (
                <Modal>
                  <ModalTrigger asChild>
                    <Button size="sm">
                      <QrCode />
                      Conectar
                    </Button>
                  </ModalTrigger>
                  <QRModalContent account={acc} />
                </Modal>
              )}
            </div>
          </Card>
        );
      })}

      {/* Nova conta */}
      <Modal>
        <ModalTrigger asChild>
          <button
            type="button"
            className="flex min-h-[180px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-line text-ink-3 transition-colors hover:border-brand/40 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <Plus className="size-6" aria-hidden />
            <span className="text-body2 font-medium">Conectar novo número</span>
          </button>
        </ModalTrigger>
        <QRModalContent />
      </Modal>
    </div>
  );
}
