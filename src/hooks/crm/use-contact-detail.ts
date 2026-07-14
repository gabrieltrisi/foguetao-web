"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { crmApi } from "@/lib/api/crm/client";
import { queryKeys, crmInvalidation } from "@/lib/query/keys";
import { useSession } from "@/providers/session-provider";

/** Detalhe agregado do contato (contato + org + tags + notas/atividades + counters). */
export function useContact(id: string) {
  const { activeCompanyId } = useSession();
  return useQuery({
    queryKey: [...queryKeys.crm.contact(id), activeCompanyId],
    queryFn: () => crmApi.getContact(id),
    enabled: Boolean(activeCompanyId) && Boolean(id),
  });
}

function useInvalidateContact(id: string) {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: crmInvalidation.contact(id) });
    qc.invalidateQueries({ queryKey: queryKeys.crm.contactNotes(id) });
    qc.invalidateQueries({ queryKey: queryKeys.crm.contactActivities(id) });
  };
}

/* Notes */
export function useCreateNote(id: string) {
  const invalidate = useInvalidateContact(id);
  return useMutation({
    mutationFn: (body: { content: string; pinned?: boolean }) => crmApi.createNote(id, body),
    onSuccess: invalidate,
  });
}

export function useDeleteNote(id: string) {
  const invalidate = useInvalidateContact(id);
  return useMutation({
    mutationFn: (noteId: string) => crmApi.deleteNote(id, noteId),
    onSuccess: invalidate,
  });
}

/* Activities */
export function useCreateActivity(id: string) {
  const invalidate = useInvalidateContact(id);
  return useMutation({
    mutationFn: (body: { type: string; title: string; description?: string }) =>
      crmApi.createActivity(id, body),
    onSuccess: invalidate,
  });
}

/* Tags */
export function useAttachTag(id: string) {
  const invalidate = useInvalidateContact(id);
  return useMutation({
    mutationFn: (tagId: string) => crmApi.attachTag(id, tagId),
    onSuccess: invalidate,
  });
}

export function useDetachTag(id: string) {
  const invalidate = useInvalidateContact(id);
  return useMutation({
    mutationFn: (tagId: string) => crmApi.detachTag(id, tagId),
    onSuccess: invalidate,
  });
}

/* Custom fields */
export function useSetContactCustomFields(id: string) {
  const invalidate = useInvalidateContact(id);
  return useMutation({
    mutationFn: (values: Record<string, unknown>) => crmApi.setContactCustomFields(id, values),
    onSuccess: invalidate,
  });
}
