"use client";

import { Loader2, QrCode, RefreshCw } from "lucide-react";
import { useEvolutionQr } from "@/hooks/integrations/use-evolution";
import type { ApiEvolutionQr } from "@/types/api/evolution";

interface Props {
  connectionId: string;
  /** Só busca/pollan o QR quando a conexão está aguardando leitura. */
  active: boolean;
}

/** Aceita apenas data-url de imagem — evita renderizar payload inesperado. */
function isRenderableImage(qr: ApiEvolutionQr): qr is ApiEvolutionQr & {
  qr: { format: "data-url"; value: string };
} {
  return (
    qr.available === true &&
    qr.qr?.format === "data-url" &&
    typeof qr.qr.value === "string" &&
    qr.qr.value.startsWith("data:image/")
  );
}

const REASON_TEXT: Record<string, string> = {
  QR_NOT_READY: "Gerando o QR code…",
  QR_EXPIRED: "O QR code expirou. Um novo será gerado automaticamente.",
  ALREADY_CONNECTED: "Instância já conectada.",
  CONNECTION_NOT_READY: "Preparando a conexão…",
};

export function EvolutionQrPanel({ connectionId, active }: Props) {
  const qrQuery = useEvolutionQr(connectionId, active);
  const qr = qrQuery.data;

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-line bg-surface/40 p-6 text-center">
      <div className="flex size-56 items-center justify-center rounded-lg border border-line bg-white">
        {qr && isRenderableImage(qr) ? (
          // eslint-disable-next-line @next/next/no-img-element -- data-url efêmero, não passa pelo otimizador
          <img
            src={qr.qr.value}
            alt="QR code para conectar o WhatsApp"
            className="size-52"
            draggable={false}
          />
        ) : qrQuery.isLoading || (qr && !qr.available && qr.reason !== "ALREADY_CONNECTED") ? (
          <Loader2 className="size-8 animate-spin text-ink-3" aria-hidden />
        ) : (
          <QrCode className="size-10 text-ink-3" aria-hidden />
        )}
      </div>

      <p className="max-w-xs text-small text-ink-2">
        {qr && !qr.available && qr.reason
          ? (REASON_TEXT[qr.reason] ?? "Aguardando o QR code…")
          : "Abra o WhatsApp › Aparelhos conectados › Conectar aparelho e aponte a câmera."}
      </p>

      {qrQuery.isError ? (
        <p className="flex items-center gap-1.5 text-small text-ink-3">
          <RefreshCw className="size-3.5" aria-hidden /> Recarregando o QR…
        </p>
      ) : null}
    </div>
  );
}
