/**
 * Primitivas PURAS do cliente realtime (C3.1D) — sem React, testáveis isoladas.
 * Estado de conexão exposto à UI e cache de deduplicação por `eventId`.
 */

/** Estados públicos da conexão realtime (para UI + gating do polling fallback). */
export type RealtimeConnectionStatus =
  | "idle" // ainda não conectou (sem sessão/empresa/permissão)
  | "connecting" // primeira tentativa de abertura
  | "connected" // stream aberto e saudável
  | "reconnecting" // caiu; em backoff aguardando reabrir
  | "offline" // navegador offline (sem rede)
  | "error"; // falha persistente/feature indisponível

export interface RealtimeConnectionState {
  status: RealtimeConnectionStatus;
  /** Nº de tentativas de reconexão desde a última conexão saudável. */
  reconnectAttempts: number;
  /** Polling fallback ativo? (derivado: status não-conectado e online). */
  pollingActive: boolean;
}

export const INITIAL_REALTIME_STATE: RealtimeConnectionState = {
  status: "idle",
  reconnectAttempts: 0,
  pollingActive: false,
};

/** O polling fallback deve rodar? Só quando o stream NÃO está saudável e há rede. */
export function shouldPoll(status: RealtimeConnectionStatus): boolean {
  return status === "connecting" || status === "reconnecting" || status === "error";
}

/**
 * Cache FIFO limitado de `eventId` já processados (dedup at-least-once / múltiplas
 * abas / futuro replay). Sem crescimento infinito: ao exceder `max`, descarta o
 * mais antigo. PURO/testável.
 */
export class SeenEventCache {
  private readonly ids = new Set<string>();
  private readonly order: string[] = [];

  constructor(private readonly max = 500) {}

  /** true se `id` é NOVO (registra); false se já visto (duplicado → ignorar). */
  add(id: string): boolean {
    if (this.ids.has(id)) return false;
    this.ids.add(id);
    this.order.push(id);
    if (this.order.length > this.max) {
      const evicted = this.order.shift();
      if (evicted !== undefined) this.ids.delete(evicted);
    }
    return true;
  }

  has(id: string): boolean {
    return this.ids.has(id);
  }

  get size(): number {
    return this.ids.size;
  }
}
