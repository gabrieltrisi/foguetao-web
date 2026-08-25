import type { QueryClient } from "@tanstack/react-query";
import type { ApiConversationDetail } from "@/types/api/messaging";

/**
 * Patch OTIMISTA do DETALHE da conversa (F4) — o header lê daqui. Alvo PRECISO: só as
 * queries de detalhe (`["messaging","conversation",id, companyId]`), NUNCA as de
 * mensagens/rascunho que compartilham o prefixo. Retorna um rollback (restaura o
 * snapshot). No-op seguro quando o detalhe não está em cache (ex.: ação a partir da lista).
 */
export function patchConversationDetail(
  qc: QueryClient,
  id: string,
  patch: (c: ApiConversationDetail) => ApiConversationDetail,
): () => void {
  const filter = {
    predicate: (q: { queryKey: readonly unknown[] }) => {
      const k = q.queryKey;
      return (
        k[0] === "messaging" &&
        k[1] === "conversation" &&
        k[2] === id &&
        k[3] !== "messages" &&
        k[3] !== "draft"
      );
    },
  };
  const snapshots = qc.getQueriesData<ApiConversationDetail>(filter);
  qc.setQueriesData<ApiConversationDetail>(filter, (old) => (old ? patch(old) : old));
  return () => {
    for (const [key, data] of snapshots) qc.setQueryData(key, data);
  };
}
