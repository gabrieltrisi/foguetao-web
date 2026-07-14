"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { Combobox } from "@/components/ui/combobox";
import { FormPageLayout } from "@/components/patterns/page-patterns";
import { ErrorState } from "@/components/ui/error-state";
import { useToast } from "@/components/ui/toast";
import { useSession } from "@/providers/session-provider";
import { useTask, useCreateTask, useUpdateTask } from "@/hooks/crm/use-tasks";
import { useAssignableMembers } from "@/hooks/crm/use-assignable-members";
import { useDeals } from "@/hooks/crm/use-deals";
import { useContacts } from "@/hooks/crm/use-contacts";
import { useOrganizations } from "@/hooks/crm/use-organizations";
import {
  taskStatusMeta,
  taskPriorityMeta,
  toDateTimeLocal,
  fromDateTimeLocal,
  messageForTaskError,
} from "@/lib/crm/task-helpers";
import { isApiError } from "@/types/api/error";
import {
  creatableTaskStatus,
  patchableTaskStatus,
  type ApiTask,
  type CreateTaskInput,
  type UpdateTaskInput,
  type TaskPriority,
} from "@/types/api/crm-tasks";

const PRIORITY_OPTIONS = (["LOW", "MEDIUM", "HIGH", "URGENT"] as TaskPriority[]).map((p) => ({
  value: p,
  label: taskPriorityMeta[p].label,
}));

interface FormState {
  title: string;
  description: string;
  assignedToUserId: string;
  status: string;
  priority: string;
  /** Valores de `<input type="datetime-local">` (hora LOCAL). */
  dueAt: string;
  reminderAt: string;
  dealId: string;
  contactId: string;
  organizationId: string;
}

const empty: FormState = {
  title: "",
  description: "",
  assignedToUserId: "",
  status: "PENDING",
  priority: "MEDIUM",
  dueAt: "",
  reminderAt: "",
  dealId: "",
  contactId: "",
  organizationId: "",
};

export function TaskForm({ taskId }: { taskId?: string }) {
  const isEdit = Boolean(taskId);
  const { can } = useSession();
  const detail = useTask(taskId ?? "");

  if (!can(isEdit ? "crm.tasks.update" : "crm.tasks.create")) {
    return (
      <p className="py-16 text-center text-body2 text-ink-3">
        Você não tem permissão para {isEdit ? "editar" : "criar"} tarefas.
      </p>
    );
  }

  if (isEdit) {
    if (detail.isLoading) return <p className="py-16 text-center text-body2 text-ink-3">Carregando…</p>;
    if (detail.isError || !detail.data) {
      const notFound = isApiError(detail.error) && detail.error.statusCode === 404;
      return (
        <ErrorState
          title={notFound ? "Tarefa não encontrada." : "Falha ao carregar a tarefa."}
          onRetry={notFound ? undefined : () => detail.refetch()}
        />
      );
    }
    // O backend recusa PATCH em tarefa concluída — não abrimos um form inútil.
    if (detail.data.status === "COMPLETED") {
      return (
        <ErrorState title="Tarefa concluída." message="Reabra a tarefa para poder editá-la." />
      );
    }
  }

  const t = detail.data;
  const initial: FormState = t ? fromTask(t) : empty;

  return <TaskFormFields key={taskId ?? "new"} initial={initial} taskId={taskId} />;
}

function fromTask(t: ApiTask): FormState {
  return {
    title: t.title,
    description: t.description ?? "",
    assignedToUserId: t.assignedToUserId,
    status: t.status,
    priority: t.priority,
    dueAt: toDateTimeLocal(t.dueAt),
    reminderAt: toDateTimeLocal(t.reminderAt),
    dealId: t.dealId ?? "",
    contactId: t.contactId ?? "",
    organizationId: t.organizationId ?? "",
  };
}

function TaskFormFields({ initial, taskId }: { initial: FormState; taskId?: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const isEdit = Boolean(taskId);

  const [form, setForm] = React.useState<FormState>(initial);
  const set = (k: keyof FormState) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const members = useAssignableMembers();
  const deals = useDeals({ limit: 100 });
  const contacts = useContacts({ limit: 100 });
  const orgs = useOrganizations({ limit: 100 });
  const create = useCreateTask();
  const update = useUpdateTask(taskId ?? "");

  const pending = create.isPending || update.isPending;
  const backHref = isEdit && taskId ? `/tasks/${taskId}` : "/tasks";

  const statusOptions = (isEdit ? patchableTaskStatus : creatableTaskStatus).map((s) => ({
    value: s,
    label: taskStatusMeta[s].label,
  }));

  // Criar exige responsável; editar não altera responsável (endpoint /assign).
  const canSubmit =
    Boolean(form.title.trim()) && (isEdit || Boolean(form.assignedToUserId)) && !pending;

  async function handleSave() {
    if (isEdit && taskId) {
      const payload: UpdateTaskInput = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        status: form.status as UpdateTaskInput["status"],
        priority: form.priority as TaskPriority,
        // `null` limpa o campo no backend; string → ISO UTC sem deslocar o dia.
        dueAt: fromDateTimeLocal(form.dueAt),
        reminderAt: fromDateTimeLocal(form.reminderAt),
        dealId: form.dealId || null,
        contactId: form.contactId || null,
        organizationId: form.organizationId || null,
      };
      try {
        await update.mutateAsync(payload);
        toast({ title: "Tarefa atualizada", variant: "success" });
        router.push(`/tasks/${taskId}`);
      } catch (error) {
        toast({ title: messageForTaskError(error), variant: "error" });
      }
      return;
    }

    const payload: CreateTaskInput = {
      title: form.title.trim(),
      assignedToUserId: form.assignedToUserId,
      description: form.description.trim() || undefined,
      status: form.status as CreateTaskInput["status"],
      priority: form.priority as TaskPriority,
      dueAt: fromDateTimeLocal(form.dueAt) ?? undefined,
      reminderAt: fromDateTimeLocal(form.reminderAt) ?? undefined,
      dealId: form.dealId || undefined,
      contactId: form.contactId || undefined,
      organizationId: form.organizationId || undefined,
    };
    try {
      const created = await create.mutateAsync(payload);
      toast({ title: "Tarefa criada", variant: "success" });
      router.push(`/tasks/${created.id}`);
    } catch (error) {
      toast({ title: messageForTaskError(error), variant: "error" });
    }
  }

  return (
    <FormPageLayout
      title={isEdit ? "Editar tarefa" : "Nova tarefa"}
      description={isEdit ? "Atualize os dados da tarefa." : "Cadastre uma nova tarefa."}
      back={{ href: backHref, label: "Tarefas" }}
      footer={
        <>
          <Button asChild variant="secondary" size="sm">
            <Link href={backHref}>Cancelar</Link>
          </Button>
          <Button size="sm" loading={pending} disabled={!canSubmit} onClick={handleSave}>
            {isEdit ? "Salvar alterações" : "Criar tarefa"}
          </Button>
        </>
      }
    >
      <Card className="p-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField id="tf-title" label="Título" required className="sm:col-span-2">
            {(p) => (
              <Input
                placeholder="Ex.: Ligar para o cliente"
                value={form.title}
                onChange={(e) => set("title")(e.target.value)}
                {...p}
              />
            )}
          </FormField>

          <FormField id="tf-desc" label="Descrição" className="sm:col-span-2">
            {(p) => (
              <Textarea
                value={form.description}
                onChange={(e) => set("description")(e.target.value)}
                {...p}
              />
            )}
          </FormField>

          {!isEdit ? (
            <FormField
              id="tf-assignee"
              label="Responsável"
              required
              description={
                members.canRead
                  ? "Somente membros ativos com papel elegível."
                  : "Você não tem permissão para listar membros."
              }
            >
              {(p) =>
                members.canRead ? (
                  <Combobox
                    id={p.id}
                    options={members.options}
                    value={form.assignedToUserId}
                    onValueChange={set("assignedToUserId")}
                    placeholder="Selecione o responsável"
                    disabled={members.isLoading}
                  />
                ) : (
                  <p className="text-body2 text-ink-3">
                    Peça a um administrador a permissão de leitura de membros para criar tarefas.
                  </p>
                )
              }
            </FormField>
          ) : (
            <FormField id="tf-assignee-note" label="Responsável" description="Altere pelo detalhe da tarefa.">
              {() => (
                <p className="text-body2 text-ink-3">
                  {members.nameById.get(form.assignedToUserId) ?? "Responsável atual"}
                </p>
              )}
            </FormField>
          )}

          <FormField id="tf-priority" label="Prioridade">
            {(p) => (
              <Combobox
                id={p.id}
                options={PRIORITY_OPTIONS}
                value={form.priority}
                onValueChange={set("priority")}
              />
            )}
          </FormField>

          <FormField id="tf-status" label="Status">
            {(p) => (
              <Combobox id={p.id} options={statusOptions} value={form.status} onValueChange={set("status")} />
            )}
          </FormField>

          <FormField id="tf-due" label="Prazo" description="Horário local.">
            {(p) => (
              <Input
                type="datetime-local"
                value={form.dueAt}
                onChange={(e) => set("dueAt")(e.target.value)}
                {...p}
              />
            )}
          </FormField>

          <FormField id="tf-reminder" label="Lembrete" description="Horário local.">
            {(p) => (
              <Input
                type="datetime-local"
                value={form.reminderAt}
                onChange={(e) => set("reminderAt")(e.target.value)}
                {...p}
              />
            )}
          </FormField>

          <FormField id="tf-deal" label="Oportunidade">
            {(p) => (
              <Combobox
                id={p.id}
                options={[
                  { value: "", label: "Nenhuma" },
                  ...(deals.data?.items ?? []).map((d) => ({ value: d.id, label: d.title })),
                ]}
                value={form.dealId}
                onValueChange={set("dealId")}
              />
            )}
          </FormField>

          <FormField id="tf-contact" label="Contato">
            {(p) => (
              <Combobox
                id={p.id}
                options={[
                  { value: "", label: "Nenhum" },
                  ...(contacts.data?.items ?? []).map((c) => ({ value: c.id, label: c.fullName })),
                ]}
                value={form.contactId}
                onValueChange={set("contactId")}
              />
            )}
          </FormField>

          <FormField id="tf-org" label="Organização">
            {(p) => (
              <Combobox
                id={p.id}
                options={[
                  { value: "", label: "Nenhuma" },
                  ...(orgs.data?.items ?? []).map((o) => ({ value: o.id, label: o.name })),
                ]}
                value={form.organizationId}
                onValueChange={set("organizationId")}
              />
            )}
          </FormField>
        </div>
      </Card>
    </FormPageLayout>
  );
}
