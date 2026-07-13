"use client";

import * as React from "react";
import Link from "next/link";
import { Globe, MapPin, Pencil, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EntityAvatar } from "@/components/business/entity-avatar";
import { StatusBadge } from "@/components/business/badges";
import { KPIBlock, StatList } from "@/components/business/kpi-block";
import { Timeline } from "@/components/business/timeline";
import { AssigneeSelector } from "@/components/business/assignee-selector";
import { DetailPageLayout, DashboardSection } from "@/components/patterns/page-patterns";
import { formatCurrency, formatNumber } from "@/lib/format";
import { orgStatusLabel, orgStatusTone } from "@/mocks/crm/organizations";
import { contacts } from "@/mocks/crm/contacts";
import { deals } from "@/mocks/crm/deals";
import { contactTimeline } from "@/mocks/crm/timeline";
import type { Organization } from "@/types/crm";

const PEOPLE = [
  { id: "cr", name: "Camila Ribeiro" },
  { id: "rm", name: "Rafael Monteiro" },
  { id: "ba", name: "Bruno Alcântara" },
  { id: "lp", name: "Larissa Prado" },
];

export function OrganizationDetail({ organization: o }: { organization: Organization }) {
  const [owner, setOwner] = React.useState(PEOPLE.find((p) => p.name === o.owner)?.id ?? "cr");
  const orgContacts = contacts.filter((c) => c.organizationId === o.id);
  const orgDeals = deals.filter((d) => d.organizationName === o.name);

  const aside = (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col items-center gap-3 p-5 text-center">
        <EntityAvatar name={o.name} type="company" size="lg" className="size-16" />
        <div>
          <p className="font-display text-h3 font-semibold text-ink">{o.name}</p>
          <p className="text-caption text-ink-3">{o.segment}</p>
        </div>
        <StatusBadge tone={orgStatusTone[o.status]}>{orgStatusLabel[o.status]}</StatusBadge>
      </Card>
      <Card className="grid grid-cols-3 gap-2 p-4 text-center">
        <KPIBlock label="Contatos" value={formatNumber(o.contactsCount)} className="items-center" />
        <KPIBlock label="Deals" value={formatNumber(o.dealsCount)} className="items-center" />
        <KPIBlock label="Receita" value={`${(o.revenue / 1000).toFixed(0)}k`} className="items-center" />
      </Card>
      <Card className="p-4">
        <p className="mb-2 text-caption font-semibold uppercase tracking-wide text-ink-3">Responsável</p>
        <AssigneeSelector people={PEOPLE} value={owner} onValueChange={setOwner} />
      </Card>
      <Card className="p-4">
        <p className="mb-3 text-caption font-semibold uppercase tracking-wide text-ink-3">Informações</p>
        <StatList
          items={[
            { label: "Site", value: <span className="inline-flex items-center gap-1"><Globe className="size-3.5 text-ink-3" aria-hidden />{o.website}</span> },
            { label: "Local", value: <span className="inline-flex items-center gap-1"><MapPin className="size-3.5 text-ink-3" aria-hidden />{o.location}</span> },
            { label: "Segmento", value: o.segment },
            { label: "Receita", value: formatCurrency(o.revenue) },
          ]}
        />
      </Card>
    </div>
  );

  return (
    <DetailPageLayout
      title={o.name}
      subtitle={`${o.segment} · ${o.location}`}
      back={{ href: "/organizations", label: "Organizações" }}
      actions={
        <>
          <Button size="sm" variant="secondary">
            <Pencil />
            Editar
          </Button>
          <Button size="sm">
            <Target />
            Nova oportunidade
          </Button>
        </>
      }
      aside={aside}
    >
      <Tabs defaultValue="resumo">
        <TabsList className="overflow-x-auto">
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="contatos">Contatos</TabsTrigger>
          <TabsTrigger value="deals">Deals</TabsTrigger>
        </TabsList>

        <TabsContent value="resumo">
          <DashboardSection title="Histórico">
            <Card className="p-5">
              <Timeline items={contactTimeline} />
            </Card>
          </DashboardSection>
        </TabsContent>

        <TabsContent value="contatos">
          <Card className="divide-y divide-line">
            {orgContacts.length === 0 ? (
              <p className="p-5 text-body2 text-ink-3">Nenhum contato vinculado.</p>
            ) : (
              orgContacts.map((c) => (
                <Link key={c.id} href={`/contacts/${c.id}`} className="flex items-center gap-3 p-4 transition-colors hover:bg-surface">
                  <EntityAvatar name={c.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-ink">{c.name}</p>
                    <p className="truncate text-caption text-ink-3">{c.role}</p>
                  </div>
                  <Badge tone="neutral" className="normal-case">{c.email}</Badge>
                </Link>
              ))
            )}
          </Card>
        </TabsContent>

        <TabsContent value="deals">
          <Card className="divide-y divide-line">
            {orgDeals.length === 0 ? (
              <p className="p-5 text-body2 text-ink-3">Nenhuma oportunidade vinculada.</p>
            ) : (
              orgDeals.map((d) => (
                <Link key={d.id} href={`/deals/${d.id}`} className="flex items-center justify-between gap-3 p-4 transition-colors hover:bg-surface">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">{d.title}</p>
                    <p className="text-caption text-ink-3">{d.probability}% · {d.owner}</p>
                  </div>
                  <span className="shrink-0 font-display font-semibold text-ink">{formatCurrency(d.value)}</span>
                </Link>
              ))
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </DetailPageLayout>
  );
}
