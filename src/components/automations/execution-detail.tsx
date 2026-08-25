"use client";

import { RotateCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatList } from "@/components/business/kpi-block";
import { DetailPageLayout } from "@/components/patterns/page-patterns";
import { ExecutionStatusBadge } from "@/components/automations/badges";
import { ExecutionTimeline } from "@/components/automations/execution-timeline";
import { LogViewer } from "@/components/automations/log-viewer";
import { useToast } from "@/components/ui/toast";
import type { Execution } from "@/types/automations";

const payload = `{
  "trigger": "lead.created",
  "lead": {
    "id": "lead_4821",
    "name": "Larissa · Grão Café",
    "email": "•••••@graocafe.com.br",
    "phone": "+55 11 •••••-••••",
    "source": "instagram"
  },
  "context": {
    "owner": "Camila Ribeiro",
    "campaign": "reels-julho"
  }
}`;

export function ExecutionDetail({ execution: e }: { execution: Execution }) {
  const { toast } = useToast();

  const aside = (
    <div className="flex flex-col gap-4">
      <Card className="p-5">
        <div className="mb-3"><ExecutionStatusBadge status={e.status} size="md" /></div>
        <StatList
          items={[
            { label: "Início", value: e.startedAt },
            { label: "Fim", value: e.finishedAt },
            { label: "Duração", value: e.duration },
            { label: "Trigger", value: e.trigger },
            { label: "Tentativa", value: e.attempt > 1 ? `${e.attempt}/3` : "1" },
          ]}
        />
        <Button size="sm" className="mt-4 w-full" onClick={() => toast({ title: "Execução reprocessada (mock)", variant: "success" })}>
          <RotateCw />
          Repetir execução
        </Button>
      </Card>
    </div>
  );

  return (
    <DetailPageLayout
      title={e.automationName}
      subtitle={`Execução ${e.id} · ${e.startedAt}`}
      back={{ href: "/automation-executions", label: "Execuções" }}
      aside={aside}
    >
      <Tabs defaultValue="timeline">
        <TabsList>
          <TabsTrigger value="timeline">Nós executados</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="payload">Payload</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline">
          <Card className="p-5"><ExecutionTimeline steps={e.steps} /></Card>
        </TabsContent>

        <TabsContent value="logs">
          <LogViewer logs={e.logs} />
        </TabsContent>

        <TabsContent value="payload">
          <Card className="overflow-hidden p-0">
            <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
              <p className="font-display text-h3 font-semibold text-ink">Payload sanitizado</p>
              <span className="text-caption text-ink-3">dados sensíveis mascarados</span>
            </div>
            <pre className="overflow-x-auto p-4 font-mono text-caption leading-relaxed text-ink">{payload}</pre>
          </Card>
        </TabsContent>
      </Tabs>
    </DetailPageLayout>
  );
}
