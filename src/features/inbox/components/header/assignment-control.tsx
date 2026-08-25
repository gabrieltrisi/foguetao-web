"use client";

import * as React from "react";
import { Check, UserPlus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { EntityAvatar } from "@/components/business/entity-avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useToast } from "@/components/ui/toast";
import { isApiError } from "@/types/api/error";
import { useSession } from "@/providers/session-provider";
import { useInboxAssignableMembers } from "@/features/inbox/hooks/use-inbox-members";
import { useAssignConversation } from "@/features/inbox/hooks/use-inbox-mutations";

/**
 * Controle de RESPONSÁVEL (F4). Avatar + nome; popover pesquisável com "Assumir para
 * mim", lista de atendentes (transferir) e "Remover responsável". Otimista com
 * `expectedVersion` (409 de conflito → toast "recarregue"). Sem permissão de atribuir →
 * exibe o responsável em modo leitura (nunca esconde a informação).
 */
export function AssignmentControl({
  conversationId,
  assignedToUserId,
  version,
}: {
  conversationId: string;
  assignedToUserId: string | null;
  version?: number;
}) {
  const { user, can } = useSession();
  const { toast } = useToast();
  const canAssign = can("messaging.conversations.assign");
  const { options, nameById, canReadMembers } = useInboxAssignableMembers();
  const assign = useAssignConversation();
  const [open, setOpen] = React.useState(false);

  const assignedName = assignedToUserId ? (nameById.get(assignedToUserId) ?? "Atendente") : null;
  const isMine = assignedToUserId != null && assignedToUserId === user?.id;

  const doAssign = (assignedTo: string | null) => {
    setOpen(false);
    assign.mutate(
      { id: conversationId, assignedToUserId: assignedTo, expectedVersion: version },
      {
        onError: (e) =>
          toast({
            title:
              isApiError(e) && e.statusCode === 409
                ? "A conversa mudou em outra ação. Recarregue e tente de novo."
                : "Não foi possível atualizar o responsável.",
            variant: "error",
          }),
      },
    );
  };

  const display = (
    <span className="inline-flex min-w-0 items-center gap-1.5">
      {assignedName ? (
        <EntityAvatar name={assignedName} size="sm" className="shrink-0" />
      ) : (
        <UserPlus className="size-4 shrink-0 text-ink-3" aria-hidden />
      )}
      <span className="truncate text-caption text-ink-2">
        {assignedName ? (isMine ? "Você" : assignedName) : "Não atribuída"}
      </span>
    </span>
  );

  // Sem permissão de atribuir: leitura apenas (informação nunca escondida).
  if (!canAssign) {
    return (
      <span aria-label={`Responsável: ${assignedName ?? "não atribuída"}`}>{display}</span>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Responsável: ${assignedName ?? "não atribuída"}. Alterar`}
          className="inline-flex max-w-[180px] items-center gap-1 rounded-md px-1.5 py-1 hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1"
        >
          {display}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-0">
        <Command>
          <CommandInput placeholder="Buscar atendente…" />
          <CommandList>
            <CommandEmpty>{canReadMembers ? "Ninguém encontrado." : "Sem acesso à equipe."}</CommandEmpty>
            <CommandGroup>
              {user?.id && !isMine ? (
                <CommandItem value="__assumir" onSelect={() => doAssign(user.id)}>
                  <UserPlus className="mr-2 size-4" aria-hidden /> Assumir para mim
                </CommandItem>
              ) : null}
              {assignedToUserId ? (
                <CommandItem value="__remover" onSelect={() => doAssign(null)}>
                  <X className="mr-2 size-4" aria-hidden /> Remover responsável
                </CommandItem>
              ) : null}
            </CommandGroup>
            {options.length > 0 ? (
              <>
                <CommandSeparator />
                <CommandGroup heading="Transferir para">
                  {options.map((o) => (
                    <CommandItem key={o.value} value={o.label} onSelect={() => doAssign(o.value)}>
                      <Check
                        className={cn(
                          "mr-2 size-4 text-brand",
                          o.value === assignedToUserId ? "opacity-100" : "opacity-0",
                        )}
                        aria-hidden
                      />
                      {o.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            ) : null}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
