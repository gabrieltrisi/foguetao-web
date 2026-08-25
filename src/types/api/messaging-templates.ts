import { z } from "zod";

/**
 * Contratos dos Templates de mensagem reutilizáveis. Espelham o backend
 * `messaging/templates`. `body` guarda o texto cru com placeholders
 * ({{primeiro_nome}}) — a resolução acontece só no envio da campanha.
 */
export const messageTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  body: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type ApiMessageTemplate = z.infer<typeof messageTemplateSchema>;

export const messageTemplateListSchema = z.object({
  items: z.array(messageTemplateSchema),
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
});
export type ApiMessageTemplateList = z.infer<typeof messageTemplateListSchema>;

export interface MessageTemplateFilters {
  search?: string;
  page?: number;
  limit?: number;
}
export interface CreateMessageTemplateInput {
  name: string;
  body: string;
}
export interface UpdateMessageTemplateInput {
  name?: string;
  body?: string;
}
