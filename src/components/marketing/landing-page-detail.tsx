"use client";

import { Copy, ExternalLink, Pencil, Rocket } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KPIBlock, StatList } from "@/components/business/kpi-block";
import { StatusBadge } from "@/components/business/badges";
import { DetailPageLayout } from "@/components/patterns/page-patterns";
import { useToast } from "@/components/ui/toast";
import { formatNumber } from "@/lib/format";
import { landingStatusLabel, landingStatusTone } from "@/mocks/marketing/landing-pages";
import type { LandingPage } from "@/types/marketing";

export function LandingPageDetail({ page }: { page: LandingPage }) {
  const { toast } = useToast();

  const aside = (
    <div className="flex flex-col gap-4">
      <Card className="p-5">
        <KPIBlock label="Conversão" value={`${page.conversion}%`} delta="+1,2 pp" trend="up" />
        <div className="mt-4"><StatusBadge tone={landingStatusTone[page.status]}>{landingStatusLabel[page.status]}</StatusBadge></div>
      </Card>
      <Card className="p-4">
        <p className="mb-3 text-caption font-semibold uppercase tracking-wide text-ink-3">Detalhes</p>
        <StatList
          items={[
            { label: "URL", value: `/${page.slug}` },
            { label: "Visualizações", value: formatNumber(page.views) },
            { label: "Leads", value: formatNumber(page.leads) },
            { label: "Atualizada", value: page.updatedAt },
          ]}
        />
      </Card>
    </div>
  );

  return (
    <DetailPageLayout
      title={page.name}
      subtitle={`/${page.slug}`}
      back={{ href: "/landing-pages", label: "Landing Pages" }}
      actions={
        <>
          <Button size="sm" variant="secondary" onClick={() => toast({ title: "Página duplicada (mock)", variant: "success" })}>
            <Copy />
            Duplicar
          </Button>
          <Button size="sm" variant="secondary">
            <Pencil />
            Editar
          </Button>
          <Button size="sm" onClick={() => toast({ title: "Página publicada (mock)", variant: "success" })}>
            <Rocket />
            Publicar
          </Button>
        </>
      }
      aside={aside}
    >
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4"><KPIBlock label="Views" value={formatNumber(page.views)} /></Card>
          <Card className="p-4"><KPIBlock label="Leads" value={formatNumber(page.leads)} /></Card>
          <Card className="p-4"><KPIBlock label="Conversão" value={`${page.conversion}%`} /></Card>
        </div>

        {/* Preview visual mock */}
        <Card className="overflow-hidden p-0">
          <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
            <p className="font-display text-h3 font-semibold text-ink">Preview</p>
            <Button variant="ghost" size="sm" onClick={() => toast({ title: "Abrindo em nova aba (mock)" })}>
              <ExternalLink />
              Abrir
            </Button>
          </div>
          <div className="p-6" style={{ backgroundColor: `${page.accent}0d` }}>
            <div className="mx-auto max-w-md overflow-hidden rounded-xl border border-line bg-white shadow-sm">
              <div className="h-2" style={{ backgroundColor: page.accent }} />
              <div className="flex flex-col items-center gap-3 p-6 text-center">
                <span className="rounded-full px-2.5 py-0.5 text-caption font-medium text-white" style={{ backgroundColor: page.accent }}>Foguetão</span>
                <div className="h-4 w-3/4 rounded bg-ink/80" />
                <div className="h-2.5 w-full rounded bg-line" />
                <div className="h-2.5 w-5/6 rounded bg-line" />
                <div className="mt-2 h-9 w-40 rounded-lg text-white" style={{ backgroundColor: page.accent }} />
                <div className="mt-2 grid w-full grid-cols-3 gap-2">
                  {[0, 1, 2].map((i) => <div key={i} className="h-12 rounded-lg bg-surface" />)}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DetailPageLayout>
  );
}
