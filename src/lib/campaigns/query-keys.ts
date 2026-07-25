import type { CampaignFilters, RecipientFilters } from "@/types/api/campaigns";

/**
 * Fonte ÚNICA das query keys das Campanhas de WhatsApp (Sprint C2B). Usada pelos
 * hooks E pelo aplicador de realtime — nunca escrever strings soltas. O
 * `activeCompanyId` é anexado pelos hooks ao final; a invalidação por PREFIXO
 * (ex.: `detail(id)`) casa independentemente da empresa anexada.
 */
const ROOT = "messaging-campaigns" as const;

export const campaignKeys = {
  root: [ROOT] as const,
  lists: () => [ROOT, "list"] as const,
  list: (filters?: CampaignFilters) => [ROOT, "list", filters ?? {}] as const,
  details: () => [ROOT, "one"] as const,
  detail: (id: string) => [ROOT, "one", id] as const,
  metrics: (id: string) => [ROOT, "metrics", id] as const,
  timeline: (id: string) => [ROOT, "timeline", id] as const,
  recipientsAll: (id: string) => [ROOT, "recipients", id] as const,
  recipients: (id: string, filters?: RecipientFilters) =>
    [ROOT, "recipients", id, filters ?? {}] as const,
};

/** Invalida tudo de UMA campanha (detalhe/métricas/timeline/destinatários) + as listas. */
export function invalidateCampaign(
  invalidate: (key: readonly unknown[]) => void,
  id: string,
  opts: { recipients?: boolean } = {},
): void {
  invalidate(campaignKeys.detail(id));
  invalidate(campaignKeys.metrics(id));
  invalidate(campaignKeys.timeline(id));
  invalidate(campaignKeys.lists());
  if (opts.recipients) invalidate(campaignKeys.recipientsAll(id));
}
