import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ListSkeleton } from "@/components/ui/list-skeleton";

/** Skeleton de um metric card. */
export function MetricCardSkeleton() {
  return (
    <Card className="p-5" aria-hidden>
      <div className="flex items-start justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="size-4 rounded-full" />
      </div>
      <Skeleton className="mt-3 h-7 w-28" />
      <Skeleton className="mt-3 h-3.5 w-40" />
    </Card>
  );
}

/** Skeleton de um card de seção com lista. */
function SectionListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <Card className="p-5" aria-hidden>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-16" />
      </div>
      <ListSkeleton rows={rows} className="mt-5" />
    </Card>
  );
}

/** Skeleton do dashboard completo (espelha o layout de /dashboard). */
export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-5" role="status" aria-label="Carregando o painel">
      <span className="sr-only">Carregando…</span>

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-64 rounded-lg" />
          <Skeleton className="h-9 w-40 rounded-lg" />
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>

      {/* Funil + performance */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2" aria-hidden>
          <Skeleton className="h-4 w-40" />
          <div className="mt-5 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-3 w-28 shrink-0" />
                <Skeleton className="h-3 flex-1" />
                <Skeleton className="h-3 w-24 shrink-0" />
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5" aria-hidden>
          <Skeleton className="h-4 w-44" />
          <div className="mt-5 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-3 w-12" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Listas */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SectionListSkeleton />
        <SectionListSkeleton />
        <SectionListSkeleton />
      </div>
    </div>
  );
}
