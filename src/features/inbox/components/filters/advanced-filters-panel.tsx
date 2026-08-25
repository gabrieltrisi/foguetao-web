"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import type { ApiLabel } from "@/types/api/messaging";
import type { InboxAdvancedFilters } from "@/features/inbox/url-state";
import type { LabelVM } from "@/features/inbox/view-models";

const STATUS_OPTIONS = [
  { value: "", label: "Qualquer status" },
  { value: "OPEN", label: "Aberta" },
  { value: "PENDING", label: "Pendente" },
  { value: "RESOLVED", label: "Resolvida" },
  { value: "ARCHIVED", label: "Arquivada" },
  { value: "BLOCKED", label: "Bloqueada" },
];
const CHANNEL_OPTIONS = [
  { value: "", label: "Qualquer canal" },
  { value: "WHATSAPP", label: "WhatsApp" },
];

const field = "w-full rounded-md border border-line bg-white px-2 py-1.5 text-body2 text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand";

/**
 * Painel de filtros AVANÇADOS (F1). Estado TEMPORÁRIO local: fechar sem aplicar não
 * altera a lista; aplicar serializa na URL (reset de paginação pelo hook da lista).
 */
export function InboxAdvancedFiltersPanel({
  value,
  labels,
  onApply,
  onClear,
}: {
  value: InboxAdvancedFilters;
  labels: ApiLabel[] | LabelVM[];
  onApply: (next: InboxAdvancedFilters) => void;
  onClear: () => void;
}) {
  // O painel é montado ao abrir → o estado inicial já reflete `value` (sem efeito).
  const [draft, setDraft] = React.useState<InboxAdvancedFilters>(value);
  const set = (patch: Partial<InboxAdvancedFilters>) => setDraft((d) => ({ ...d, ...patch }));

  return (
    <div className="flex flex-col gap-2 rounded-md border border-line bg-surface p-3" role="group" aria-label="Filtros avançados">
      <label className="flex flex-col gap-1 text-caption text-ink-2">
        Status
        <select className={field} value={draft.status ?? ""} onChange={(e) => set({ status: e.target.value || undefined })}>
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-caption text-ink-2">
        Canal
        <select className={field} value={draft.channel ?? ""} onChange={(e) => set({ channel: e.target.value || undefined })}>
          {CHANNEL_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-caption text-ink-2">
        Etiqueta
        <select className={field} value={draft.labelId ?? ""} onChange={(e) => set({ labelId: e.target.value || undefined })}>
          <option value="">Qualquer etiqueta</option>
          {labels.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-2 text-caption text-ink-2">
        <input
          type="checkbox"
          checked={Boolean(draft.archived)}
          onChange={(e) => set({ archived: e.target.checked || undefined })}
        />
        Somente arquivadas
      </label>

      <div className="flex items-center justify-end gap-2 pt-1">
        <Button size="sm" variant="ghost" onClick={onClear}>
          Limpar
        </Button>
        <Button size="sm" variant="primary" onClick={() => onApply(draft)}>
          Aplicar
        </Button>
      </div>
    </div>
  );
}
