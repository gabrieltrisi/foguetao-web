"use client";

import * as React from "react";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const TEXT_LIMIT = 8192;

/**
 * Composer da Inbox.
 *
 * Bloco 2: fica como SHELL — quando `onSend` não é fornecido (ou `canSend` é
 * falso) o campo fica desabilitado, com a razão humana quando indisponível. O
 * envio real (mutation + cache) é ligado no Bloco 3 passando `onSend`.
 *
 * `onSend` devolve uma Promise: o texto só é limpo quando ela resolve (202); em
 * falha, o texto é preservado para o usuário reenviar. Enter envia; Shift+Enter
 * quebra linha.
 */
export function InboxComposer({
  canSend,
  disabledReason,
  onSend,
}: {
  canSend: boolean;
  disabledReason?: string;
  onSend?: (text: string) => Promise<unknown>;
}) {
  const [text, setText] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  const enabled = canSend && Boolean(onSend);
  const trimmed = text.trim();
  const overLimit = text.length > TEXT_LIMIT;
  const canSubmit = enabled && !pending && trimmed.length > 0 && !overLimit;

  async function submit() {
    if (!canSubmit || !onSend) return;
    setPending(true);
    try {
      await onSend(trimmed);
      setText(""); // limpa só no sucesso (202)
      inputRef.current?.focus();
    } catch {
      // preserva o texto em falha; o toast de erro vem de quem passou `onSend`.
    } finally {
      setPending(false);
    }
  }

  if (canSend === false && disabledReason) {
    return (
      <div className="border-t border-line bg-white px-4 py-3">
        <p className="text-center text-caption text-ink-3">{disabledReason}</p>
      </div>
    );
  }

  return (
    <div className="border-t border-line bg-white p-3">
      <div className="flex items-end gap-2">
        <textarea
          ref={inputRef}
          value={text}
          disabled={!enabled}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void submit();
            }
          }}
          rows={1}
          maxLength={TEXT_LIMIT + 500}
          placeholder={enabled ? "Escreva uma mensagem…" : "Envio indisponível"}
          aria-label="Mensagem"
          className={cn(
            "max-h-32 min-h-10 flex-1 resize-none rounded-lg border bg-white px-3 py-2 text-body2 text-ink shadow-sm placeholder:text-ink-3 focus-visible:outline-none",
            "focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/15",
            overLimit ? "border-danger" : "border-line",
            !enabled && "cursor-not-allowed bg-surface opacity-70",
          )}
        />
        <Button
          size="icon"
          aria-label="Enviar"
          loading={pending}
          disabled={!canSubmit}
          onClick={() => void submit()}
        >
          <Send />
        </Button>
      </div>
      {text.length > TEXT_LIMIT - 500 ? (
        <p className={cn("mt-1 text-right text-[10px] tabular-nums", overLimit ? "text-danger" : "text-ink-3")}>
          {text.length}/{TEXT_LIMIT}
        </p>
      ) : null}
    </div>
  );
}
