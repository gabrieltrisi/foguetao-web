"use client";

import { Copy, RefreshCw, Send, Sparkles, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TwoColumnLayout } from "@/components/patterns/page-patterns";
import { useToast } from "@/components/ui/toast";

const summary = [
  "Cliente do segmento de tecnologia, time de 12 pessoas.",
  "Interessado no plano Performance anual.",
  "Solicitou proposta com desconto por volume.",
  "Decisor confirmado; retorno previsto para sexta.",
];

const suggestion =
  "Oi Larissa! Consigo aplicar 15% de desconto no plano anual e incluir o onboarding premium sem custo. Fechando ainda hoje, garanto essa condição. Posso enviar o link de pagamento?";

const insights = [
  { label: "Sentimento", value: "Positivo", tone: "success" as const },
  { label: "Prob. de fechamento", value: "82%", tone: "brand" as const },
  { label: "Tempo de resposta", value: "Rápido", tone: "info" as const },
  { label: "Intenção", value: "Compra", tone: "warning" as const },
];

export function AIAssistantView() {
  const { toast } = useToast();

  const aside = (
    <div className="flex flex-col gap-4">
      <Card className="p-5">
        <p className="mb-3 text-caption font-semibold uppercase tracking-wide text-ink-3">Próxima ação</p>
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
            <TrendingUp className="size-4" aria-hidden />
          </span>
          <div>
            <p className="text-body2 font-semibold text-ink">Enviar link de pagamento</p>
            <p className="mt-0.5 text-caption text-ink-2">A conversa está madura para fechamento. Envie a condição com prazo.</p>
          </div>
        </div>
        <Button size="sm" className="mt-4 w-full" onClick={() => toast({ title: "Ação executada (mock)", variant: "success" })}>
          Executar ação
        </Button>
      </Card>

      <Card className="p-5">
        <p className="mb-3 text-caption font-semibold uppercase tracking-wide text-ink-3">Insights</p>
        <div className="grid grid-cols-2 gap-3">
          {insights.map((i) => (
            <div key={i.label} className="rounded-lg border border-line p-3">
              <p className="text-caption text-ink-3">{i.label}</p>
              <Badge tone={i.tone} size="md" className="mt-1 normal-case">{i.value}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  return (
    <div className="flex flex-col gap-5">
      <Card className="flex items-center gap-4 border-brand/20 bg-brand-soft/40 p-5">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand text-white">
          <Sparkles className="size-6" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-h2 font-bold text-ink">Assistente de IA</h2>
            <Badge tone="brand" size="md">Beta</Badge>
          </div>
          <p className="mt-0.5 text-body2 text-ink-2">
            Resumos, sugestões de resposta e próximas ações para acelerar seus atendimentos.
          </p>
        </div>
      </Card>

      <TwoColumnLayout
        aside={aside}
        main={
          <div className="flex flex-col gap-5">
            <Card className="p-5">
              <p className="mb-3 flex items-center gap-2 text-caption font-semibold uppercase tracking-wide text-ink-3">
                <Sparkles className="size-3.5 text-brand" aria-hidden /> Resumo da conversa
              </p>
              <ul className="flex flex-col gap-2">
                {summary.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-body2 text-ink-2">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand" aria-hidden />
                    {s}
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <p className="flex items-center gap-2 text-caption font-semibold uppercase tracking-wide text-ink-3">
                  <Sparkles className="size-3.5 text-brand" aria-hidden /> Sugestão de resposta
                </p>
                <Button variant="ghost" size="sm" onClick={() => toast({ title: "Gerando nova sugestão… (mock)" })}>
                  <RefreshCw />
                  Regenerar
                </Button>
              </div>
              <p className="rounded-lg border border-line bg-surface p-4 text-body2 text-ink">{suggestion}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Button size="sm" onClick={() => toast({ title: "Sugestão inserida no chat (mock)", variant: "success" })}>
                  <Send />
                  Usar sugestão
                </Button>
                <Button variant="secondary" size="sm" onClick={() => toast({ title: "Copiado (mock)" })}>
                  <Copy />
                  Copiar
                </Button>
              </div>
            </Card>
          </div>
        }
      />
    </div>
  );
}
