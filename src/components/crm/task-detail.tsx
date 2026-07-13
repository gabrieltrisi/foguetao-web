"use client";

import * as React from "react";
import { CheckCircle2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PriorityBadge, StatusBadge } from "@/components/business/badges";
import { StatList } from "@/components/business/kpi-block";
import { ActivityItem } from "@/components/business/timeline";
import { CommentItem } from "@/components/business/items";
import { AssigneeSelector } from "@/components/business/assignee-selector";
import { DetailPageLayout } from "@/components/patterns/page-patterns";
import { useToast } from "@/components/ui/toast";
import { taskStatusLabel, taskStatusTone } from "@/mocks/crm/tasks";
import { contactActivities, dealComments } from "@/mocks/crm/timeline";
import type { Task } from "@/types/crm";

const PEOPLE = [
  { id: "cr", name: "Camila Ribeiro" },
  { id: "rm", name: "Rafael Monteiro" },
  { id: "ba", name: "Bruno Alcântara" },
  { id: "lp", name: "Larissa Prado" },
];

export function TaskDetail({ task }: { task: Task }) {
  const { toast } = useToast();
  const [comment, setComment] = React.useState("");
  const [owner, setOwner] = React.useState(PEOPLE.find((p) => p.name === task.assignee)?.id ?? "cr");

  const aside = (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col gap-3 p-5">
        <div className="flex items-center gap-2">
          <StatusBadge tone={taskStatusTone[task.status]}>{taskStatusLabel[task.status]}</StatusBadge>
          <PriorityBadge priority={task.priority} />
        </div>
        <StatList
          items={[
            { label: "Prazo", value: task.dueLabel },
            { label: "Relacionado a", value: task.relatedTo ?? "—" },
          ]}
        />
      </Card>
      <Card className="p-4">
        <p className="mb-2 text-caption font-semibold uppercase tracking-wide text-ink-3">Responsável</p>
        <AssigneeSelector people={PEOPLE} value={owner} onValueChange={setOwner} />
      </Card>
    </div>
  );

  return (
    <DetailPageLayout
      title={task.title}
      subtitle={task.relatedTo ? `Relacionado a ${task.relatedTo}` : "Tarefa"}
      back={{ href: "/tasks", label: "Tarefas" }}
      actions={
        <>
          <Button size="sm" variant="secondary">
            <Pencil />
            Editar
          </Button>
          <Button size="sm" onClick={() => toast({ title: "Tarefa concluída (mock)", variant: "success" })}>
            <CheckCircle2 />
            Concluir
          </Button>
        </>
      }
      aside={aside}
    >
      <Tabs defaultValue="resumo">
        <TabsList>
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="comentarios">Comentários</TabsTrigger>
          <TabsTrigger value="atividades">Atividades</TabsTrigger>
        </TabsList>

        <TabsContent value="resumo">
          <Card className="p-5">
            <p className="text-body2 text-ink-2">{task.description}</p>
          </Card>
        </TabsContent>

        <TabsContent value="comentarios">
          <div className="flex flex-col gap-4">
            <Card className="flex flex-col gap-2 p-4">
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Escreva um comentário…"
                aria-label="Novo comentário"
              />
              <div className="flex justify-end">
                <Button
                  size="sm"
                  disabled={!comment.trim()}
                  onClick={() => {
                    toast({ title: "Comentário adicionado (mock)", variant: "success" });
                    setComment("");
                  }}
                >
                  Comentar
                </Button>
              </div>
            </Card>
            {dealComments.map((c) => (
              <CommentItem key={c.id} author={c.author} time={c.time} body={c.body} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="atividades">
          <Card className="flex flex-col gap-4 p-5">
            {contactActivities.map((a) => (
              <ActivityItem key={a.id} actorName={a.actor} text={a.text} time={a.time} />
            ))}
          </Card>
        </TabsContent>
      </Tabs>
    </DetailPageLayout>
  );
}
