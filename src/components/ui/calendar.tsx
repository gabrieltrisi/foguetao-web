"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import { ptBR } from "date-fns/locale";
import "react-day-picker/style.css";
import { cn } from "@/lib/utils";

/** Calendário base (react-day-picker) com as cores da marca Foguetão. */
export function Calendar({
  className,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <div
      style={
        {
          "--rdp-accent-color": "var(--color-brand)",
          "--rdp-accent-background-color": "var(--color-brand-soft)",
          "--rdp-today-color": "var(--color-brand)",
          "--rdp-day-width": "38px",
          "--rdp-day-height": "38px",
        } as React.CSSProperties
      }
    >
      <DayPicker
        locale={ptBR}
        showOutsideDays
        weekStartsOn={0}
        className={cn("text-body2 text-ink [&_.rdp-day_button]:rounded-md", className)}
        {...props}
      />
    </div>
  );
}
