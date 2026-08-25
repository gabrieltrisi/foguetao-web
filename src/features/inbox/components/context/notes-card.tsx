"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useSession } from "@/providers/session-provider";
import { useContactNotes } from "@/hooks/crm/use-contact-lists";
import { useCreateNote } from "@/hooks/crm/use-contact-detail";
import { formatDateTime } from "@/lib/crm/display";
import { PanelSection } from "./panel-section";

/**
 * Card NOTAS (F6). Leitura (`useContactNotes`) + criação de nota em **texto puro** (o
 * contrato aceita `content` 1–10000; sem markdown), gated por `crm.notes.create`. A
 * criação invalida contato+notas+atividades (mutation existente).
 */
export function NotesCard({ contactId }: { contactId: string }) {
  const { can } = useSession();
  const { toast } = useToast();
  const denied = !can("crm.notes.read");
  const canCreate = can("crm.notes.create");
  const q = useContactNotes(contactId);
  const create = useCreateNote(contactId);
  const [text, setText] = React.useState("");
  const notes = q.data?.items ?? [];

  const submit = () => {
    const content = text.trim();
    if (!content) return;
    create.mutate(
      { content },
      {
        onSuccess: () => setText(""),
        onError: () => toast({ title: "Não foi possível salvar a nota.", variant: "error" }),
      },
    );
  };

  return (
    <PanelSection
      title="Notas"
      denied={denied}
      isLoading={q.isLoading}
      isError={q.isError}
      isEmpty={!q.isLoading && !q.isError && notes.length === 0 && !canCreate}
      emptyLabel="Sem notas."
      onRetry={() => void q.refetch()}
    >
      <div className="space-y-2">
        {canCreate ? (
          <div className="space-y-1">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={2}
              maxLength={10000}
              placeholder="Adicionar nota (texto)…"
              aria-label="Nova nota"
              className="w-full resize-none rounded-lg border border-line bg-white px-2 py-1.5 text-caption text-ink placeholder:text-ink-3 focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/15"
            />
            <div className="flex justify-end">
              <Button size="sm" disabled={!text.trim() || create.isPending} onClick={submit}>
                Adicionar
              </Button>
            </div>
          </div>
        ) : null}
        <ul className="space-y-2">
          {notes.slice(0, 6).map((n) => (
            <li key={n.id} className="rounded-lg border border-line bg-surface p-2">
              <p className="whitespace-pre-wrap break-words text-caption text-ink">{n.content}</p>
              <p className="mt-1 text-micro text-ink-3">{formatDateTime(n.createdAt)}</p>
            </li>
          ))}
        </ul>
      </div>
    </PanelSection>
  );
}
