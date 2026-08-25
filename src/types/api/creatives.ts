import { z } from "zod";

/**
 * Contratos dos Criativos (geração de imagem por IA). Espelham o backend
 * `/creatives`. A imagem em si NÃO trafega aqui — os bytes são servidos por
 * `/creatives/:id/content` (proxy binário). Paginação por cursor opaco.
 */
export const creativeSchema = z.object({
  id: z.string(),
  prompt: z.string(),
  provider: z.string(),
  mimeType: z.string(),
  sizeBytes: z.number(),
  createdAt: z.string(),
});
export type ApiCreative = z.infer<typeof creativeSchema>;

export const creativeListSchema = z.object({
  items: z.array(creativeSchema),
  nextCursor: z.string().nullable(),
});
export type ApiCreativeList = z.infer<typeof creativeListSchema>;

export interface CreativeListParams {
  limit?: number;
  cursor?: string;
}
export interface GenerateCreativeInput {
  prompt: string;
}
