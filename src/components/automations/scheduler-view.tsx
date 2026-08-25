"use client";

import * as React from "react";
import { CalendarClock, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ScheduleBuilder } from "@/components/automations/schedule-builder";
import { useToast } from "@/components/ui/toast";
import { scheduledAutomations } from "@/mocks/automations/schedules";

export function SchedulerView() {
  const { toast } = useToast();
  const [enabled, setEnabled] = React.useState<Record<string, boolean>>(
    Object.fromEntries(scheduledAutomations.map((s) => [s.id, s.enabled])),
  );

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <div>
        <p className="mb-3 font-display text-h3 font-semibold text-ink">Nova recorrência</p>
        <ScheduleBuilder />
      </div>

      <div>
        <p className="mb-3 font-display text-h3 font-semibold text-ink">Agendamentos ativos</p>
        <Card className="divide-y divide-line">
          {scheduledAutomations.map((s) => (
            <div key={s.id} className="flex items-center gap-3 p-4">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand"><CalendarClock className="size-4" aria-hidden /></span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-ink">{s.name}</p>
                <p className="truncate text-caption text-ink-3">{s.frequencyLabel} · {s.timezone}</p>
                <p className="mt-0.5 inline-flex items-center gap-1 text-caption text-ink-2"><Clock className="size-3 text-ink-3" aria-hidden />Próxima: {s.nextRun}</p>
              </div>
              <Switch
                checked={enabled[s.id]}
                onCheckedChange={(v) => { setEnabled((p) => ({ ...p, [s.id]: v })); toast({ title: v ? "Agendamento ativado (mock)" : "Agendamento pausado (mock)", variant: v ? "success" : "warning" }); }}
                aria-label={`Ativar ${s.name}`}
              />
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
