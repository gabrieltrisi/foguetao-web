import { Card } from "@/components/ui/card";
import { PreviewNotice } from "@/components/admin/preview-notice";
import { UsageCard } from "@/components/admin/usage";
import { usageLimits, usagePercent } from "@/mocks/admin/limits";

export function LimitsView() {
  const near = usageLimits.filter((l) => usagePercent(l) >= 75).length;
  return (
    <div className="flex flex-col gap-4">
      <PreviewNotice>
        Limites e consumo não existem no backend. Os números abaixo são ilustrativos.
      </PreviewNotice>
      <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
        <p className="text-body2 text-ink-2">
          Consumo do ciclo atual · <span className="font-medium text-ink">{usageLimits.length}</span> limites monitorados
        </p>
        {near > 0 ? (
          <p className="text-body2 font-medium text-warning">{near} limite(s) acima de 75%</p>
        ) : (
          <p className="text-body2 font-medium text-success">Todos dentro do esperado</p>
        )}
      </Card>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {usageLimits.map((l) => (
          <UsageCard key={l.key} limit={l} />
        ))}
      </div>
    </div>
  );
}
