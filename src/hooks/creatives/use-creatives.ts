"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { creativesApi } from "@/lib/api/creatives/client";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { creativeKeys } from "@/lib/creatives/query-keys";
import { useSession } from "@/providers/session-provider";
import type { CreativeListParams, GenerateCreativeInput } from "@/types/api/creatives";

export function useCreatives(params?: CreativeListParams) {
  const { activeCompanyId, can } = useSession();
  return useQuery({
    queryKey: [...creativeKeys.list(params), activeCompanyId],
    queryFn: () => creativesApi.list(params),
    enabled: Boolean(activeCompanyId) && can(PERMISSIONS.CREATIVES_READ),
    placeholderData: (prev) => prev,
  });
}

function useInvalidate() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: creativeKeys.root });
}

export function useGenerateCreative() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (body: GenerateCreativeInput) => creativesApi.generate(body),
    onSuccess: invalidate,
  });
}

export function useDeleteCreative() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: string) => creativesApi.remove(id),
    onSuccess: invalidate,
  });
}
