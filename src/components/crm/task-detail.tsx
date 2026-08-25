"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  MoreHorizontal,
  Pencil,
  RotateCcw,
  Target,
  Trash2,
  User,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/alert-dialog";
import { StatList } from "@/components/business/kpi-block";
import { EntityAvatar } from "@/components/business/entity-avatar";
import { DetailPageLayout } from "@/components/patterns/page-patterns";
import { ErrorState } from "@/components/ui/error-state";
import { useToast } from "@/components/ui/toast";
import { useSession } from "@/providers/session-provider";
import {
  useTask,
  useCompleteTask,
  useReopenTask,
  useAssignTask,
  useDeleteTask,
} from "@/hooks/crm/use-tasks";
import { useAssignableMembers } from "@/hooks/crm/use-assignable-members";
import { useDeal } from "@/hooks/crm/use-deals";
import { useContact } from "@/hooks/crm/use-contact-detail";
import { useOrganization } from "@/hooks/crm/use-organizations";
import {
  taskStatusMeta,
  taskPriorityMeta,
  isOverdue,
  formatTaskDate,
  messageForTaskError,
} from "@/lib/crm/task-helpers";
import { isApiError } from "@/types/api/error";

export function TaskDetail({ id }: { id: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const { can } = useSession();
  const { data: task, isLoading, isError, error, refetch } = useTask(id);

  const members = useAssignableMembers();
  const complete = useCompleteTask(id);
  const reopen = useReopenTask(id);
  const assign = useAssignTask(id);
  const del = useDeleteTask();

  const [assignee, setAssignee] = React.useState("");
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  // Vínculos: o detalhe é UM item, então resolver os nomes aqui não gera N+1
  // (na listagem os vínculos não são exibidos justamente por isso).
  const deal = useDeal(task?.dealId ?? "");
  const contact = useContact(task?.contactId ?? "");
  const organization = useOrganization(task?.organizationId ?? "");

  if (!can("crm.tasks.read")) {
    return <p className="py-16 text-center text-body2 text-ink-3">Você não tem permissão para ver tarefas.</p>;
  }
  if (isLoading) {
    return <p className="py-16 text-center text-body2 text-ink-3">Carregando tarefa…</p>;
  }
  if (isError || !task) {
    const notFound = isApiError(error) && error.statusCode === 404;
    return (
      <ErrorState
        title={notFound ? "Tarefa não encontrada." : "Não foi possível carregar a tarefa."}
        onRetry={notFound ? undefined : () => refetch()}
      />
    );
  }

  const status = taskStatusMeta[task.status];
  const priority = taskPriorityMeta[task.priority];
  const late = isOverdue(task);
  const isCompleted = task.status === "COMPLETED";
  const isReopenable = task.status === "COMPLETED" || task.status === "CANCELED";
  const onError = (e: unknown) => toast({ title: messageForTaskError(e), variant: "error" });

  // Permissões reais. Reabrir usa `crm.tasks.update` (o backend não expõe uma
  // permissão dedicada para reopen).
  const canComplete = can("crm.tasks.complete") && !isCompleted;
  const canReopen = can("crm.tasks.update") && isReopenable;
  const canAssign = can("crm.tasks.assign");
  const canDelete = can("crm.tasks.delete");
  // O backend recusa PATCH em tarefa concluída (TASK_ALREADY_COMPLETED).
  const canEdit = can("crm.tasks.update") && !isCompleted;

  const assigneeName = members.nameById.get(task.assignedToUserId) ?? "Responsável";

  const aside = (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-2">
          {late ? <Badge tone="danger">Atrasada</Badge> : <Badge tone={status.tone}>{status.label}</Badge>}
          <Badge tone={priority.tone}>{priority.label}</Badge>
        </div>
        <StatList
          items={[
            { label: "Prazo", value: formatTaskDate(task.dueAt) },
            { label: "Lembrete", value: formatTaskDate(task.reminderAt) },
          ]}
        />
      </Card>

      <Card className="flex flex-col gap-3 p-4">
        <p className="text-caption font-semibold uppercase tracking-wide text-ink-3">Responsável</p>
        <span className="inline-flex items-center gap-2">
          <EntityAvatar name={assigneeName} size="sm" />
          <span className="text-body2 font-medium text-ink">{assigneeName}</span>
        </span>

        {canAssign ? (
          members.canRead ? (
            <div className="flex gap-2">
              <div className="flex-1">
                <Combobox
                  options={members.options}
                  value={assignee}
                  onValueChange={setAssignee}
                  placeholder="Reatribuir para…"
                />
              </div>
              <Button
                size="sm"
                variant="secondary"
                disabled={!assignee || assign.isPending}
                loading={assign.isPending}
                onClick={() =>
                  assign.mutate(assignee, {
                    onSuccess: () => {
                      toast({ title: "Responsável atualizado", variant: "success" });
                      setAssignee("");
                    },
                    onError,
                  })
                }
              >
                Atribuir
              </Button>
            </div>
          ) : (
            // Sem `company.members.read` não há fonte de membros: estado correto
            // em vez de um seletor vazio/quebrado.
            <p className="text-caption text-ink-3">
              Você não tem permissão para listar membros e reatribuir esta tarefa.
            </p>
          )
        ) : null}
      </Card>

      {task.dealId || task.contactId || task.organizationId ? (
        <Card className="flex flex-col gap-2 p-4">
          <p className="text-caption font-semibold uppercase tracking-wide text-ink-3">Vínculos</p>
          {task.dealId ? (
            <Link
              href={`/deals/${task.dealId}`}
              className="flex items-center gap-2 rounded-lg border border-line p-2.5 transition-colors hover:border-brand/40"
            >
              <Target className="size-4 shrink-0 text-ink-3" aria-hidden />
              <span className="truncate text-body2 text-ink">{deal.data?.title ?? "Oportunidade"}</span>
            </Link>
          ) : null}
          {task.contactId ? (
            <Link
              href={`/contacts/${task.contactId}`}
              className="flex items-center gap-2 rounded-lg border border-line p-2.5 transition-colors hover:border-brand/40"
            >
              <User className="size-4 shrink-0 text-ink-3" aria-hidden />
              <span className="truncate text-body2 text-ink">{contact.data?.contact.fullName ?? "Contato"}</span>
            </Link>
          ) : null}
          {task.organizationId ? (
            <Link
              href={`/organizations/${task.organizationId}`}
              className="flex items-center gap-2 rounded-lg border border-line p-2.5 transition-colors hover:border-brand/40"
            >
              <Building2 className="size-4 shrink-0 text-ink-3" aria-hidden />
              <span className="truncate text-body2 text-ink">{organization.data?.name ?? "Organização"}</span>
            </Link>
          ) : null}
        </Card>
      ) : null}
    </div>
  );

  return (
    <DetailPageLayout
      title={task.title}
      subtitle={status.label}
      back={{ href: "/tasks", label: "Tarefas" }}
      actions={
        <>
          {canComplete ? (
            <Button
              size="sm"
              loading={complete.isPending}
              onClick={() =>
                complete.mutate(undefined, {
                  onSuccess: () => toast({ title: "Tarefa concluída", variant: "success" }),
                  onError,
                })
              }
            >
              <CheckCircle2 />
              Concluir
            </Button>
          ) : null}
          {canEdit ? (
            <Button asChild size="sm" variant="secondary">
              <Link href={`/tasks/${id}/edit`}>
                <Pencil />
                Editar
              </Link>
            </Button>
          ) : null}
          {canReopen || canDelete ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon-sm" variant="secondary" aria-label="Mais ações">
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {canReopen ? (
                  <DropdownMenuItem
                    onSelect={() =>
                      reopen.mutate(undefined, {
                        onSuccess: () => toast({ title: "Tarefa reaberta", variant: "success" }),
                        onError,
                      })
                    }
                  >
                    <RotateCcw aria-hidden /> Reabrir
                  </DropdownMenuItem>
                ) : null}
                {canReopen && canDelete ? <DropdownMenuSeparator /> : null}
                {canDelete ? (
                  <DropdownMenuItem
                    className="text-danger [&_svg]:text-danger"
                    onSelect={(e) => {
                      e.preventDefault();
                      setConfirmDelete(true);
                    }}
                  >
                    <Trash2 aria-hidden /> Excluir tarefa
                  </DropdownMenuItem>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </>
      }
      aside={aside}
    >
      <div className="flex flex-col gap-4">
        {isCompleted ? (
          <Card className="flex items-center gap-2 p-4 text-body2 text-success">
            <CheckCircle2 className="size-4 shrink-0" aria-hidden />
            Concluída em {formatTaskDate(task.completedAt)}. Reabra a tarefa para editá-la.
          </Card>
        ) : null}
        {late ? (
          <Card className="flex items-center gap-2 p-4 text-body2 text-danger">
            <AlertTriangle className="size-4 shrink-0" aria-hidden />
            Esta tarefa está atrasada.
          </Card>
        ) : null}

        <Card className="p-5">
          <p className="text-body2 text-ink-2">{task.description || "Sem descrição."}</p>
        </Card>

        <Card className="p-5">
          <StatList
            items={[
              { label: "Status", value: status.label },
              { label: "Prioridade", value: priority.label },
              { label: "Responsável", value: assigneeName },
              { label: "Prazo", value: formatTaskDate(task.dueAt) },
              { label: "Concluída em", value: formatTaskDate(task.completedAt) },
              { label: "Criada em", value: formatTaskDate(task.createdAt) },
              { label: "Atualizada em", value: formatTaskDate(task.updatedAt) },
            ]}
          />
        </Card>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Excluir tarefa?"
        description="Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        destructive
        onConfirm={() => {
          setConfirmDelete(false);
          del.mutate(id, {
            onSuccess: () => {
              toast({ title: "Tarefa excluída", variant: "success" });
              router.push("/tasks");
            },
            onError,
          });
        }}
      />
    </DetailPageLayout>
  );
}
