/**
 * Tipos das telas de Comunicação que seguem em PREVIEW.
 *
 * Conversas, chat e contas de mensageria passaram a usar os contratos reais —
 * os tipos deles vivem em `@/types/api/messaging` (Zod, shape do backend). O
 * que restou aqui pertence a Etiquetas, Filas e Templates, que ainda NÃO têm
 * backend (nem model, nem endpoint — auditado na Sprint 1.3) e por isso são
 * telas de demonstração, sem persistência.
 *
 * Os tipos antigos de Conversation/Message/WhatsAppAccount foram REMOVIDOS:
 * eram pré-formatados para a UI (`time: "10:42"`, `lastSync: "há 2 min"`) e não
 * correspondiam a contrato nenhum.
 */
import type { Channel } from "@/components/business/badges";

export type { Channel };

export type Template = {
  id: string;
  title: string;
  category: string;
  body: string;
  favorite: boolean;
};

export type LabelColor = "brand" | "info" | "success" | "warning" | "danger" | "neutral";

export type Label = {
  id: string;
  name: string;
  color: LabelColor;
  count: number;
};

export type QueueStatus = "online" | "busy" | "paused";

export type Queue = {
  id: string;
  name: string;
  agents: number;
  capacity: number;
  waiting: number;
  avgTime: string;
  status: QueueStatus;
};
