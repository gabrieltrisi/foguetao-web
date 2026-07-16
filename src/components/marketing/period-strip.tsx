"use client";

import * as React from "react";
import { PeriodFilter } from "@/components/ui/period-filter";
import { periodOptions } from "@/lib/period";
import type { PeriodValue } from "@/types";

/** Filtro de período reutilizável para páginas de performance. */
export function PeriodFilterStrip({ className }: { className?: string }) {
  const [period, setPeriod] = React.useState<PeriodValue>("30d");
  return (
    <div className={className}>
      <PeriodFilter options={periodOptions} value={period} onValueChange={setPeriod} className="w-fit" />
    </div>
  );
}
