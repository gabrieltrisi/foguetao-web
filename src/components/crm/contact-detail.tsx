"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Archive,
  ArchiveRestore,
  Building2,
  MoreHorizontal,
  Pencil,
  Plus,
  Tag as TagIcon,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Combobox } from "@/components/ui/combobox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/alert-dialog";
import { EntityAvatar } from "@/components/business/entity-avatar";
import { StatusBadge } from "@/components/business/badges";
import { StatList } from "@/components/business/kpi-block";
import { DetailPageLayout } from "@/components/patterns/page-patterns";
import { ErrorState } from "@/components/ui/error-state";
import { useToast } from "@/components/ui/toast";
import { useSession } from "@/providers/session-provider";
import { useContact, useCreateNote, useDeleteNote, useCreateActivity, useAttachTag, useDetachTag, useSetContactCustomFields } from "@/hooks/crm/use-contact-detail";
import { CustomFieldsSection } from "@/components/crm/custom-fields-section";
import { useArchiveContact, useRestoreContact, useDeleteContact } from "@/hooks/crm/use-contacts";
import { useTags } from "@/hooks/crm/use-crm-meta";
import { contactStatusMeta, activityTypeLabel, formatDateTime, formatDate } from "@/lib/crm/display";
import { isApiError } from "@/types/api/error";

export function ContactDetail({ id }: { id: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const { can } = useSession();
  const { data, isLoading, isError, error, refetch } = useContact(id);

  const canUpdate = can("crm.contacts.update");
  const canDelete = can("crm.contacts.delete");
  const canNotesCreate = can("crm.notes.create");
  const canActivitiesCreate = can("crm.activities.create");

  const [note, setNote] = React.useState("");
  const [tagToAdd, setTagToAdd] = React.useState("");
  const [activityTitle, setActivityTitle] = React.useState("");

  const createNote = useCreateNote(id);
  const deleteNote = useDeleteNote(id);
  const createActivity = useCreateActivity(id);
  const attachTag = useAttachTag(id);
  const detachTag = useDetachTag(id);
  const setCustomFields = useSetContactCustomFields(id);
  const archive = useArchiveContact(id);
  const restore = useRestoreContact(id);
  const del = useDeleteContact();
  const tags = useTags();

  if (isLoading) {
    return <p className="py-16 text-center text-body2 text-ink-3">Carregando contato…</p>;
  }
  if (isError || !data) {
    const notFound = isApiError(error) && error.statusCode === 404;
    return (
      <ErrorState
        title={notFound ? "Contato não encontrado." : "Não foi possível carregar o contato."}
        onRetry={notFound ? undefined : () => refetch()}
      />
    );
  }

  const c = data.contact;
  const status = contactStatusMeta[c.status as keyof typeof contactStatusMeta];
  const isArchived = c.status === "ARCHIVED";
  const attachedIds = new Set(data.tags.map((t) => t.id));
  const availableTags = (tags.data?.items ?? []).filter((t) => !attachedIds.has(t.id));

  const aside = (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col items-center gap-3 p-5 text-center">
        <EntityAvatar name={c.fullName} size="lg" className="size-16 text-h3" />
        <div>
          <p className="font-display text-h3 font-semibold text-ink">{c.fullName}</p>
          {c.jobTitle ? <p className="text-caption text-ink-3">{c.jobTitle}</p> : null}
        </div>
        <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
      </Card>

      <Card className="p-4">
        <p className="mb-2 flex items-center gap-2 text-caption font-semibold uppercase tracking-wide text-ink-3">
          <TagIcon className="size-3.5" aria-hidden /> Tags
        </p>
        <div className="flex flex-wrap gap-1.5">
          {data.tags.length === 0 ? <span className="text-caption text-ink-3">Sem tags.</span> : null}
          {data.tags.map((t) => (
            <span key={t.id} className="inline-flex items-center gap-1 rounded-full border border-line px-2 py-0.5 text-caption text-ink">
              <span className="size-2 rounded-full" style={{ background: t.color ?? "#999" }} aria-hidden />
              {t.name}
              {canUpdate ? (
                <button
                  type="button"
                  aria-label={`Remover tag ${t.name}`}
                  onClick={() => detachTag.mutate(t.id, { onSuccess: () => toast({ title: "Tag removida", variant: "success" }) })}
                  className="text-ink-3 hover:text-danger"
                >
                  <X className="size-3" aria-hidden />
                </button>
              ) : null}
            </span>
          ))}
        </div>
        {canUpdate && availableTags.length > 0 ? (
          <div className="mt-3 flex gap-2">
            <div className="flex-1">
              <Combobox
                options={availableTags.map((t) => ({ value: t.id, label: t.name }))}
                value={tagToAdd}
                onValueChange={setTagToAdd}
                placeholder="Adicionar tag…"
              />
            </div>
            <Button
              size="sm"
              variant="secondary"
              disabled={!tagToAdd}
              aria-label="Adicionar tag"
              onClick={() =>
                attachTag.mutate(tagToAdd, {
                  onSuccess: () => {
                    toast({ title: "Tag adicionada", variant: "success" });
                    setTagToAdd("");
                  },
                })
              }
            >
              <Plus className="size-4" aria-hidden />
            </Button>
          </div>
        ) : null}
      </Card>

      {c.organizationId && data.organization ? (
        <Card className="p-4">
          <p className="mb-3 flex items-center gap-2 text-caption font-semibold uppercase tracking-wide text-ink-3">
            <Building2 className="size-3.5" aria-hidden /> Organização
          </p>
          <Link
            href={`/organizations/${data.organization.id}`}
            className="flex items-center gap-2 rounded-lg border border-line p-2.5 transition-colors hover:border-brand/40"
          >
            <EntityAvatar name={data.organization.name} type="company" size="sm" />
            <span className="text-body2 font-medium text-ink">{data.organization.name}</span>
          </Link>
        </Card>
      ) : null}
    </div>
  );

  return (
    <DetailPageLayout
      title={c.fullName}
      subtitle={[c.jobTitle, data.organization?.name].filter(Boolean).join(" · ") || undefined}
      back={{ href: "/contacts", label: "Contatos" }}
      actions={
        <>
          {canUpdate ? (
            <Button asChild size="sm" variant="secondary">
              <Link href={`/contacts/${id}/edit`}>
                <Pencil />
                Editar
              </Link>
            </Button>
          ) : null}
          {(canUpdate || canDelete) ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon-sm" variant="secondary" aria-label="Mais ações">
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {canUpdate && !isArchived ? (
                  <DropdownMenuItem onSelect={() => archive.mutate(undefined, { onSuccess: () => toast({ title: "Contato arquivado", variant: "success" }) })}>
                    <Archive aria-hidden /> Arquivar
                  </DropdownMenuItem>
                ) : null}
                {canUpdate && isArchived ? (
                  <DropdownMenuItem onSelect={() => restore.mutate(undefined, { onSuccess: () => toast({ title: "Contato restaurado", variant: "success" }) })}>
                    <ArchiveRestore aria-hidden /> Restaurar
                  </DropdownMenuItem>
                ) : null}
                {canDelete ? (
                  <>
                    <DropdownMenuSeparator />
                    <ConfirmDialog
                      trigger={
                        <DropdownMenuItem className="text-danger [&_svg]:text-danger" onSelect={(e) => e.preventDefault()}>
                          <Trash2 aria-hidden /> Excluir contato
                        </DropdownMenuItem>
                      }
                      title="Excluir contato?"
                      description="Esta ação não pode ser desfeita."
                      confirmLabel="Excluir"
                      destructive
                      onConfirm={() =>
                        del.mutate(id, {
                          onSuccess: () => {
                            toast({ title: "Contato excluído", variant: "success" });
                            router.push("/contacts");
                          },
                          onError: () => toast({ title: "Falha ao excluir", variant: "error" }),
                        })
                      }
                    />
                  </>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </>
      }
      aside={aside}
    >
      <Tabs defaultValue="resumo">
        <TabsList className="overflow-x-auto">
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="atividades">Atividades ({data.counters.activities})</TabsTrigger>
          <TabsTrigger value="notas">Notas ({data.counters.notes})</TabsTrigger>
        </TabsList>

        <TabsContent value="resumo">
          <div className="flex flex-col gap-4">
            <Card className="p-5">
              <StatList
                items={[
                  { label: "E-mail", value: c.email ?? "—" },
                  { label: "Telefone", value: c.phone ?? "—" },
                  { label: "WhatsApp", value: c.whatsappPhone ?? "—" },
                  { label: "Documento", value: c.document ?? "—" },
                  { label: "Organização", value: data.organization?.name ?? "—" },
                  { label: "Responsável", value: data.assignee?.name ?? "—" },
                  { label: "Criado em", value: formatDate(c.createdAt) },
                  { label: "Última atividade", value: formatDateTime(c.lastActivityAt) },
                ]}
              />
            </Card>

            {/* Valores já vêm embutidos no detalhe do contato (getValues no backend) */}
            <CustomFieldsSection
              entityType="CONTACT"
              values={data.customFields}
              canEdit={canUpdate}
              saving={setCustomFields.isPending}
              onSave={(payload) => setCustomFields.mutateAsync(payload)}
            />
          </div>
        </TabsContent>

        <TabsContent value="atividades">
          <div className="flex flex-col gap-4">
            {canActivitiesCreate ? (
              <Card className="flex flex-col gap-2 p-4">
                <Textarea
                  value={activityTitle}
                  onChange={(e) => setActivityTitle(e.target.value)}
                  placeholder="Registrar uma atividade…"
                  aria-label="Nova atividade"
                />
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    disabled={!activityTitle.trim() || createActivity.isPending}
                    onClick={() =>
                      createActivity.mutate(
                        { type: "UPDATED", title: activityTitle.trim() },
                        {
                          onSuccess: () => {
                            toast({ title: "Atividade registrada", variant: "success" });
                            setActivityTitle("");
                          },
                          onError: () => toast({ title: "Falha ao registrar atividade", variant: "error" }),
                        },
                      )
                    }
                  >
                    Registrar
                  </Button>
                </div>
              </Card>
            ) : null}
            <Card className="flex flex-col gap-4 p-5">
              {data.recentActivities.length === 0 ? (
                <p className="text-body2 text-ink-3">Nenhuma atividade registrada.</p>
              ) : (
                data.recentActivities.map((a) => (
                  <div key={a.id} className="flex gap-3">
                    <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand" aria-hidden />
                    <div>
                      <p className="text-body2 font-medium text-ink">{a.title}</p>
                      <p className="text-caption text-ink-3">
                        <Badge tone="neutral" className="mr-1.5 normal-case">{activityTypeLabel[a.type] ?? a.type}</Badge>
                        {formatDateTime(a.occurredAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notas">
          <div className="flex flex-col gap-4">
            {canNotesCreate ? (
              <Card className="flex flex-col gap-2 p-4">
                <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Adicionar uma nota…" aria-label="Nova nota" />
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    disabled={!note.trim() || createNote.isPending}
                    onClick={() =>
                      createNote.mutate(
                        { content: note.trim() },
                        {
                          onSuccess: () => {
                            toast({ title: "Nota adicionada", variant: "success" });
                            setNote("");
                          },
                          onError: () => toast({ title: "Falha ao adicionar nota", variant: "error" }),
                        },
                      )
                    }
                  >
                    Adicionar nota
                  </Button>
                </div>
              </Card>
            ) : null}
            {data.recentNotes.length === 0 ? (
              <p className="py-6 text-center text-body2 text-ink-3">Nenhuma nota.</p>
            ) : (
              data.recentNotes.map((n) => (
                <Card key={n.id} className="flex items-start justify-between gap-3 p-4">
                  <div className="min-w-0">
                    {n.pinned ? <Badge tone="warning" className="mb-1">Fixada</Badge> : null}
                    <p className="whitespace-pre-wrap text-body2 text-ink">{n.content}</p>
                    <p className="mt-1 text-caption text-ink-3">{formatDateTime(n.createdAt)}</p>
                  </div>
                  {can("crm.notes.delete") ? (
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      aria-label="Excluir nota"
                      onClick={() => deleteNote.mutate(n.id, { onSuccess: () => toast({ title: "Nota excluída", variant: "success" }) })}
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </Button>
                  ) : null}
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </DetailPageLayout>
  );
}
