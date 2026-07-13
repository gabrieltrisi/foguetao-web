"use client";

import { CircleCheck, Globe, Radar, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TableContainer,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { ChannelBadge } from "@/components/marketing/badges";
import { formatNumber } from "@/lib/format";
import { pixels, trackingDomains, trackingEvents } from "@/mocks/marketing/tracking";
import type { Pixel } from "@/types/marketing";

const pixelStatus: Record<Pixel["status"], { label: string; tone: "success" | "neutral" | "danger" }> = {
  active: { label: "Ativo", tone: "success" },
  inactive: { label: "Inativo", tone: "neutral" },
  error: { label: "Erro", tone: "danger" },
};

export function TrackingView() {
  return (
    <div className="flex flex-col gap-5">
      {/* Pixels */}
      <div>
        <p className="mb-3 font-display text-h3 font-semibold text-ink">Pixels & tags</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pixels.map((p) => (
            <Card key={p.id} className="flex flex-col gap-3 p-4">
              <div className="flex items-center justify-between">
                <span className="flex size-9 items-center justify-center rounded-lg bg-brand-soft text-brand"><Radar className="size-4" aria-hidden /></span>
                <Badge tone={pixelStatus[p.status].tone} size="md">{pixelStatus[p.status].label}</Badge>
              </div>
              <div>
                <p className="font-medium text-ink">{p.name}</p>
                <ChannelBadge channel={p.platform} className="text-caption" />
              </div>
              <p className="text-caption text-ink-3"><span className="font-semibold text-ink">{formatNumber(p.events)}</span> eventos</p>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Eventos recentes */}
        <div className="lg:col-span-2">
          <p className="mb-3 flex items-center gap-2 font-display text-h3 font-semibold text-ink"><Zap className="size-4 text-brand" aria-hidden /> Últimos eventos</p>
          <TableContainer>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Evento</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead className="text-right">Disparos</TableHead>
                  <TableHead className="text-right">Último</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trackingEvents.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell><span className="inline-flex items-center gap-1.5 font-medium"><span className="size-1.5 rounded-full bg-success" aria-hidden />{e.name}</span></TableCell>
                    <TableCell className="text-ink-2">{e.source}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatNumber(e.count)}</TableCell>
                    <TableCell className="text-right text-ink-3">{e.lastFired}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>

        {/* Domínios */}
        <div>
          <p className="mb-3 flex items-center gap-2 font-display text-h3 font-semibold text-ink"><Globe className="size-4 text-ink-2" aria-hidden /> Domínios</p>
          <Card className="divide-y divide-line">
            {trackingDomains.map((d) => (
              <div key={d.id} className="flex items-center justify-between gap-2 p-4">
                <span className="truncate text-body2 font-medium text-ink">{d.domain}</span>
                <span className={cn("inline-flex items-center gap-1 text-caption font-medium", d.status === "verified" ? "text-success" : "text-warning")}>
                  {d.status === "verified" ? <CircleCheck className="size-3.5" aria-hidden /> : null}
                  {d.status === "verified" ? "Verificado" : "Pendente"}
                </span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
