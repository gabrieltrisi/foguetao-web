"use client";

import * as React from "react";
import { Tag, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/toast";
import { useSession } from "@/providers/session-provider";
import { useInboxLabels, useConversationLabelMutation } from "@/features/inbox/hooks/use-inbox-labels";
import type { ApiLabelRef } from "@/types/api/messaging";

/**
 * Controle de ETIQUETAS (F4). Chips (cor via dot — contraste seguro) com remover, e um
 * popover pesquisável multi-seleção sobre a taxonomia (só CONSUMO — criação é F-labels).
 * Aplicar/remover é otimista. Sem permissão de etiquetar → chips em modo leitura.
 */
export function LabelControl({
  conversationId,
  labels,
}: {
  conversationId: string;
  labels: ApiLabelRef[];
}) {
  const { can } = useSession();
  const { toast } = useToast();
  const canLabel = can("messaging.conversations.label");
  const taxonomy = useInboxLabels();
  const { add, remove } = useConversationLabelMutation();

  const appliedIds = React.useMemo(() => new Set(labels.map((l) => l.id)), [labels]);

  const onError = () => toast({ title: "Não foi possível atualizar as etiquetas.", variant: "error" });

  const toggle = (label: ApiLabelRef) => {
    if (appliedIds.has(label.id)) {
      remove.mutate({ conversationId, labelId: label.id }, { onError });
    } else {
      add.mutate({ conversationId, labelId: label.id, label }, { onError });
    }
  };

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-1">
      {labels.map((l) => (
        <span
          key={l.id}
          className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-2 py-0.5 text-micro text-ink-2"
        >
          <span className="size-1.5 shrink-0 rounded-full" style={{ backgroundColor: l.color }} aria-hidden />
          <span className="max-w-[120px] truncate">{l.name}</span>
          {canLabel ? (
            <button
              type="button"
              aria-label={`Remover etiqueta ${l.name}`}
              onClick={() => remove.mutate({ conversationId, labelId: l.id }, { onError })}
              className="shrink-0 text-ink-3 hover:text-ink"
            >
              <X className="size-3" />
            </button>
          ) : null}
        </span>
      ))}

      {canLabel ? (
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label="Adicionar etiqueta"
              className="inline-flex items-center gap-1 rounded-full border border-dashed border-line px-2 py-0.5 text-micro text-ink-3 hover:border-brand hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1"
            >
              <Tag className="size-3" aria-hidden /> Etiqueta
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-64 p-0">
            <Command>
              <CommandInput placeholder="Buscar etiqueta…" />
              <CommandList>
                <CommandEmpty>
                  {taxonomy.isLoading ? "Carregando…" : "Nenhuma etiqueta."}
                </CommandEmpty>
                <CommandGroup>
                  {(taxonomy.data ?? []).map((l) => {
                    const applied = appliedIds.has(l.id);
                    return (
                      <CommandItem key={l.id} value={l.name} onSelect={() => toggle(l)}>
                        <Checkbox checked={applied} className="mr-2" tabIndex={-1} aria-hidden />
                        <span
                          className="mr-1.5 size-2 shrink-0 rounded-full"
                          style={{ backgroundColor: l.color }}
                          aria-hidden
                        />
                        <span className={cn("truncate", applied && "font-medium text-ink")}>{l.name}</span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      ) : null}
    </div>
  );
}
