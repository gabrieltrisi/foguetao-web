import type { PeriodOption } from "@/types";

/**
 * Opções do filtro de período. É configuração de UI (rótulos), não dado de
 * negócio — por isso vive aqui e não num mock. A tradução para a janela real
 * (`from`/`to`) do contrato fica em `@/lib/crm/metrics` (`periodToRange`).
 */
export const periodOptions: PeriodOption[] = [
  { value: "hoje", label: "Hoje" },
  { value: "7d", label: "7 dias" },
  { value: "30d", label: "30 dias" },
  { value: "mes", label: "Este mês" },
  { value: "custom", label: "Personalizado" },
];
