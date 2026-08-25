"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pill } from "@/components/ui/pill";
import { SearchInput } from "@/components/ui/search-input";
import { FilterBar } from "@/components/ui/filter-bar";
import { DynamicIcon } from "@/components/automations/node-icon";
import { useToast } from "@/components/ui/toast";
import { automationTemplates, templateCategories } from "@/mocks/automations/templates";
import type { AutomationTemplate } from "@/types/automations";

export function TemplatesView() {
  const { toast } = useToast();
  const router = useRouter();
  const [category, setCategory] = React.useState<string>("Todos");
  const [query, setQuery] = React.useState("");

  const filtered = automationTemplates.filter((t) => {
    const mc = category === "Todos" || t.category === category;
    const q = query.trim().toLowerCase();
    return mc && (!q || `${t.name} ${t.description}`.toLowerCase().includes(q));
  });

  const use = (t: AutomationTemplate) => {
    toast({ title: `Template "${t.name}" aplicado (mock)`, variant: "success" });
    router.push("/automations/new");
  };

  return (
    <div className="flex flex-col gap-4">
      <FilterBar>
        <SearchInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar templates…" containerClassName="w-full max-w-xs" />
      </FilterBar>

      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        {templateCategories.map((c) => (
          <Pill key={c} active={category === c} onClick={() => setCategory(c)}>{c}</Pill>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((t) => {
          return (
            <Card key={t.id} className="flex flex-col gap-3 p-5">
              <div className="flex items-start justify-between gap-2">
                <span className="flex size-11 items-center justify-center rounded-xl bg-brand-soft text-brand"><DynamicIcon name={t.icon} className="size-5" /></span>
                {t.popular ? <span className="inline-flex items-center gap-1 text-caption font-medium text-warning"><Star className="size-3.5 fill-current" aria-hidden />Popular</span> : null}
              </div>
              <div>
                <p className="font-display text-h3 font-semibold text-ink">{t.name}</p>
                <Badge tone="neutral" size="sm" className="mt-1 normal-case">{t.category}</Badge>
              </div>
              <p className="min-h-[2.5rem] text-body2 text-ink-2">{t.description}</p>
              <div className="flex items-center justify-between border-t border-line pt-3">
                <span className={cn("text-caption text-ink-3")}>{t.nodeCount} nós</span>
                <Button size="sm" onClick={() => use(t)}>Usar template</Button>
              </div>
            </Card>
          );
        })}
        {filtered.length === 0 ? <p className="col-span-full py-10 text-center text-body2 text-ink-3">Nenhum template encontrado.</p> : null}
      </div>
    </div>
  );
}
