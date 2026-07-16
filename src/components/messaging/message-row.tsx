"use client";

import * as React from "react";
import { AlertCircle, Check, CheckCheck, Clock, FileText, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useSession } from "@/providers/session-provider";
import { useCancelMessage, useMessageDetail } from "@/hooks/messaging/use-messages";
import {
  isCancelable,
  isFailed,
  isPendingSend,
  messageForMessagingError,
  messageStatusLabel,
  messageTime,
} from "@/lib/messaging/display";
import type { ApiMessage } from "@/types/api/messaging";

/**
 * Um balão de mensagem real.
 *
 * A LISTAGEM só traz `preview` — o texto completo exige
 * `GET /messaging/messages/:id`. Para não fazer N+1, o conteúdo completo só é
 * buscado quando o usuário pede ("Ver mensagem completa"), e apenas se o
 * preview estiver truncado.
 */
export function MessageRow({
  message: m,
  conversationId,
}: {
  message: ApiMessage;
  conversationId: string;
}) {
  const { toast } = useToast();
  const { can } = useSession();
  const [expanded, setExpanded] = React.useState(false);
  const detail = useMessageDetail(expanded ? m.id : null);
  const cancel = useCancelMessage(conversationId);

  if (m.direction === "SYSTEM") {
    return (
      <div className="my-2 flex justify-center">
        <span className="rounded-full bg-line/60 px-3 py-1 text-caption text-ink-2">
          {m.preview ?? messageStatusLabel[m.status] ?? m.status}
        </span>
      </div>
    );
  }

  const isOut = m.direction === "OUTBOUND";
  const failed = isFailed(m.status);
  const pending = isPendingSend(m.status);
  const fullText = readText(detail.data?.content);
  const text = expanded && fullText ? fullText : (m.preview ?? "");

  return (
    <div className={cn("flex", isOut ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[78%] rounded-2xl px-3 py-2 text-body2 shadow-sm sm:max-w-[65%]",
          isOut
            ? "rounded-br-md bg-brand text-white"
            : "rounded-bl-md border border-line bg-white text-ink",
          failed && "opacity-80 ring-1 ring-danger",
          pending && "opacity-70",
        )}
      >
        {m.type === "IMAGE" ? (
          <div
            className={cn(
              "flex h-36 w-48 items-center justify-center rounded-lg",
              isOut ? "bg-white/15" : "bg-surface",
            )}
          >
            <ImageIcon className={cn("size-8", isOut ? "text-white/70" : "text-ink-3")} aria-hidden />
          </div>
        ) : null}

        {m.type === "DOCUMENT" ? (
          <div
            className={cn(
              "flex items-center gap-2.5 rounded-lg p-2",
              isOut ? "bg-white/15" : "bg-surface",
            )}
          >
            <span
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-lg",
                isOut ? "bg-white/20 text-white" : "bg-brand-soft text-brand",
              )}
            >
              <FileText className="size-4" aria-hidden />
            </span>
            <span className="min-w-0 truncate font-medium">Documento</span>
          </div>
        ) : null}

        {text ? <p className={cn("whitespace-pre-wrap", m.type !== "TEXT" && "mt-1.5")}>{text}</p> : null}

        {/* O preview pode estar truncado; o texto completo é outro endpoint. */}
        {m.type === "TEXT" && !expanded && can("messaging.messages.read") && isTruncated(m.preview) ? (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className={cn(
              "mt-1 text-caption underline underline-offset-2",
              isOut ? "text-white/80" : "text-brand",
            )}
          >
            Ver mensagem completa
          </button>
        ) : null}

        {failed && m.errorCode ? (
          <p className={cn("mt-1 text-caption", isOut ? "text-white/80" : "text-danger")}>
            Falha no envio ({m.errorCode})
          </p>
        ) : null}

        <div
          className={cn(
            "mt-1 flex items-center justify-end gap-1 text-[10px]",
            isOut ? "text-white/70" : "text-ink-3",
          )}
        >
          {messageTime(m)}
          {isOut ? <StatusIcon status={m.status} /> : null}
        </div>

        {isOut && isCancelable(m.status) && can("messaging.messages.cancel") ? (
          <div className="mt-1 flex justify-end">
            <Button
              size="sm"
              variant="ghost"
              className={cn("h-6 px-1.5 text-[10px]", isOut && "text-white/80 hover:text-white")}
              loading={cancel.isPending}
              onClick={() =>
                cancel.mutate(m.id, {
                  onSuccess: () => toast({ title: "Mensagem cancelada", variant: "success" }),
                  onError: (e) => toast({ title: messageForMessagingError(e), variant: "error" }),
                })
              }
            >
              Cancelar
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** Ícone de status real da mensagem (sem inventar "lida" quando não é). */
function StatusIcon({ status }: { status: string }) {
  const label = messageStatusLabel[status] ?? status;
  if (status === "READ") return <CheckCheck className="size-3" aria-label={label} />;
  if (status === "DELIVERED") return <CheckCheck className="size-3 opacity-70" aria-label={label} />;
  if (status === "SENT") return <Check className="size-3" aria-label={label} />;
  if (status === "FAILED" || status === "CANCELED")
    return <AlertCircle className="size-3" aria-label={label} />;
  return <Clock className="size-3" aria-label={label} />;
}

/** O conteúdo decifrado é versionado: `{version, type, text, ...}`. */
function readText(content: Record<string, unknown> | null | undefined): string | null {
  if (!content) return null;
  const text = content.text;
  return typeof text === "string" ? text : null;
}

/** O backend trunca o preview; reticências indicam que há mais conteúdo. */
function isTruncated(preview: string | null): boolean {
  return Boolean(preview && (preview.endsWith("…") || preview.endsWith("...")));
}
