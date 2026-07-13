"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronLeft, FlaskConical, History, PanelRight, Plus, Rocket, Save } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { FlowCanvas } from "@/components/automations/flow-canvas";
import { NodeLibrary } from "@/components/automations/node-library";
import { NodeConfigPanel } from "@/components/automations/node-config-panel";
import { useToast } from "@/components/ui/toast";
import type { Automation } from "@/types/automations";

export function FlowEditor({ automation }: { automation: Automation }) {
  const { toast } = useToast();
  const [nodes] = React.useState(automation.nodes);
  const [selectedId, setSelectedId] = React.useState<string | undefined>(nodes[0]?.id);
  const [active, setActive] = React.useState(automation.status === "active");
  const [mobileConfigOpen, setMobileConfigOpen] = React.useState(false);

  const selected = nodes.find((n) => n.id === selectedId);
  const addNode = (typeId: string) => toast({ title: `Nó adicionado: ${typeId} (mock)` });

  const handleSelect = (id: string) => {
    setSelectedId(id);
    if (window.matchMedia("(max-width: 1023px)").matches) setMobileConfigOpen(true);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/automations" aria-label="Voltar" className="inline-flex items-center gap-1 rounded-md text-body2 font-medium text-ink-2 transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">
          <ChevronLeft className="size-4" aria-hidden />
          Automações
        </Link>
        <h1 className="min-w-0 flex-1 truncate font-display text-h2 font-bold text-ink">{automation.name}</h1>
        <label className="flex items-center gap-2 text-body2 text-ink-2">
          <Switch checked={active} onCheckedChange={(v) => { setActive(v); toast({ title: v ? "Automação ativada (mock)" : "Automação pausada (mock)", variant: v ? "success" : "warning" }); }} />
          {active ? "Ativa" : "Pausada"}
        </label>
        <Button variant="secondary" size="sm" asChild>
          <Link href={`/automations/${automation.id}/executions`}><History /><span className="hidden sm:inline">Histórico</span></Link>
        </Button>
        <Button variant="secondary" size="sm" onClick={() => toast({ title: "Teste executado (mock)", variant: "success" })}><FlaskConical /><span className="hidden sm:inline">Testar</span></Button>
        <Button variant="secondary" size="sm" onClick={() => toast({ title: "Rascunho salvo (mock)", variant: "success" })}><Save /><span className="hidden sm:inline">Salvar</span></Button>
        <Button size="sm" onClick={() => toast({ title: "Automação publicada (mock)", variant: "success" })}><Rocket /><span className="hidden sm:inline">Publicar</span></Button>
      </div>

      {/* Mobile: botões de biblioteca/config */}
      <div className="flex items-center gap-2 lg:hidden">
        <Sheet>
          <SheetTrigger asChild><Button variant="secondary" size="sm"><Plus />Biblioteca de nós</Button></SheetTrigger>
          <SheetContent side="left" title="Biblioteca de nós" description="Adicione um nó ao fluxo."><NodeLibrary onAdd={addNode} /></SheetContent>
        </Sheet>
        <Sheet open={mobileConfigOpen} onOpenChange={setMobileConfigOpen}>
          <SheetTrigger asChild><Button variant="secondary" size="sm"><PanelRight />Configurar nó</Button></SheetTrigger>
          <SheetContent side="right" title="Configuração do nó"><NodeConfigPanel node={selected} onRemove={() => { toast({ title: "Nó removido (mock)", variant: "warning" }); setMobileConfigOpen(false); }} /></SheetContent>
        </Sheet>
      </div>

      {/* Desktop: biblioteca + canvas + config */}
      <div className="grid gap-4 lg:grid-cols-[240px_1fr_320px]">
        <Card className="hidden h-[560px] overflow-hidden p-0 lg:block"><NodeLibrary onAdd={addNode} /></Card>
        <FlowCanvas nodes={nodes} selectedId={selectedId} onSelect={handleSelect} />
        <Card className="hidden h-[560px] overflow-hidden p-0 lg:block"><NodeConfigPanel node={selected} onRemove={() => toast({ title: "Nó removido (mock)", variant: "warning" })} /></Card>
      </div>
    </div>
  );
}
