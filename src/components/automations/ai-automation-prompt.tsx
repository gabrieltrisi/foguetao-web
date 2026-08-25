"use client";

import * as React from "react";
import Link from "next/link";
import { Pencil, Save, Sparkles, Wand2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { FlowCanvas } from "@/components/automations/flow-canvas";
import { useToast } from "@/components/ui/toast";
import type { FlowNode } from "@/types/automations";

const EXAMPLE =
  "Quando um lead entrar pelo Instagram, esperar 15 minutos, enviar uma mensagem, criar uma tarefa e avisar o vendedor.";

const EXAMPLES = [
  "Quando um pagamento for aprovado, enviar um agradecimento e uma pesquisa NPS após 7 dias.",
  "Se um carrinho for abandonado, esperar 1 hora e enviar um cupom de 10%.",
  EXAMPLE,
];

const GENERATED: FlowNode[] = [
  { id: "g1", typeId: "trg-lead", label: "Lead criado", subtitle: "Origem: Instagram" },
  { id: "g2", typeId: "lgc-wait", label: "Esperar", subtitle: "15 minutos" },
  { id: "g3", typeId: "act-whatsapp", label: "Enviar mensagem", subtitle: "WhatsApp" },
  { id: "g4", typeId: "act-task", label: "Criar tarefa", subtitle: "Para o vendedor" },
  { id: "g5", typeId: "act-notify", label: "Avisar vendedor", subtitle: "Notificação" },
  { id: "g6", typeId: "exit-end", label: "Encerrar fluxo" },
];

export function AIAutomationPrompt() {
  const { toast } = useToast();
  const [prompt, setPrompt] = React.useState(EXAMPLE);
  const [generating, setGenerating] = React.useState(false);
  const [generated, setGenerated] = React.useState(false);

  const generate = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 900));
    setGenerating(false);
    setGenerated(true);
  };

  return (
    <div className="flex flex-col gap-5">
      <Card className="flex items-center gap-4 border-brand/20 bg-brand-soft/40 p-5">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand text-white"><Sparkles className="size-6" aria-hidden /></span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-h2 font-bold text-ink">Criar com IA</h2>
            <Badge tone="brand" size="md">Beta</Badge>
          </div>
          <p className="mt-0.5 text-body2 text-ink-2">Descreva a automação em linguagem natural e gere um fluxo pronto para editar.</p>
        </div>
      </Card>

      <Card className="p-5">
        <label htmlFor="ai-prompt" className="mb-2 block text-body2 font-semibold text-ink">Descreva a automação que deseja criar</label>
        <Textarea id="ai-prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={3} placeholder="Ex.: Quando um lead entrar pelo Instagram…" />
        <div className="mt-3 flex flex-wrap gap-2">
          {EXAMPLES.map((ex, i) => (
            <button key={i} type="button" onClick={() => setPrompt(ex)} className="rounded-full border border-line bg-white px-3 py-1 text-caption text-ink-2 transition-colors hover:border-brand/40 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">
              {ex.length > 48 ? `${ex.slice(0, 48)}…` : ex}
            </button>
          ))}
        </div>
        <Button className="mt-4" loading={generating} onClick={generate} disabled={!prompt.trim()}>
          <Wand2 />
          Gerar fluxo
        </Button>
      </Card>

      {generated ? (
        <Card className="p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <p className="flex items-center gap-2 font-display text-h3 font-semibold text-ink"><Sparkles className="size-4 text-brand" aria-hidden />Fluxo gerado</p>
            <div className="flex items-center gap-2">
              <Button asChild variant="secondary" size="sm"><Link href="/automations/new"><Pencil />Editar no editor</Link></Button>
              <Button size="sm" onClick={() => toast({ title: "Automação salva (mock)", variant: "success" })}><Save />Salvar automação</Button>
            </div>
          </div>
          <FlowCanvas nodes={GENERATED} className="h-[440px]" />
        </Card>
      ) : null}
    </div>
  );
}
