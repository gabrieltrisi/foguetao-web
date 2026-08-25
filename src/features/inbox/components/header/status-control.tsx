"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/toast";
import { useSession } from "@/providers/session-provider";
import { statusMeta } from "@/lib/messaging/display";
import { statusActions, type StatusAction } from "@/features/inbox/status";
import { useChangeConversationStatus } from "@/features/inbox/hooks/use-inbox-mutations";

/**
 * Controle de STATUS (F4). Badge + dropdown das transições REAIS a partir do estado
 * atual (`statusActions`). Ações sem permissão são DESABILITADAS (nunca escondidas).
 * Resolver/Arquivar pedem confirmação. Otimista via `useChangeConversationStatus`.
 */
export function StatusControl({
  conversationId,
  status,
}: {
  conversationId: string;
  status: string;
}) {
  const { can } = useSession();
  const { toast } = useToast();
  const mutations = useChangeConversationStatus();
  const [confirm, setConfirm] = React.useState<StatusAction | null>(null);

  const meta = statusMeta(status);
  const actions = statusActions(status);

  const run = (a: StatusAction) => {
    mutations[a.endpoint].mutate(conversationId, {
      onError: () => toast({ title: "Não foi possível alterar o status.", variant: "error" }),
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={`Status: ${meta.label}. Alterar`}
            className="inline-flex items-center gap-1 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1"
          >
            <Badge tone={meta.tone}>{meta.label}</Badge>
            <ChevronDown className="size-3.5 text-ink-3" aria-hidden />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {actions.length === 0 ? (
            <DropdownMenuItem disabled>Sem transições disponíveis</DropdownMenuItem>
          ) : (
            actions.map((a) => {
              const allowed = can(a.permission);
              return (
                <DropdownMenuItem
                  key={a.key}
                  disabled={!allowed}
                  onSelect={(e) => {
                    if (!allowed) return;
                    if (a.confirm) {
                      e.preventDefault();
                      setConfirm(a);
                    } else {
                      run(a);
                    }
                  }}
                >
                  {a.label}
                </DropdownMenuItem>
              );
            })
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={confirm !== null}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={confirm?.label ?? "Confirmar"}
        description={confirm?.confirmText ?? ""}
        confirmLabel={confirm?.label ?? "Confirmar"}
        destructive={confirm?.key === "archive"}
        onConfirm={() => {
          if (confirm) run(confirm);
          setConfirm(null);
        }}
      />
    </>
  );
}
