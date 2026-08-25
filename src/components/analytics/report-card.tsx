"use client";

import Link from "next/link";
import { CalendarClock, Copy, Download, MoreHorizontal, Share2, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ReportStatusBadge } from "@/components/analytics/badges";
import { OwnerBadge } from "@/components/business/badges";
import { useToast } from "@/components/ui/toast";
import { formatNumber } from "@/lib/format";
import type { Report } from "@/types/analytics";

export function ReportCard({
  report: r,
  favorite,
  onToggleFav,
}: {
  report: Report;
  favorite: boolean;
  onToggleFav: () => void;
}) {
  const { toast } = useToast();
  return (
    <Card className="flex flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link href={`/reports/${r.id}`} className="block truncate font-display text-h3 font-semibold text-ink hover:text-brand">{r.name}</Link>
          <Badge tone="neutral" size="sm" className="mt-1 normal-case">{r.category}</Badge>
        </div>
        <button type="button" onClick={onToggleFav} aria-label={favorite ? "Remover dos favoritos" : "Favoritar"} aria-pressed={favorite} className={cn("flex size-8 items-center justify-center rounded-md transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand", favorite ? "text-warning" : "text-ink-3")}>
          <Star className={cn("size-4", favorite && "fill-current")} aria-hidden />
        </button>
      </div>
      <p className="min-h-[2.5rem] text-body2 text-ink-2">{r.description}</p>
      <div className="flex flex-wrap items-center gap-1.5">
        <ReportStatusBadge status={r.status} />
        {r.shared ? <Badge tone="info" size="sm"><Share2 className="size-3" aria-hidden />Compartilhado</Badge> : null}
        {r.scheduled ? <Badge tone="brand" size="sm"><CalendarClock className="size-3" aria-hidden />Agendado</Badge> : null}
      </div>
      <div className="flex items-center justify-between border-t border-line pt-3">
        <OwnerBadge name={r.owner} />
        <span className="text-caption text-ink-3">{formatNumber(r.views)} views</span>
      </div>
      <div className="flex items-center gap-2">
        <Button asChild variant="secondary" size="sm"><Link href={`/reports/${r.id}`}>Abrir</Link></Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Mais ações" className="ml-auto"><MoreHorizontal /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => toast({ title: "Relatório duplicado (mock)", variant: "success" })}><Copy aria-hidden />Duplicar</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => toast({ title: "Exportação iniciada (mock)", variant: "success" })}><Download aria-hidden />Exportar</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => toast({ title: "Link de compartilhamento copiado (mock)" })}><Share2 aria-hidden />Compartilhar</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => toast({ title: "Envio agendado (mock)", variant: "success" })}><CalendarClock aria-hidden />Agendar envio</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}
