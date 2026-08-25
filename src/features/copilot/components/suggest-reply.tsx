"use client";

import * as React from "react";
import { Plus, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useConversation } from "@/hooks/messaging/use-conversations";
import { useCopilotContext } from "@/features/copilot/hooks/use-copilot-context";
import { useCopilotSuggestions } from "@/features/copilot/hooks/use-copilot";

/**
 * Botão "Sugerir resposta" (IA) do Composer (F7). Abre um popover com sugestões do
 * provedor (MOCK). Ao escolher, chama `onInsert` — o Composer INSERE (nunca substitui
 * sem confirmação) e NUNCA envia. Resolve o `contactId` da conversa (cache) para montar
 * o contexto sem fetch novo.
 */
export function SuggestReplyButton({
  conversationId,
  onInsert,
}: {
  conversationId: string;
  onInsert: (text: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const conv = useConversation(conversationId);
  const contactId = conv.data?.contactId ?? "";
  const { context } = useCopilotContext(conversationId, contactId);
  const suggestions = useCopilotSuggestions(context);
  const runMutate = suggestions.mutate;

  const onOpenChange = React.useCallback(
    (o: boolean) => {
      setOpen(o);
      if (o) runMutate(); // gera sob demanda ao abrir
    },
    [runMutate],
  );

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button size="icon" variant="secondary" aria-label="Sugerir resposta com IA">
          <Sparkles />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <div className="mb-2 flex items-center gap-1.5">
          <Sparkles className="size-3.5 text-brand" aria-hidden />
          <span className="text-caption font-semibold text-ink">Sugestões de resposta</span>
          <Badge tone="info">mock</Badge>
        </div>
        {suggestions.isPending ? (
          <p className="py-2 text-caption text-ink-3">Gerando sugestões…</p>
        ) : suggestions.isError ? (
          <p className="py-2 text-caption text-danger">Não foi possível gerar sugestões.</p>
        ) : (
          <ul className="space-y-1">
            {(suggestions.data ?? []).map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => {
                    onInsert(s.text);
                    setOpen(false);
                  }}
                  className="group flex w-full items-start gap-2 rounded-md p-2 text-left text-caption text-ink hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
                  <Plus className="mt-0.5 size-3.5 shrink-0 text-ink-3 group-hover:text-brand" aria-hidden />
                  <span>{s.text}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-2 border-t border-line pt-1.5 text-micro text-ink-3">
          A sugestão é inserida no composer para você revisar e enviar.
        </p>
      </PopoverContent>
    </Popover>
  );
}
