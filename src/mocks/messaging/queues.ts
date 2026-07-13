import type { Queue } from "@/types/messaging";

export const queues: Queue[] = [
  { id: "q-1", name: "Comercial", agents: 6, capacity: 30, waiting: 4, avgTime: "2m 10s", status: "online" },
  { id: "q-2", name: "Suporte N1", agents: 8, capacity: 40, waiting: 12, avgTime: "3m 45s", status: "busy" },
  { id: "q-3", name: "Suporte N2", agents: 3, capacity: 15, waiting: 1, avgTime: "5m 20s", status: "online" },
  { id: "q-4", name: "Financeiro", agents: 2, capacity: 10, waiting: 0, avgTime: "1m 30s", status: "paused" },
  { id: "q-5", name: "Retenção", agents: 4, capacity: 20, waiting: 6, avgTime: "4m 05s", status: "busy" },
];

/** Agentes por fila (mock) para a visão de Inbox. */
export const inboxQueue = [
  { id: "iq-1", contact: "Larissa · Grão Café", queue: "Comercial", agent: "Camila Ribeiro", priority: "alta", waiting: "0m 45s" },
  { id: "iq-2", contact: "Aurora Labs", queue: "Suporte N1", agent: "—", priority: "alta", waiting: "3m 12s" },
  { id: "iq-3", contact: "Vinha & Co", queue: "Comercial", agent: "Rafael Monteiro", priority: "media", waiting: "1m 05s" },
  { id: "iq-4", contact: "Zenit Corp", queue: "Financeiro", agent: "Bruno Alcântara", priority: "baixa", waiting: "0m 20s" },
  { id: "iq-5", contact: "Núcleo Digital", queue: "Suporte N1", agent: "—", priority: "media", waiting: "5m 40s" },
  { id: "iq-6", contact: "Peça Rara", queue: "Retenção", agent: "Larissa Prado", priority: "alta", waiting: "2m 18s" },
] as const;
