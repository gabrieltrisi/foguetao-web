"use client";

import * as React from "react";
import { RefreshCw, Settings2, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { AdminIcon } from "@/components/admin/admin-icon";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import {
  integrations,
  integrationStatusLabel,
  integrationStatusTone,
  integrationCategories,
} from "@/mocks/admin/integrations";
import type { Integration } from "@/types/admin";

function IntegrationCard({ integration }: { integration: Integration }) {
  const { toast } = useToast();
  const connected = integration.status === "connected";
  return (
    <Card className="flex flex-col gap-3 p-5">
      <div className="flex items-start justify-between gap-2">
        <span className="flex size-11 items-center justify-center rounded-xl bg-surface text-ink">
          <AdminIcon name={integration.icon} className="size-6" />
        </span>
        <Badge tone={integrationStatusTone[integration.status]}>{integrationStatusLabel[integration.status]}</Badge>
      </div>
      <div>
        <p className="font-medium text-ink">{integration.name}</p>
        <p className="text-caption text-ink-3">{integration.category}</p>
      </div>
      <p className="min-h-[2.5rem] text-body2 text-ink-2">{integration.description}</p>
      <div className="flex items-center justify-between gap-2 border-t border-line pt-3">
        <span className={cn("inline-flex items-center gap-1 text-caption", connected ? "text-ink-3" : "text-ink-3")}>
          {connected ? <><RefreshCw className="size-3.5" aria-hidden /> {integration.lastSync}</> : integration.status === "error" ? <span className="text-danger">{integration.lastSync}</span> : "Não conectado"}
        </span>
        <Button size="sm" variant={connected ? "ghost" : "secondary"} onClick={() => toast({ title: `Configurar ${integration.name} (mock)` })}>
          {connected ? <><Settings2 className="size-4" aria-hidden /> Configurar</> : <><Plus className="size-4" aria-hidden /> Conectar</>}
        </Button>
      </div>
    </Card>
  );
}

export function IntegrationsView() {
  const [category, setCategory] = React.useState("Todas");
  const filtered = integrations.filter((i) => category === "Todas" || i.category === category);
  const connectedCount = integrations.filter((i) => i.status === "connected").length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-body2 text-ink-2"><span className="font-medium text-ink">{connectedCount}</span> de {integrations.length} conectadas</p>
      </div>
      <div className="no-scrollbar overflow-x-auto">
        <SegmentedControl
          options={integrationCategories.map((c) => ({ value: c, label: c }))}
          value={category}
          onValueChange={setCategory}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((i) => <IntegrationCard key={i.id} integration={i} />)}
      </div>
    </div>
  );
}
