"use client";

import * as React from "react";
import Link from "next/link";
import {
  Building2,
  Mail,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Phone,
  Plus,
  Target,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
import { StatusBadge, PriorityBadge } from "@/components/business/badges";
import { StatList } from "@/components/business/kpi-block";
import { Timeline, ActivityItem } from "@/components/business/timeline";
import { CommentItem, FileItem } from "@/components/business/items";
import { AssigneeSelector } from "@/components/business/assignee-selector";
import { DetailPageLayout, DashboardSection } from "@/components/patterns/page-patterns";
import { TagList } from "@/components/crm/tags";
import { useToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/format";
import { contactStatusLabel, contactStatusTone } from "@/mocks/crm/contacts";
import { deals } from "@/mocks/crm/deals";
import { tasks } from "@/mocks/crm/tasks";
import {
  contactActivities,
  contactNotes,
  contactTimeline,
  customFields,
  detailFiles,
} from "@/mocks/crm/timeline";
import type { Contact } from "@/types/crm";

const PEOPLE = [
  { id: "cr", name: "Camila Ribeiro" },
  { id: "rm", name: "Rafael Monteiro" },
  { id: "ba", name: "Bruno Alcântara" },
  { id: "lp", name: "Larissa Prado" },
];

export function ContactDetail({ contact }: { contact: Contact }) {
  const { toast } = useToast();
  const [note, setNote] = React.useState("");
  const [owner, setOwner] = React.useState(
    PEOPLE.find((p) => p.name === contact.owner)?.id ?? "cr",
  );

  const relatedDeals = deals.filter((d) => d.organizationName === contact.organizationName).slice(0, 4);
  const relatedTasks = tasks.filter((t) => t.relatedTo === contact.organizationName).slice(0, 4);

  const aside = (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col items-center gap-3 p-5 text-center">
        <EntityAvatar name={contact.name} size="lg" className="size-16 text-h3" />
        <div>
          <p className="font-display text-h3 font-semibold text-ink">{contact.name}</p>
          <p className="text-caption text-ink-3">{contact.role}</p>
        </div>
        <StatusBadge tone={contactStatusTone[contact.status]}>
          {contactStatusLabel[contact.status]}
        </StatusBadge>
        <TagList tags={contact.tags} className="justify-center" />
        <div className="grid w-full grid-cols-3 gap-1.5 pt-1">
          <QuickAction icon={Phone} label="Ligar" onClick={() => toast({ title: "Ligando… (mock)" })} />
          <QuickAction icon={Mail} label="E-mail" onClick={() => toast({ title: "Compor e-mail (mock)" })} />
          <QuickAction icon={MessageCircle} label="WhatsApp" onClick={() => toast({ title: "Abrir WhatsApp (mock)" })} />
        </div>
      </Card>

      <Card className="p-4">
        <p className="mb-2 text-caption font-semibold uppercase tracking-wide text-ink-3">Responsável</p>
        <AssigneeSelector people={PEOPLE} value={owner} onValueChange={setOwner} />
      </Card>

      <Card className="p-4">
        <p className="mb-3 text-caption font-semibold uppercase tracking-wide text-ink-3">
          Campos personalizados
        </p>
        <StatList items={customFields} />
      </Card>

      <Card className="p-4">
        <p className="mb-3 flex items-center gap-2 text-caption font-semibold uppercase tracking-wide text-ink-3">
          <Building2 className="size-3.5" aria-hidden /> Organização
        </p>
        <Link
          href={`/organizations/${contact.organizationId}`}
          className="flex items-center gap-2 rounded-lg border border-line p-2.5 transition-colors hover:border-brand/40"
        >
          <EntityAvatar name={contact.organizationName} type="company" size="sm" />
          <span className="text-body2 font-medium text-ink">{contact.organizationName}</span>
        </Link>
      </Card>
    </div>
  );

  return (
    <>
      <DetailPageLayout
        title={contact.name}
        subtitle={`${contact.role} · ${contact.organizationName}`}
        back={{ href: "/contacts", label: "Contatos" }}
        actions={
          <>
            <Button size="sm" variant="secondary">
              <Pencil />
              Editar
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon-sm" variant="secondary" aria-label="Mais ações">
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Target aria-hidden />
                  Nova oportunidade
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Plus aria-hidden />
                  Nova tarefa
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <ConfirmDialog
                  trigger={
                    <DropdownMenuItem
                      className="text-danger [&_svg]:text-danger"
                      onSelect={(e) => e.preventDefault()}
                    >
                      <Trash2 aria-hidden />
                      Excluir contato
                    </DropdownMenuItem>
                  }
                  title="Excluir contato?"
                  description="Esta ação não pode ser desfeita."
                  confirmLabel="Excluir"
                  destructive
                  onConfirm={() => toast({ title: "Contato excluído (mock)", variant: "success" })}
                />
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        }
        aside={aside}
      >
        <Tabs defaultValue="resumo">
          <TabsList className="overflow-x-auto">
            <TabsTrigger value="resumo">Resumo</TabsTrigger>
            <TabsTrigger value="atividades">Atividades</TabsTrigger>
            <TabsTrigger value="notas">Notas</TabsTrigger>
            <TabsTrigger value="deals">Deals</TabsTrigger>
            <TabsTrigger value="tarefas">Tarefas</TabsTrigger>
            <TabsTrigger value="arquivos">Arquivos</TabsTrigger>
          </TabsList>

          <TabsContent value="resumo">
            <div className="flex flex-col gap-5">
              <Card className="p-5">
                <StatList
                  items={[
                    { label: "E-mail", value: contact.email },
                    { label: "Telefone", value: contact.phone },
                    { label: "Organização", value: contact.organizationName },
                    { label: "Responsável", value: contact.owner },
                    { label: "Criado em", value: contact.createdAt },
                  ]}
                />
              </Card>
              <DashboardSection title="Histórico">
                <Card className="p-5">
                  <Timeline items={contactTimeline} />
                </Card>
              </DashboardSection>
            </div>
          </TabsContent>

          <TabsContent value="atividades">
            <Card className="flex flex-col gap-4 p-5">
              {contactActivities.map((a) => (
                <ActivityItem key={a.id} actorName={a.actor} text={a.text} time={a.time} />
              ))}
            </Card>
          </TabsContent>

          <TabsContent value="notas">
            <div className="flex flex-col gap-4">
              <Card className="flex flex-col gap-2 p-4">
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Adicionar uma nota…"
                  aria-label="Nova nota"
                />
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    disabled={!note.trim()}
                    onClick={() => {
                      toast({ title: "Nota adicionada (mock)", variant: "success" });
                      setNote("");
                    }}
                  >
                    Adicionar nota
                  </Button>
                </div>
              </Card>
              {contactNotes.map((n) => (
                <CommentItem key={n.id} author={n.author} time={n.time} body={n.body} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="deals">
            <Card className="divide-y divide-line">
              {relatedDeals.length === 0 ? (
                <p className="p-5 text-body2 text-ink-3">Nenhuma oportunidade vinculada.</p>
              ) : (
                relatedDeals.map((d) => (
                  <Link
                    key={d.id}
                    href={`/deals/${d.id}`}
                    className="flex items-center justify-between gap-3 p-4 transition-colors hover:bg-surface"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink">{d.title}</p>
                      <p className="text-caption text-ink-3">{d.probability}% · {d.owner}</p>
                    </div>
                    <span className="shrink-0 font-display font-semibold text-ink">
                      {formatCurrency(d.value)}
                    </span>
                  </Link>
                ))
              )}
            </Card>
          </TabsContent>

          <TabsContent value="tarefas">
            <Card className="divide-y divide-line">
              {relatedTasks.length === 0 ? (
                <p className="p-5 text-body2 text-ink-3">Nenhuma tarefa vinculada.</p>
              ) : (
                relatedTasks.map((t) => (
                  <div key={t.id} className="flex items-center gap-3 p-4">
                    <Checkbox aria-label={t.title} defaultChecked={t.status === "done"} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-body2 font-medium text-ink">{t.title}</p>
                      <p className="text-caption text-ink-3">{t.dueLabel} · {t.assignee}</p>
                    </div>
                    <PriorityBadge priority={t.priority} />
                  </div>
                ))
              )}
            </Card>
          </TabsContent>

          <TabsContent value="arquivos">
            <div className="flex flex-col gap-2">
              <div className="flex justify-end">
                <Button size="sm" variant="secondary">
                  <Plus />
                  Adicionar arquivo
                </Button>
              </div>
              {detailFiles.map((f) => (
                <FileItem key={f.id} name={f.name} size={f.size} onDownload={() => {}} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DetailPageLayout>
    </>
  );
}

function QuickAction({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Phone;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1 rounded-lg border border-line py-2 text-caption text-ink-2 transition-colors hover:border-brand/40 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
    >
      <Icon className="size-4" aria-hidden />
      {label}
    </button>
  );
}
