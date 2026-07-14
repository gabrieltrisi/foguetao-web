"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Combobox } from "@/components/ui/combobox";
import { FilterBar } from "@/components/ui/filter-bar";
import { ActivityItem } from "@/components/business/timeline";
import { activityEntries, activityModuleLabel } from "@/mocks/analytics/activity-log";
import type { ActivityModule } from "@/types/analytics";

const OWNERS = ["Todos", "Camila Ribeiro", "Rafael Monteiro", "Bruno Alcântara", "Larissa Prado", "Sistema", "Você"];

export function ActivityLogView() {
  const [module, setModule] = React.useState("todos");
  const [owner, setOwner] = React.useState("Todos");

  const moduleOptions = [{ value: "todos", label: "Todos os módulos" }, ...(Object.keys(activityModuleLabel) as ActivityModule[]).map((m) => ({ value: m, label: activityModuleLabel[m] }))];
  const ownerOptions = OWNERS.map((o) => ({ value: o, label: o === "Todos" ? "Todos os usuários" : o }));

  const filtered = activityEntries.filter((e) => (module === "todos" || e.module === module) && (owner === "Todos" || e.actor === owner));

  return (
    <div className="flex flex-col gap-4">
      <FilterBar>
        <div className="w-48"><Combobox options={moduleOptions} value={module} onValueChange={setModule} /></div>
        <div className="w-48"><Combobox options={ownerOptions} value={owner} onValueChange={setOwner} /></div>
      </FilterBar>

      <Card className="p-5">
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-body2 text-ink-3">Nenhuma atividade no filtro.</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {filtered.map((e) => (
              <li key={e.id} className="flex items-start gap-3">
                <Badge tone="neutral" size="sm" className="mt-1 shrink-0 normal-case">{activityModuleLabel[e.module]}</Badge>
                <ActivityItem actorName={e.actor} text={e.text} time={e.time} />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
