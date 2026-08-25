/**
 * Fábrica CENTRALIZADA do EventSource do realtime (Fase 6.3C). Isolada para
 * permitir injeção de um fake nos testes (o hook aceita uma factory).
 *
 * O BFF é same-origin: os cookies httpOnly são enviados automaticamente — nunca
 * passamos token nem companyId por query string. `withCredentials` é explícito
 * por robustez (same-origin já enviaria os cookies).
 */
export const MESSAGING_STREAM_PATH = "/api/messaging/stream";

export function createMessagingEventSource(): EventSource {
  return new EventSource(MESSAGING_STREAM_PATH, { withCredentials: true });
}
