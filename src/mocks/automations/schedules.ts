import type { ScheduledAutomation, ScheduleFrequency } from "@/types/automations";

export const scheduledAutomations: ScheduledAutomation[] = [
  { id: "sch-1", name: "Reativação de lead frio", frequency: "weekly", frequencyLabel: "Toda segunda · 09:00", nextRun: "20 jul 2026 · 09:00", timezone: "America/Sao_Paulo", enabled: true },
  { id: "sch-2", name: "Relatório semanal", frequency: "weekly", frequencyLabel: "Toda sexta · 18:00", nextRun: "17 jul 2026 · 18:00", timezone: "America/Sao_Paulo", enabled: true },
  { id: "sch-3", name: "Cobrança mensal", frequency: "monthly", frequencyLabel: "Dia 1 · 08:00", nextRun: "01 ago 2026 · 08:00", timezone: "America/Sao_Paulo", enabled: false },
  { id: "sch-4", name: "Sincronização de dados", frequency: "interval", frequencyLabel: "A cada 15 min", nextRun: "13 jul 2026 · 10:45", timezone: "UTC", enabled: true },
  { id: "sch-5", name: "Backup diário", frequency: "daily", frequencyLabel: "Todo dia · 03:00", nextRun: "14 jul 2026 · 03:00", timezone: "America/Sao_Paulo", enabled: true },
];

export const frequencyOptions: { value: ScheduleFrequency; label: string }[] = [
  { value: "daily", label: "Todo dia" },
  { value: "weekly", label: "Toda semana" },
  { value: "monthly", label: "Todo mês" },
  { value: "date", label: "Data específica" },
  { value: "interval", label: "A cada X minutos" },
];

export const timezones = ["America/Sao_Paulo", "America/New_York", "Europe/Lisbon", "UTC"];
