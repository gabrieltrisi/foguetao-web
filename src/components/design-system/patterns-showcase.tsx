"use client";

import * as React from "react";
import { CheckCircle2, Filter, MessageCircle, Target, UserPlus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { KPIBlock, StatList } from "@/components/business/kpi-block";
import { Timeline, ActivityItem } from "@/components/business/timeline";
import { CommentItem, FileItem } from "@/components/business/items";
import { EntityAvatar } from "@/components/business/entity-avatar";
import { AssigneeSelector } from "@/components/business/assignee-selector";
import { ChannelBadge, IntegrationBadge, OwnerBadge } from "@/components/business/badges";
import {
  FilterBar,
  ActiveFilters,
  SavedViewSelector,
  type ActiveFilter,
} from "@/components/ui/filter-bar";
import { BulkActionBar } from "@/components/ui/data-table-parts";
import { SegmentedControl } from "@/components/ui/segmented-control";
import {
  DashboardSection,
  TwoColumnLayout,
  SplitPaneLayout,
  SettingsPageLayout,
} from "@/components/patterns/page-patterns";
import { formatCurrency } from "@/lib/format";
import { ShowcaseSection } from "@/components/design-system/showcase-ui";
import { ShowcaseNav } from "@/components/design-system/showcase-nav";

const PEOPLE = [
  { id: "cr", name: "Camila Ribeiro" },
  { id: "rm", name: "Rafael Monteiro" },
  { id: "ba", name: "Bruno Alcântara" },
];

export function PatternsShowcase() {
  const [assignee, setAssignee] = React.useState<string>("cr");
  const [filters, setFilters] = React.useState<ActiveFilter[]>([
    { id: "status", label: "Status", value: "Ativo" },
    { id: "owner", label: "Responsável", value: "Camila R." },
  ]);
  const [view, setView] = React.useState("todos");
  const [seg, setSeg] = React.useState("todos");

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Padrões & negócio" description="Layouts de página e componentes de negócio neutros." />
      <ShowcaseNav />

      <ShowcaseSection title="Badges & avatares de negócio">
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-3">
            <EntityAvatar name="Camila Ribeiro" />
            <EntityAvatar name="Grão Café" type="company" />
            <OwnerBadge name="Rafael Monteiro" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ChannelBadge channel="whatsapp" />
            <ChannelBadge channel="email" />
            <ChannelBadge channel="instagram" />
            <ChannelBadge channel="phone" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <IntegrationBadge name="Meta Ads" status="connected" />
            <IntegrationBadge name="Google Ads" status="pending" />
            <IntegrationBadge name="WhatsApp" status="error" />
          </div>
          <div className="max-w-xs">
            <AssigneeSelector people={PEOPLE} value={assignee} onValueChange={setAssignee} />
          </div>
        </div>
      </ShowcaseSection>

      <ShowcaseSection title="KPIs, listas e histórico">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <KPIBlock label="Receita" value={formatCurrency(428760)} delta="+12,4%" trend="up" />
              <KPIBlock label="Ticket médio" value={formatCurrency(4280)} delta="+3,2%" trend="up" />
            </div>
            <StatList
              items={[
                { label: "Oportunidades", value: "384" },
                { label: "Conversão", value: "6,8%" },
                { label: "Ciclo médio", value: "18 dias" },
              ]}
            />
          </div>
          <Timeline
            className="lg:col-span-1"
            items={[
              { id: "1", icon: Target, title: "Oportunidade criada", time: "há 2 dias" },
              { id: "2", icon: MessageCircle, title: "Mensagem enviada", description: "WhatsApp · Camila R.", time: "ontem" },
              { id: "3", icon: CheckCircle2, title: "Proposta aprovada", time: "há 3 h" },
            ]}
          />
          <div className="flex flex-col gap-3">
            <ActivityItem actorName="Camila Ribeiro" text="**Camila** criou o contato **Núcleo Digital**" time="há 4 min" />
            <CommentItem author="Rafael Monteiro" time="há 1 h" body="Podemos fechar essa semana?" />
            <FileItem name="proposta-vertex.pdf" size="248 KB" onDownload={() => {}} />
          </div>
        </div>
      </ShowcaseSection>

      <ShowcaseSection title="Filtros e ações">
        <div className="flex flex-col gap-4">
          <FilterBar>
            <SavedViewSelector
              views={[
                { id: "todos", label: "Todos os contatos" },
                { id: "meus", label: "Meus contatos" },
                { id: "quentes", label: "Leads quentes" },
              ]}
              value={view}
              onValueChange={setView}
            />
            <Button variant="secondary" size="sm">
              <Filter />
              Filtros
            </Button>
            <SegmentedControl
              size="sm"
              options={[
                { value: "todos", label: "Todos" },
                { value: "ativos", label: "Ativos" },
              ]}
              value={seg}
              onValueChange={setSeg}
            />
          </FilterBar>
          <ActiveFilters
            filters={filters}
            onRemove={(id) => setFilters((f) => f.filter((x) => x.id !== id))}
            onClear={() => setFilters([])}
          />
          <BulkActionBar count={3} onClear={() => {}}>
            <Button size="sm" variant="secondary">
              <UserPlus />
              Atribuir
            </Button>
          </BulkActionBar>
        </div>
      </ShowcaseSection>

      <ShowcaseSection title="Layouts de página">
        <div className="flex flex-col gap-6">
          <div className="rounded-lg border border-line p-4">
            <p className="mb-3 text-caption font-semibold uppercase tracking-wide text-ink-3">
              DashboardSection
            </p>
            <DashboardSection
              title="Funil de vendas"
              description="Últimos 7 dias"
              action={
                <Button size="sm" variant="ghost">
                  Ver tudo
                </Button>
              }
            >
              <Card className="p-4 text-body2 text-ink-2">Conteúdo da seção.</Card>
            </DashboardSection>
          </div>

          <div className="rounded-lg border border-line p-4">
            <p className="mb-3 text-caption font-semibold uppercase tracking-wide text-ink-3">
              TwoColumnLayout
            </p>
            <TwoColumnLayout
              main={<Card className="p-4 text-body2 text-ink-2">Coluna principal</Card>}
              aside={<Card className="p-4 text-body2 text-ink-2">Lateral</Card>}
            />
          </div>

          <div className="rounded-lg border border-line p-4">
            <p className="mb-3 text-caption font-semibold uppercase tracking-wide text-ink-3">
              SplitPaneLayout
            </p>
            <SplitPaneLayout
              className="lg:h-56"
              list={
                <ul className="divide-y divide-line">
                  {["Larissa", "Vertex Farma", "Núcleo Digital"].map((n) => (
                    <li key={n} className="px-4 py-3 text-body2 text-ink hover:bg-surface">
                      {n}
                    </li>
                  ))}
                </ul>
              }
              detail={<div className="p-4 text-body2 text-ink-2">Selecione um item da lista.</div>}
            />
          </div>

          <div className="rounded-lg border border-line p-4">
            <p className="mb-3 text-caption font-semibold uppercase tracking-wide text-ink-3">
              SettingsPageLayout
            </p>
            <SettingsPageLayout
              title="Configurações"
              description="Preferências da conta."
              nav={[
                { label: "Perfil", href: "#", active: true },
                { label: "Equipe", href: "#" },
                { label: "Faturamento", href: "#" },
              ]}
            >
              <Card className="p-4 text-body2 text-ink-2">Conteúdo da seção selecionada.</Card>
            </SettingsPageLayout>
          </div>
        </div>
      </ShowcaseSection>
    </div>
  );
}
