"use client";

import Link from "next/link";
import { MessageCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Can } from "@/hooks/company/use-permissions";
import { useImportContactsFromConversations } from "@/features/inbox/hooks/use-inbox-mutations";

/** Ações do topo de Contatos: importar do WhatsApp + novo contato (gated por permissão). */
export function NewContactAction() {
  return (
    <div className="flex items-center gap-2">
      <ImportFromWhatsappAction />
      <Can permission="crm.contacts.create">
        <Button asChild size="sm">
          <Link href="/contacts/new">
            <Plus />
            Novo contato
          </Link>
        </Button>
      </Can>
    </div>
  );
}

/** Importa em massa os números das conversas do WhatsApp como contatos (dedupe). */
function ImportFromWhatsappAction() {
  const { toast } = useToast();
  const mutation = useImportContactsFromConversations();
  return (
    <Can permission="crm.contacts.create">
      <Button
        variant="secondary"
        size="sm"
        loading={mutation.isPending}
        onClick={() =>
          mutation.mutate(undefined, {
            onSuccess: (r) =>
              toast({
                title:
                  r.imported > 0
                    ? `${r.imported} contato(s) importado(s)`
                    : "Nenhum contato novo",
                description: r.linked > 0 ? `${r.linked} já existiam (vinculados)` : undefined,
                variant: "success",
              }),
            onError: () => toast({ title: "Falha ao importar contatos", variant: "error" }),
          })
        }
      >
        <MessageCircle />
        Importar do WhatsApp
      </Button>
    </Can>
  );
}
