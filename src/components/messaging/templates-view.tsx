"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pill } from "@/components/ui/pill";
import { SearchInput } from "@/components/ui/search-input";
import { FilterBar } from "@/components/ui/filter-bar";
import { Modal, ModalClose, ModalContent, ModalTrigger } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { templateCategories, templates } from "@/mocks/messaging/templates";
import type { Template } from "@/types/messaging";
import { PreviewBanner } from "@/components/messaging/preview-banner";

export function TemplatesView() {
  const { toast } = useToast();
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState("Todos");
  const [onlyFav, setOnlyFav] = React.useState(false);
  const [favs, setFavs] = React.useState<Record<string, boolean>>(
    Object.fromEntries(templates.map((t) => [t.id, t.favorite])),
  );

  const filtered = templates.filter((t) => {
    const matchCat = category === "Todos" || t.category === category;
    const matchFav = !onlyFav || favs[t.id];
    const q = query.trim().toLowerCase();
    return matchCat && matchFav && (!q || `${t.title} ${t.body}`.toLowerCase().includes(q));
  });

  return (
    <div className="flex flex-col gap-4">
      <PreviewBanner feature="Templates de mensagem" />
      <FilterBar>
        <SearchInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar templates…" containerClassName="w-full max-w-xs" />
        <Pill active={onlyFav} onClick={() => setOnlyFav((v) => !v)} className="ml-auto">
          <Star className={cn("mr-1 size-3.5", onlyFav && "fill-current")} aria-hidden />
          Favoritos
        </Pill>
      </FilterBar>

      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        {templateCategories.map((c) => (
          <Pill key={c} active={category === c} onClick={() => setCategory(c)}>
            {c}
          </Pill>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((t) => (
          <TemplateCard
            key={t.id}
            template={t}
            favorite={favs[t.id]}
            onToggleFav={() => setFavs((p) => ({ ...p, [t.id]: !p[t.id] }))}
            onUse={() => toast({ title: `Template "${t.title}" aplicado (mock)`, variant: "success" })}
          />
        ))}
        {filtered.length === 0 ? (
          <p className="col-span-full py-10 text-center text-body2 text-ink-3">Nenhum template encontrado.</p>
        ) : null}
      </div>
    </div>
  );
}

function TemplateCard({
  template: t,
  favorite,
  onToggleFav,
  onUse,
}: {
  template: Template;
  favorite: boolean;
  onToggleFav: () => void;
  onUse: () => void;
}) {
  return (
    <Card className="flex flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-display text-h3 font-semibold text-ink">{t.title}</p>
          <Badge tone="neutral" size="sm" className="mt-1 normal-case">{t.category}</Badge>
        </div>
        <button
          type="button"
          onClick={onToggleFav}
          aria-label={favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          aria-pressed={favorite}
          className={cn("flex size-8 items-center justify-center rounded-md transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand", favorite ? "text-warning" : "text-ink-3")}
        >
          <Star className={cn("size-4", favorite && "fill-current")} aria-hidden />
        </button>
      </div>
      <p className="line-clamp-3 min-h-[3.75rem] text-body2 text-ink-2">{t.body}</p>
      <div className="flex items-center gap-2 border-t border-line pt-3">
        <Modal>
          <ModalTrigger asChild>
            <Button variant="secondary" size="sm">Preview</Button>
          </ModalTrigger>
          <ModalContent
            title={t.title}
            description={t.category}
            footer={
              <ModalClose asChild>
                <Button size="sm" onClick={onUse}>Usar template</Button>
              </ModalClose>
            }
          >
            <p className="whitespace-pre-wrap rounded-lg border border-line bg-surface p-3 text-body2 text-ink">
              {t.body}
            </p>
          </ModalContent>
        </Modal>
        <Button size="sm" className="ml-auto" onClick={onUse}>Usar</Button>
      </div>
    </Card>
  );
}
