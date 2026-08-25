import type { MessageTemplateFilters } from "@/types/api/messaging-templates";

/** Fonte ÚNICA das query keys dos Templates de mensagem. */
const ROOT = "messaging-templates" as const;

export const messageTemplateKeys = {
  root: [ROOT] as const,
  lists: () => [ROOT, "list"] as const,
  list: (filters?: MessageTemplateFilters) => [ROOT, "list", filters ?? {}] as const,
  detail: (id: string) => [ROOT, "one", id] as const,
};
