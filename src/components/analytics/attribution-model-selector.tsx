"use client";

import { SegmentedControl } from "@/components/ui/segmented-control";
import { attributionModels } from "@/mocks/analytics/attribution";
import type { AttributionModel } from "@/types/analytics";

export function AttributionModelSelector({ value, onChange }: { value: AttributionModel; onChange: (m: AttributionModel) => void }) {
  const current = attributionModels.find((m) => m.value === value);
  return (
    <div className="flex flex-col gap-2">
      <SegmentedControl
        options={attributionModels.map((m) => ({ value: m.value, label: m.label }))}
        value={value}
        onValueChange={(v) => onChange(v as AttributionModel)}
        ariaLabel="Modelo de atribuição"
      />
      {current ? <p className="text-caption text-ink-3">{current.description}</p> : null}
    </div>
  );
}
