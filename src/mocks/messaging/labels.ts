import type { Label } from "@/types/messaging";

export const labels: Label[] = [
  { id: "lbl-1", name: "Urgente", color: "danger", count: 12 },
  { id: "lbl-2", name: "Suporte", color: "info", count: 34 },
  { id: "lbl-3", name: "Vendas", color: "brand", count: 28 },
  { id: "lbl-4", name: "Financeiro", color: "warning", count: 9 },
  { id: "lbl-5", name: "Resolvido", color: "success", count: 57 },
  { id: "lbl-6", name: "Aguardando", color: "neutral", count: 15 },
];

export function getLabelById(id: string): Label | undefined {
  return labels.find((l) => l.id === id);
}
