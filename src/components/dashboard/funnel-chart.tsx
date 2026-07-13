import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { formatCurrency, formatNumber } from "@/lib/format";
import { funnelStages } from "@/mocks/dashboard";

export function FunnelChart() {
  const maxCount = Math.max(...funnelStages.map((stage) => stage.count));

  return (
    <Card className="flex flex-col p-5">
      <SectionHeader
        title="Funil de vendas"
        description="Distribuição por etapa nos últimos 7 dias."
        action={
          <Link
            href="/pipeline"
            className="inline-flex items-center gap-0.5 rounded-md text-body2 font-medium text-brand transition-colors hover:text-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            Ver pipeline
            <ChevronRight className="size-4" aria-hidden />
          </Link>
        }
      />

      <ul className="mt-5 flex flex-col gap-3">
        {funnelStages.map((stage) => {
          const width = Math.round((stage.count / maxCount) * 100);
          return (
            <li key={stage.id} className="flex items-center gap-3">
              <span className="w-28 shrink-0 truncate text-body2 text-ink-2 sm:w-32">
                {stage.label}
              </span>
              <span className="h-3 flex-1 overflow-hidden rounded-full bg-surface" aria-hidden>
                <span
                  className="block h-full rounded-full bg-brand"
                  style={{ width: `${width}%` }}
                />
              </span>
              <span className="w-32 shrink-0 text-right text-small tabular-nums text-ink-2 sm:w-40">
                <span className="font-semibold text-ink">{formatNumber(stage.count)}</span>
                <span className="text-ink-3"> · {formatCurrency(stage.amount)}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
