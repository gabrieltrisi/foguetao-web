/**
 * MOCK DE PREVIEW - Etiquetas de conversa NAO existe no backend: nao ha model, endpoint
 * nem permissao (auditado na Sprint 1.3). Estes dados sao apenas de
 * demonstracao e NADA e persistido. Serao substituidos quando o dominio for
 * criado no backend. Nenhum dado real de Conversas/Chat/Contas passa por aqui.
 */
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
