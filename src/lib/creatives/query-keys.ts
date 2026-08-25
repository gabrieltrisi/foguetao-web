import type { CreativeListParams } from "@/types/api/creatives";

/** Fonte ÚNICA das query keys dos Criativos. */
const ROOT = "creatives" as const;

export const creativeKeys = {
  root: [ROOT] as const,
  lists: () => [ROOT, "list"] as const,
  list: (params?: CreativeListParams) => [ROOT, "list", params ?? {}] as const,
};
