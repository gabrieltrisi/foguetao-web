"use client";

import * as React from "react";
import { Pencil, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TableContainer,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/business/badges";
import { KPIBlock, StatList } from "@/components/business/kpi-block";
import { Timeline, ActivityItem } from "@/components/business/timeline";
import { CommentItem, FileItem } from "@/components/business/items";
import { AssigneeSelector } from "@/components/business/assignee-selector";
import { Stepper } from "@/components/ui/stepper";
import { DetailPageLayout, DashboardSection } from "@/components/patterns/page-patterns";
import { useToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/format";
import { pipelineStages } from "@/mocks/crm/deals";
import {
  contactActivities,
  dealChecklist,
  dealComments,
  dealProducts,
  dealTimeline,
  detailFiles,
} from "@/mocks/crm/timeline";
import type { Deal } from "@/types/crm";

const PEOPLE = [
  { id: "cr", name: "Camila Ribeiro" },
  { id: "rm", name: "Rafael Monteiro" },
  { id: "ba", name: "Bruno Alcântara" },
  { id: "lp", name: "Larissa Prado" },
];

export function DealDetail({ deal }: { deal: Deal }) {
  const { toast } = useToast();
  const [comment, setComment] = React.useState("");
  const [owner, setOwner] = React.useState(PEOPLE.find((p) => p.name === deal.owner)?.id ?? "cr");
  const [checks, setChecks] = React.useState<Record<string, boolean>>(
    Object.fromEntries(dealChecklist.map((c) => [c.id, c.done])),
  );

  const stageIndex = pipelineStages.findIndex((s) => s.id === deal.stageId);
  const productsTotal = dealProducts.reduce((s, p) => s + p.price, 0);
  const doneCount = Object.values(checks).filter(Boolean).length;

  const aside = (
    <div className="flex flex-col gap-4">
      <Card className="p-5">
        <KPIBlock label="Valor" value={formatCurrency(deal.value)} delta={`${deal.probability}% prob.`} trend="up" />
        <div className="mt-4">
          <StatusBadge tone={deal.status === "ganho" ? "success" : "info"}>
            {pipelineStages[stageIndex]?.label}
          </StatusBadge>
        </div>
      </Card>
      <Card className="p-4">
        <p className="mb-2 text-caption font-semibold uppercase tracking-wide text-ink-3">Responsável</p>
        <AssigneeSelector people={PEOPLE} value={owner} onValueChange={setOwner} />
      </Card>
      <Card className="p-4">
        <p className="mb-3 text-caption font-semibold uppercase tracking-wide text-ink-3">Detalhes</p>
        <StatList
          items={[
            { label: "Organização", value: deal.organizationName },
            { label: "Contato", value: deal.contactName },
            { label: "Fechamento", value: deal.closeDate },
            { label: "Probabilidade", value: `${deal.probability}%` },
          ]}
        />
      </Card>
    </div>
  );

  return (
    <DetailPageLayout
      title={deal.title}
      subtitle={`${deal.organizationName} · ${deal.contactName}`}
      back={{ href: "/deals", label: "Oportunidades" }}
      actions={
        <>
          <Button size="sm" variant="secondary">
            <Pencil />
            Editar
          </Button>
          <Button size="sm" onClick={() => toast({ title: "Oportunidade ganha! 🎉", variant: "success" })}>
            <Trophy />
            Marcar como ganho
          </Button>
        </>
      }
      aside={aside}
    >
      <div className="mb-5 rounded-lg border border-line bg-white p-4">
        <Stepper steps={pipelineStages.map((s) => ({ label: s.label }))} current={stageIndex} />
      </div>

      <Tabs defaultValue="resumo">
        <TabsList className="overflow-x-auto">
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="atividades">Atividades</TabsTrigger>
          <TabsTrigger value="checklist">Checklist</TabsTrigger>
          <TabsTrigger value="produtos">Produtos</TabsTrigger>
          <TabsTrigger value="comentarios">Comentários</TabsTrigger>
          <TabsTrigger value="arquivos">Arquivos</TabsTrigger>
        </TabsList>

        <TabsContent value="resumo">
          <DashboardSection title="Histórico">
            <Card className="p-5">
              <Timeline items={dealTimeline} />
            </Card>
          </DashboardSection>
        </TabsContent>

        <TabsContent value="atividades">
          <Card className="flex flex-col gap-4 p-5">
            {contactActivities.map((a) => (
              <ActivityItem key={a.id} actorName={a.actor} text={a.text} time={a.time} />
            ))}
          </Card>
        </TabsContent>

        <TabsContent value="checklist">
          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-body2 font-semibold text-ink">Checklist</p>
              <span className="text-caption text-ink-3">{doneCount}/{dealChecklist.length}</span>
            </div>
            <ul className="flex flex-col gap-2">
              {dealChecklist.map((c) => (
                <li key={c.id} className="flex items-center gap-2.5">
                  <Checkbox
                    id={`chk-${c.id}`}
                    checked={checks[c.id]}
                    onCheckedChange={(v) => setChecks((p) => ({ ...p, [c.id]: v === true }))}
                  />
                  <label
                    htmlFor={`chk-${c.id}`}
                    className={checks[c.id] ? "text-body2 text-ink-3 line-through" : "text-body2 text-ink"}
                  >
                    {c.label}
                  </label>
                </li>
              ))}
            </ul>
          </Card>
        </TabsContent>

        <TabsContent value="produtos">
          <TableContainer>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead className="text-right">Qtd</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dealProducts.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="text-right tabular-nums">{p.qty}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatCurrency(p.price)}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="hover:bg-transparent">
                  <TableCell className="font-semibold">Total</TableCell>
                  <TableCell />
                  <TableCell className="text-right font-display font-bold text-ink tabular-nums">
                    {formatCurrency(productsTotal)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
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

        <TabsContent value="arquivos">
          <div className="flex flex-col gap-2">
            {detailFiles.map((f) => (
              <FileItem key={f.id} name={f.name} size={f.size} onDownload={() => {}} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </DetailPageLayout>
  );
}
