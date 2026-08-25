"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { evolutionApi, integrationsApi } from "@/lib/api/integrations/client";
import { queryKeys } from "@/lib/query/keys";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useSession } from "@/providers/session-provider";
import { presentEvolutionStatus } from "@/lib/integrations/evolution-presentation";
import type {
  ApiEvolutionConnection,
  ApiEvolutionQr,
  CreateEvolutionConnectionInput,
} from "@/types/api/evolution";

/** Capabilities só mudam com deploy (é código, não dado da empresa). */
const CAPABILITIES_STALE_MS = 10 * 60 * 1000;
/** QR efêmero: polling curto (§8 pede 2–3s). */
const QR_POLL_MS = 2500;
/** Estado da conexão: polling um pouco mais espaçado (§8 pede 3–5s). */
const STATE_POLL_MS = 4000;

/* ---------- Queries ---------- */

/**
 * Descobre a conexão Evolution já existente da empresa. Os 9 endpoints Evolution
 * são scoped por :id e NÃO incluem "listar"; reusamos o list GENÉRICO de
 * integrações (mesma camada de client, sem HTTP paralelo) só para obter o id —
 * que é identificador público, não segredo.
 */
export function useEvolutionExistingConnection() {
  const { activeCompanyId, can } = useSession();
  return useQuery({
    queryKey: ["integrations", "evolution", "existing", activeCompanyId],
    queryFn: async () => {
      const page = await integrationsApi.list({ provider: "EVOLUTION", limit: 1 });
      const found = page.items.find((c) => c.provider === "EVOLUTION");
      return found ? { id: found.id } : null;
    },
    enabled: Boolean(activeCompanyId) && can(PERMISSIONS.INTEGRATIONS_CONNECTIONS_READ),
  });
}

export function useEvolutionCapabilities() {
  const { activeCompanyId, can } = useSession();
  return useQuery({
    queryKey: [...queryKeys.integrations.evolution.capabilities(), activeCompanyId],
    queryFn: () => evolutionApi.capabilities(),
    staleTime: CAPABILITIES_STALE_MS,
    enabled: Boolean(activeCompanyId) && can(PERMISSIONS.INTEGRATIONS_CONNECTIONS_READ),
  });
}

/**
 * Estado da conexão. Com `poll: true`, refaz o fetch enquanto o status for
 * transitório (DRAFT/CONNECTING) e PARA sozinho ao atingir um estado final —
 * sem double-polling nem timer manual (o React Query cancela ao desmontar).
 */
export function useEvolutionConnection(id: string | null, opts?: { poll?: boolean }) {
  const { activeCompanyId, can } = useSession();
  return useQuery({
    queryKey: [...queryKeys.integrations.evolution.connection(id ?? "none"), activeCompanyId],
    queryFn: () => evolutionApi.state(id as string),
    enabled:
      Boolean(id) && Boolean(activeCompanyId) && can(PERMISSIONS.INTEGRATIONS_CONNECTIONS_READ),
    refetchInterval: (query) => {
      if (!opts?.poll) return false;
      const data = query.state.data as ApiEvolutionConnection | undefined;
      if (!data) return STATE_POLL_MS;
      return presentEvolutionStatus(data.status).isTransitional ? STATE_POLL_MS : false;
    },
  });
}

/**
 * QR code. SENSÍVEL e EFÊMERO (§9): `gcTime: 0` garante que sai da memória assim
 * que nenhum componente o observa (desmontar/fechar modal). Só roda quando
 * `active` (conexão aguardando leitura). Nunca é persistido em storage/log.
 */
export function useEvolutionQr(id: string | null, active: boolean) {
  const { activeCompanyId, can } = useSession();
  return useQuery({
    queryKey: [...queryKeys.integrations.evolution.qr(id ?? "none"), activeCompanyId],
    queryFn: () => evolutionApi.qr(id as string),
    enabled:
      active &&
      Boolean(id) &&
      Boolean(activeCompanyId) &&
      can(PERMISSIONS.INTEGRATIONS_CONNECTIONS_READ),
    gcTime: 0,
    staleTime: 0,
    refetchInterval: (query) => {
      if (!active) return false;
      const data = query.state.data as ApiEvolutionQr | undefined;
      // Já conectou (ou o backend diz que não faz mais sentido): para de pollar.
      if (data && !data.available && data.reason === "ALREADY_CONNECTED") return false;
      return QR_POLL_MS;
    },
  });
}

export function useEvolutionWebhookState(id: string | null) {
  const { activeCompanyId, can } = useSession();
  return useQuery({
    queryKey: [...queryKeys.integrations.evolution.webhook(id ?? "none"), activeCompanyId],
    queryFn: () => evolutionApi.webhookState(id as string),
    enabled:
      Boolean(id) && Boolean(activeCompanyId) && can(PERMISSIONS.INTEGRATIONS_CONNECTIONS_READ),
  });
}

/* ---------- Mutations ---------- */

export function useCreateEvolutionConnection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateEvolutionConnectionInput) => evolutionApi.create(body),
    onSuccess: (conn) => {
      qc.setQueryData(queryKeys.integrations.evolution.connection(conn.connectionId), conn);
    },
  });
}

export function useConnectEvolution(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => evolutionApi.connect(id),
    onSuccess: (conn) => {
      qc.setQueryData(queryKeys.integrations.evolution.connection(id), conn);
    },
  });
}

export function useDisconnectEvolution(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => evolutionApi.disconnect(id),
    onSuccess: (conn) => {
      qc.setQueryData(queryKeys.integrations.evolution.connection(id), conn);
      // QR não faz mais sentido após desconectar: remove da memória.
      qc.removeQueries({ queryKey: queryKeys.integrations.evolution.qr(id) });
    },
  });
}

export function useConfigureEvolutionWebhook(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => evolutionApi.configureWebhook(id),
    onSuccess: (state) => {
      qc.setQueryData(queryKeys.integrations.evolution.webhook(id), state);
      qc.invalidateQueries({ queryKey: queryKeys.integrations.evolution.connection(id) });
    },
  });
}
