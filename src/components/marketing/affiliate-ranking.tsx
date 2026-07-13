import Link from "next/link";
import { cn } from "@/lib/utils";
import { EntityAvatar } from "@/components/business/entity-avatar";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";
import type { Affiliate } from "@/types/marketing";

const medal = ["text-warning", "text-ink-3", "text-brand-dark"];

/** Ranking de afiliados por receita. */
export function AffiliateRanking({ affiliates }: { affiliates: Affiliate[] }) {
  const top = affiliates.slice(0, 5);
  const max = Math.max(...top.map((a) => a.revenue), 1);

  return (
    <ol className="flex flex-col divide-y divide-line">
      {top.map((a, i) => (
        <li key={a.id}>
          <Link href={`/affiliates/${a.id}`} className="flex items-center gap-3 py-3 transition-colors first:pt-0 hover:bg-surface">
            <span className={cn("w-5 shrink-0 text-center font-display text-h3 font-bold", i < 3 ? medal[i] : "text-ink-3")}>
              {i + 1}
            </span>
            <EntityAvatar name={a.name} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate font-medium text-ink">{a.name}</p>
                <Badge tone="neutral" size="sm" className="normal-case">{a.tier}</Badge>
              </div>
              <span className="mt-1 block h-1.5 w-full max-w-40 overflow-hidden rounded-full bg-surface" aria-hidden>
                <span className="block h-full rounded-full bg-brand" style={{ width: `${(a.revenue / max) * 100}%` }} />
              </span>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-display font-semibold text-ink">{formatCurrency(a.revenue)}</p>
              <p className="text-caption text-ink-3">{a.sales} vendas</p>
            </div>
          </Link>
        </li>
      ))}
    </ol>
  );
}
