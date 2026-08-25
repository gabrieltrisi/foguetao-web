"use client";

import { useQuery } from "@tanstack/react-query";
import { messagingApi } from "@/lib/api/messaging/client";
import { useSession } from "@/providers/session-provider";
import { inboxKeys } from "@/features/inbox/query-keys";

/**
 * Metadados de UMA mídia (F2B). Só metadados (mime/tamanho/nome/status) — o backend
 * NÃO expõe bytes/URL de download nesta fase (storage MOCK). `staleTime` alto: a
 * metadata de mídia é imutável. Carregado sob demanda (lazy) pelo card.
 */
export function useMedia(mediaId: string | null | undefined) {
  const { activeCompanyId, can } = useSession();
  return useQuery({
    queryKey: [...inboxKeys.media(mediaId ?? "none"), activeCompanyId],
    queryFn: () => messagingApi.getMedia(mediaId as string),
    enabled: Boolean(mediaId) && Boolean(activeCompanyId) && can("messaging.media.read"),
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
  });
}
