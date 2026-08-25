"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { messageTemplatesApi } from "@/lib/api/messaging-templates/client";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { messageTemplateKeys } from "@/lib/messaging-templates/query-keys";
import { useSession } from "@/providers/session-provider";
import type {
  CreateMessageTemplateInput,
  MessageTemplateFilters,
  UpdateMessageTemplateInput,
} from "@/types/api/messaging-templates";

export function useMessageTemplates(filters?: MessageTemplateFilters) {
  const { activeCompanyId, can } = useSession();
  return useQuery({
    queryKey: [...messageTemplateKeys.list(filters), activeCompanyId],
    queryFn: () => messageTemplatesApi.list(filters),
    enabled: Boolean(activeCompanyId) && can(PERMISSIONS.MESSAGING_TEMPLATES_READ),
    placeholderData: (prev) => prev,
  });
}

function useInvalidate() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: messageTemplateKeys.root });
}

export function useCreateMessageTemplate() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (body: CreateMessageTemplateInput) => messageTemplatesApi.create(body),
    onSuccess: invalidate,
  });
}

export function useUpdateMessageTemplate() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateMessageTemplateInput }) =>
      messageTemplatesApi.update(id, body),
    onSuccess: invalidate,
  });
}

export function useDeleteMessageTemplate() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: string) => messageTemplatesApi.remove(id),
    onSuccess: invalidate,
  });
}
