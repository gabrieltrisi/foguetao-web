"use client";

import * as React from "react";
import { Plus, Settings, Trash2, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { SearchInput } from "@/components/ui/search-input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Pill } from "@/components/ui/pill";
import { PriorityBadge, StatusBadge } from "@/components/ui/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { ListSkeleton } from "@/components/ui/list-skeleton";
import { MetricCardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Modal, ModalClose, ModalContent, ModalTrigger } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { FadeIn } from "@/components/ui/motion";
import { ShowcaseNav } from "@/components/design-system/showcase-nav";
import type { Metric } from "@/types";

function Section({
  title,
  description,
  children,
  id,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="scroll-mt-20">
      <div className="mb-4">
        <h2 className="font-display text-h2 font-semibold text-ink">{title}</h2>
        {description ? <p className="mt-0.5 text-body2 text-ink-2">{description}</p> : null}
      </div>
      <Card className="p-5">{children}</Card>
    </section>
  );
}

const colorTokens = [
  { name: "Brand", cls: "bg-brand", hex: "#E0070F" },
  { name: "Brand Dark", cls: "bg-brand-dark", hex: "#8A0509" },
  { name: "Brand Soft", cls: "bg-brand-soft", hex: "#FDECEC" },
  { name: "Ink", cls: "bg-ink", hex: "#17171A" },
  { name: "Ink 2", cls: "bg-ink-2", hex: "#66666D" },
  { name: "Ink 3", cls: "bg-ink-3", hex: "#929298" },
  { name: "Surface", cls: "bg-surface", hex: "#F7F7F8" },
  { name: "Line", cls: "bg-line", hex: "#E6E6E8" },
  { name: "Success", cls: "bg-success", hex: "#16A34A" },
  { name: "Warning", cls: "bg-warning", hex: "#D97706" },
  { name: "Danger", cls: "bg-danger", hex: "#DC2626" },
  { name: "Info", cls: "bg-info", hex: "#2563EB" },
];

const typeScale = [
  { cls: "text-display font-display font-bold", label: "Display / 32" },
  { cls: "text-h1 font-display font-bold", label: "H1 / 22" },
  { cls: "text-h2 font-display font-semibold", label: "H2 / 18" },
  { cls: "text-h3 font-display font-semibold", label: "H3 / 14" },
  { cls: "text-body", label: "Body / 14" },
  { cls: "text-body2", label: "Body 2 / 13" },
  { cls: "text-small", label: "Small / 12" },
  { cls: "text-caption", label: "Caption / 11" },
  { cls: "text-micro", label: "Micro / 10" },
];

const spacingScale = [4, 8, 12, 16, 20, 24, 32, 48, 64];

const sampleMetric: Metric = {
  id: "demo",
  label: "Contatos",
  value: "12.482",
  deltaPercent: 8.2,
  trend: "up",
  hint: "Exemplo de métrica.",
};

export function DesignSystemShowcase() {
  const { toast } = useToast();

  return (
    <TooltipProvider delayDuration={150}>
      <FadeIn className="flex flex-col gap-8">
        <PageHeader
          title="Design System"
          description="Referência viva dos componentes, estados e tokens do Foguetão."
        />

        <ShowcaseNav />

        {/* Cores */}
        <Section title="Cores" description="Paleta semântica.">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {colorTokens.map((c) => (
              <div key={c.name} className="flex items-center gap-3">
                <span className={cn("size-10 shrink-0 rounded-lg border border-line", c.cls)} />
                <span className="min-w-0">
                  <span className="block truncate text-body2 font-semibold text-ink">{c.name}</span>
                  <span className="block text-caption text-ink-3">{c.hex}</span>
                </span>
              </div>
            ))}
          </div>
        </Section>

        {/* Tipografia */}
        <Section title="Tipografia" description="Sora (títulos) e Inter (corpo).">
          <div className="flex flex-col gap-3">
            {typeScale.map((t) => (
              <div key={t.label} className="flex items-baseline gap-4">
                <span className="w-24 shrink-0 text-caption text-ink-3">{t.label}</span>
                <span className={cn("truncate text-ink", t.cls)}>Foguetão acelera o CRM</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Espaçamentos + Sombras */}
        <div className="grid gap-8 lg:grid-cols-2">
          <Section title="Espaçamentos" description="Escala base 4px.">
            <div className="flex flex-wrap items-end gap-3">
              {spacingScale.map((s) => (
                <div key={s} className="flex flex-col items-center gap-1">
                  <span className="bg-brand" style={{ width: s, height: s }} />
                  <span className="text-caption text-ink-3">{s}</span>
                </div>
              ))}
            </div>
          </Section>
          <Section title="Sombras" description="Discretas; cards dependem de borda.">
            <div className="flex flex-wrap gap-4">
              {(["shadow-sm", "shadow-md", "shadow-lg"] as const).map((s) => (
                <div
                  key={s}
                  className={cn(
                    "flex h-16 w-32 items-center justify-center rounded-lg bg-white text-small font-medium text-ink-2",
                    s,
                  )}
                >
                  {s}
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* Botões */}
        <Section title="Botões" description="Variantes, tamanhos e estados.">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <Button>Primário</Button>
              <Button variant="secondary">Secundário</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">
                <Trash2 />
                Danger
              </Button>
              <Button variant="outlineBrand">Outline</Button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
              <Button size="icon" aria-label="Adicionar">
                <Plus />
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button loading>Loading</Button>
              <Button disabled>Disabled</Button>
            </div>
          </div>
        </Section>

        {/* Formulários */}
        <Section title="Inputs & formulários" description="Default, foco, erro, sucesso e desabilitado.">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="ds-default">Padrão</Label>
              <Input id="ds-default" placeholder="Digite algo…" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ds-error">Erro</Label>
              <Input id="ds-error" defaultValue="valor inválido" state="error" />
              <p className="text-small text-danger">Mensagem de erro.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ds-success">Sucesso</Label>
              <Input id="ds-success" defaultValue="tudo certo" state="success" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ds-disabled">Desabilitado</Label>
              <Input id="ds-disabled" placeholder="Indisponível" disabled />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ds-pass">Senha</Label>
              <PasswordInput id="ds-pass" placeholder="Sua senha" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ds-search">Busca</Label>
              <SearchInput id="ds-search" placeholder="Buscar…" shortcut="Ctrl K" />
            </div>
            <div className="space-y-1.5">
              <Label>Select</Label>
              <Select defaultValue="sp">
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sp">Matriz SP</SelectItem>
                  <SelectItem value="rj">Filial RJ</SelectItem>
                  <SelectItem value="labs">Foguetão Labs</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-4">
              <label className="flex items-center gap-2 text-body2 text-ink-2">
                <Checkbox defaultChecked /> Marcado
              </label>
              <label className="flex items-center gap-2 text-body2 text-ink-2">
                <Checkbox /> Vazio
              </label>
              <label className="flex items-center gap-2 text-body2 text-ink-3">
                <Checkbox disabled /> Off
              </label>
            </div>
          </div>
        </Section>

        {/* Badges, pills, avatares, tooltip, dropdown */}
        <Section title="Badges, avatares e menus" description="Elementos de status e navegação.">
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="neutral">Neutral</Badge>
              <Badge tone="brand">Beta</Badge>
              <Badge tone="success">Ganho</Badge>
              <Badge tone="warning">Atenção</Badge>
              <Badge tone="danger">Erro</Badge>
              <Badge tone="info">Info</Badge>
              <PriorityBadge priority="alta" />
              <PriorityBadge priority="media" />
              <PriorityBadge priority="baixa" />
              <StatusBadge tone="success">Ganho</StatusBadge>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Pill active>Ativo</Pill>
              <Pill>Inativo</Pill>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Avatar initials="CR" size="sm" />
              <Avatar initials="RM" size="md" />
              <Avatar initials="BA" size="lg" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="secondary" size="sm">
                    Passe o mouse
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Tooltip acessível</TooltipContent>
              </Tooltip>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="sm">
                    Abrir menu
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuLabel>Ações</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Users aria-hidden />
                    Novo contato
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings aria-hidden />
                    Configurações
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </Section>

        {/* Cards + metric cards */}
        <Section title="Cards & métricas">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <MetricCard metric={sampleMetric} />
            <MetricCard metric={{ ...sampleMetric, id: "d2", label: "Vendas", value: "R$ 428k", deltaPercent: -2.1, trend: "down" }} />
            <Card className="p-5">
              <h3 className="font-display text-h3 font-semibold text-ink">Card simples</h3>
              <p className="mt-1 text-body2 text-ink-2">Depende de borda, sombra discreta.</p>
            </Card>
          </div>
        </Section>

        {/* Empty & error */}
        <div className="grid gap-8 lg:grid-cols-2">
          <Section title="Empty state">
            <EmptyState
              icon={Users}
              title="Nenhum contato encontrado."
              description="Adicione contatos ou importe sua base atual."
              action={
                <Button size="sm">
                  <Plus />
                  Novo contato
                </Button>
              }
              secondaryAction={
                <Button size="sm" variant="secondary">
                  Importar
                </Button>
              }
            />
          </Section>
          <Section title="Error state (card)">
            <ErrorState
              variant="card"
              onRetry={() => toast({ title: "Recarregando…", variant: "info" })}
            />
          </Section>
        </div>

        {/* Skeletons */}
        <Section title="Skeletons" description="Estados de carregamento.">
          <div className="grid gap-4 lg:grid-cols-3">
            <MetricCardSkeleton />
            <Card className="p-5">
              <Skeleton className="h-4 w-40" />
              <ListSkeleton rows={3} className="mt-5" />
            </Card>
            <Card className="p-5">
              <Skeleton className="h-4 w-32" />
              <div className="mt-5 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            </Card>
          </div>
        </Section>

        {/* Toasts + modal */}
        <Section title="Toasts & modal" description="Feedback e sobreposições.">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => toast({ title: "Salvo com sucesso", variant: "success" })}
            >
              Sucesso
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                toast({ title: "Erro ao salvar", description: "Tente novamente.", variant: "error" })
              }
            >
              Erro
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => toast({ title: "Atenção", variant: "warning" })}
            >
              Aviso
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => toast({ title: "Informação", variant: "info" })}
            >
              Info
            </Button>

            <Modal>
              <ModalTrigger asChild>
                <Button size="sm">Abrir modal</Button>
              </ModalTrigger>
              <ModalContent
                title="Confirmar ação"
                description="Esta é uma janela modal de exemplo."
                footer={
                  <>
                    <ModalClose asChild>
                      <Button size="sm" variant="secondary">
                        Cancelar
                      </Button>
                    </ModalClose>
                    <ModalClose asChild>
                      <Button size="sm">Confirmar</Button>
                    </ModalClose>
                  </>
                }
              >
                Conteúdo do modal com foco preso e fechamento por Escape.
              </ModalContent>
            </Modal>
          </div>
        </Section>
      </FadeIn>
    </TooltipProvider>
  );
}
