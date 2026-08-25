import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/format";
import {
  TableContainer,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { cohortMonthLabels, retentionColor } from "@/mocks/analytics/cohorts";
import type { Cohort } from "@/types/analytics";

/** Heatmap de retenção por safra (linhas) × período (colunas). */
export function CohortTable({ cohorts }: { cohorts: Cohort[] }) {
  const cols = cohortMonthLabels.length;
  return (
    <TableContainer>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Safra</TableHead>
            <TableHead className="text-right">Tamanho</TableHead>
            {cohortMonthLabels.map((m) => (
              <TableHead key={m} className="text-center">{m}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {cohorts.map((c) => (
            <TableRow key={c.id} className="hover:bg-transparent">
              <TableCell className="font-medium">{c.period}</TableCell>
              <TableCell className="text-right tabular-nums text-ink-2">{formatNumber(c.size)}</TableCell>
              {Array.from({ length: cols }).map((_, i) => {
                const v = c.retention[i];
                return (
                  <TableCell key={i} className="p-1 text-center">
                    {v !== undefined ? (
                      <span className={cn("inline-flex h-8 w-full min-w-12 items-center justify-center rounded-md text-caption font-semibold tabular-nums", retentionColor(v))}>
                        {v}%
                      </span>
                    ) : (
                      <span className="inline-flex h-8 w-full min-w-12 items-center justify-center text-ink-3">—</span>
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
