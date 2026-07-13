"use client";

import * as React from "react";
import type { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

const triggerClass =
  "flex h-10 w-full items-center gap-2 rounded-lg border border-line bg-white px-3 text-body2 shadow-sm transition-colors hover:bg-surface focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/15 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[state=open]:border-brand";

export function DatePicker({
  value,
  onValueChange,
  placeholder = "Selecione uma data",
  disabled,
  id,
  className,
}: {
  value?: Date;
  onValueChange?: (date?: Date) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" id={id} disabled={disabled} className={cn(triggerClass, className)}>
          <CalendarIcon className="size-4 shrink-0 text-ink-3" aria-hidden />
          <span className={cn("truncate", value ? "text-ink" : "text-ink-3")}>
            {value ? format(value, "dd 'de' MMM 'de' yyyy", { locale: ptBR }) : placeholder}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(d) => {
            onValueChange?.(d);
            setOpen(false);
          }}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}

export function DateRangePicker({
  value,
  onValueChange,
  placeholder = "Selecione um período",
  disabled,
  id,
  className,
}: {
  value?: DateRange;
  onValueChange?: (range?: DateRange) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const label =
    value?.from && value?.to
      ? `${format(value.from, "dd/MM/yy", { locale: ptBR })} – ${format(value.to, "dd/MM/yy", { locale: ptBR })}`
      : value?.from
        ? format(value.from, "dd/MM/yy", { locale: ptBR })
        : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" id={id} disabled={disabled} className={cn(triggerClass, className)}>
          <CalendarIcon className="size-4 shrink-0 text-ink-3" aria-hidden />
          <span className={cn("truncate", label ? "text-ink" : "text-ink-3")}>
            {label ?? placeholder}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar mode="range" selected={value} onSelect={onValueChange} numberOfMonths={2} autoFocus />
      </PopoverContent>
    </Popover>
  );
}
