"use client";

import Link from "next/link";
import { Copy, Eye, MoreHorizontal, Pencil, Rocket } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/business/badges";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/toast";
import { formatNumber } from "@/lib/format";
import { landingStatusLabel, landingStatusTone } from "@/mocks/marketing/landing-pages";
import type { LandingPage } from "@/types/marketing";

export function LandingPageCard({ page }: { page: LandingPage }) {
  const { toast } = useToast();
  return (
    <Card className="flex flex-col overflow-hidden">
      {/* Preview mock */}
      <Link href={`/landing-pages/${page.id}`} className="block">
        <div className="relative h-32 overflow-hidden border-b border-line" style={{ backgroundColor: page.accent }}>
          <div className="absolute left-3 right-3 top-3 flex h-4 items-center gap-1 rounded bg-white/25 px-1.5">
            <span className="size-1.5 rounded-full bg-white/70" />
            <span className="size-1.5 rounded-full bg-white/70" />
            <span className="size-1.5 rounded-full bg-white/70" />
          </div>
          <div className="absolute inset-x-6 top-9 space-y-1.5">
            <div className="h-2.5 w-2/3 rounded bg-white/80" />
            <div className="h-1.5 w-1/2 rounded bg-white/50" />
            <div className="mt-2 h-4 w-20 rounded bg-white" />
          </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link href={`/landing-pages/${page.id}`} className="block truncate font-display text-h3 font-semibold text-ink hover:text-brand">
              {page.name}
            </Link>
            <p className="truncate text-caption text-ink-3">/{page.slug}</p>
          </div>
          <StatusBadge tone={landingStatusTone[page.status]}>{landingStatusLabel[page.status]}</StatusBadge>
        </div>

        <div className="grid grid-cols-3 gap-2 border-y border-line py-2.5 text-center">
          <div>
            <p className="font-display text-body font-bold text-ink">{formatNumber(page.views)}</p>
            <p className="text-caption text-ink-3">Views</p>
          </div>
          <div>
            <p className="font-display text-body font-bold text-ink">{formatNumber(page.leads)}</p>
            <p className="text-caption text-ink-3">Leads</p>
          </div>
          <div>
            <p className="font-display text-body font-bold text-ink">{page.conversion}%</p>
            <p className="text-caption text-ink-3">Conv.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => toast({ title: "Abrindo editor (mock)" })}>
            <Pencil />
            Editar
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Mais ações" className="ml-auto">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => toast({ title: "Preview aberto (mock)" })}>
                <Eye aria-hidden />
                Visualizar
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => toast({ title: "Página duplicada (mock)", variant: "success" })}>
                <Copy aria-hidden />
                Duplicar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => toast({ title: "Página publicada (mock)", variant: "success" })}>
                <Rocket aria-hidden />
                Publicar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );
}
