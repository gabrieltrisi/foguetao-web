"use client";

import * as React from "react";
import { CalendarClock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Combobox } from "@/components/ui/combobox";
import { NumberInput } from "@/components/ui/number-input";
import { DatePicker } from "@/components/ui/date-picker";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { frequencyOptions, timezones } from "@/mocks/automations/schedules";
import type { ScheduleFrequency } from "@/types/automations";

const WEEKDAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"].map((d) => ({ value: d, label: d }));

export function ScheduleBuilder() {
  const [freq, setFreq] = React.useState<ScheduleFrequency>("weekly");
  const [time, setTime] = React.useState("09:00");
  const [weekday, setWeekday] = React.useState("Segunda");
  const [day, setDay] = React.useState(1);
  const [interval, setInterval] = React.useState(15);
  const [tz, setTz] = React.useState("America/Sao_Paulo");
  const [date, setDate] = React.useState<Date | undefined>();

  const preview = (() => {
    switch (freq) {
      case "daily": return `Todo dia às ${time}`;
      case "weekly": return `Toda ${weekday.toLowerCase()} às ${time}`;
      case "monthly": return `Todo dia ${day} às ${time}`;
      case "interval": return `A cada ${interval} minutos`;
      case "date": return date ? `Uma vez em ${date.toLocaleDateString("pt-BR")} às ${time}` : `Selecione uma data`;
    }
  })();

  const tzOptions = timezones.map((t) => ({ value: t, label: t }));

  return (
    <Card className="p-5">
      <div className="flex flex-col gap-5">
        <FormField id="sch-freq" label="Frequência">
          {() => (
            <SegmentedControl
              options={frequencyOptions}
              value={freq}
              onValueChange={(v) => setFreq(v as ScheduleFrequency)}
              ariaLabel="Frequência"
            />
          )}
        </FormField>

        <div className="grid gap-5 sm:grid-cols-2">
          {freq !== "interval" ? (
            <FormField id="sch-time" label="Horário">
              {(p) => <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} {...p} />}
            </FormField>
          ) : null}
          {freq === "weekly" ? (
            <FormField id="sch-weekday" label="Dia da semana">
              {(p) => <Combobox id={p.id} options={WEEKDAYS} value={weekday} onValueChange={setWeekday} />}
            </FormField>
          ) : null}
          {freq === "monthly" ? (
            <FormField id="sch-day" label="Dia do mês">
              {() => <NumberInput value={day} onValueChange={setDay} min={1} max={28} />}
            </FormField>
          ) : null}
          {freq === "interval" ? (
            <FormField id="sch-interval" label="Intervalo (minutos)">
              {() => <NumberInput value={interval} onValueChange={setInterval} min={1} max={1440} step={5} />}
            </FormField>
          ) : null}
          {freq === "date" ? (
            <FormField id="sch-date" label="Data">
              {(p) => <DatePicker id={p.id} value={date} onValueChange={setDate} />}
            </FormField>
          ) : null}
          <FormField id="sch-tz" label="Fuso horário">
            {(p) => <Combobox id={p.id} options={tzOptions} value={tz} onValueChange={setTz} />}
          </FormField>
        </div>

        <div className="flex items-center gap-3 rounded-lg border border-brand/20 bg-brand-soft/40 p-4">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand text-white"><CalendarClock className="size-4" aria-hidden /></span>
          <div>
            <p className="text-caption font-semibold uppercase tracking-wide text-ink-3">Próxima execução</p>
            <p className="text-body2 font-medium text-ink">{preview} · {tz}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
