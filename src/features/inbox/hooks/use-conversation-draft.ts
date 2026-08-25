"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { messagingApi } from "@/lib/api/messaging/client";
import { useSession } from "@/providers/session-provider";
import { isConflictError } from "@/lib/api/user-error-message";
import { inboxKeys } from "@/features/inbox/query-keys";
import { DRAFT_DEBOUNCE_MS, DRAFT_SAVED_INDICATOR_MS } from "@/features/inbox/constants";

export type DraftSaveState = "idle" | "saving" | "saved" | "conflict" | "error";

interface DraftInternal {
  conversationId: string | undefined;
  version: number;
  savedText: string;
  dirty: boolean;
}

/**
 * Rascunho por (conversa, usuário) (F0/§17). Autosave com debounce + optimistic
 * locking (`expectedVersion`). Regras:
 * - conflito 409 → estado "conflict"; NUNCA sobrescreve o texto local (o usuário
 *   resolve via `resolveConflict`);
 * - texto vazio → apaga o remoto (não salva vazio indefinidamente);
 * - troca de conversa → reidrata do remoto (sem misturar textos);
 * - `clear()` ao enviar → apaga com segurança.
 * A cifra/decifra é do backend; aqui só trafega texto do usuário atual.
 */
export function useConversationDraft(conversationId: string | undefined) {
  const qc = useQueryClient();
  const { activeCompanyId, can } = useSession();
  const enabled =
    Boolean(conversationId && activeCompanyId) && can("messaging.conversations.read");

  const query = useQuery({
    queryKey: [...inboxKeys.draft(conversationId ?? "none"), activeCompanyId],
    queryFn: () => messagingApi.getDraft(conversationId as string),
    enabled,
    staleTime: 30_000,
  });

  const [text, setTextState] = React.useState("");
  const [saveState, setSaveState] = React.useState<DraftSaveState>("idle");
  const ref = React.useRef<DraftInternal>({
    conversationId: undefined,
    version: 0,
    savedText: "",
    dirty: false,
  });
  // Timer do indicador "saved"→"idle" — limpo no unmount (F2D perf#4).
  const savedTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  React.useEffect(
    () => () => {
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    },
    [],
  );

  // Hidratação: troca de conversa reseta ao remoto; mesma conversa adota o remoto
  // apenas quando NÃO há edição local pendente (nunca sobrescreve o que o usuário digita).
  React.useEffect(() => {
    const remote = query.data ?? null;
    if (ref.current.conversationId !== conversationId) {
      ref.current = {
        conversationId,
        version: remote?.version ?? 0,
        savedText: remote?.text ?? "",
        dirty: false,
      };
      setTextState(remote?.text ?? "");
      setSaveState("idle");
      return;
    }
    if (!ref.current.dirty && remote) {
      ref.current.version = remote.version;
      ref.current.savedText = remote.text ?? "";
      setTextState(remote.text ?? "");
    }
  }, [conversationId, query.data]);

  const setText = React.useCallback((value: string) => {
    ref.current.dirty = value !== ref.current.savedText;
    setTextState(value);
  }, []);

  const save = React.useCallback(async () => {
    const cid = ref.current.conversationId;
    if (!cid) return;
    const current = text;
    setSaveState("saving");
    try {
      if (current.trim() === "") {
        if (ref.current.savedText !== "") {
          await messagingApi.deleteDraft(cid);
          ref.current.savedText = "";
          ref.current.version = 0;
        }
        ref.current.dirty = false;
        setSaveState("idle");
        return;
      }
      const saved = await messagingApi.putDraft(cid, {
        text: current,
        expectedVersion: ref.current.version,
      });
      ref.current.version = saved.version;
      ref.current.savedText = saved.text ?? current;
      ref.current.dirty = false;
      setSaveState("saved");
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
      savedTimerRef.current = setTimeout(() => {
        savedTimerRef.current = null;
        setSaveState((s) => (s === "saved" ? "idle" : s));
      }, DRAFT_SAVED_INDICATOR_MS);
    } catch (err) {
      // Conflito 409: mantém o texto local; o usuário decide recarregar/mesclar.
      setSaveState(isConflictError(err) ? "conflict" : "error");
    }
  }, [text]);

  // Autosave debounced: só quando há edição local pendente.
  React.useEffect(() => {
    if (!enabled || !ref.current.dirty) return;
    const t = window.setTimeout(() => void save(), DRAFT_DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [text, enabled, save]);

  /** Resolve conflito: descarta o local e adota o remoto (ação explícita do usuário). */
  const resolveConflict = React.useCallback(async () => {
    const cid = ref.current.conversationId;
    if (!cid) return;
    const remote = await messagingApi.getDraft(cid);
    ref.current = {
      conversationId: cid,
      version: remote?.version ?? 0,
      savedText: remote?.text ?? "",
      dirty: false,
    };
    setTextState(remote?.text ?? "");
    setSaveState("idle");
    qc.setQueryData([...inboxKeys.draft(cid), activeCompanyId], remote);
  }, [qc, activeCompanyId]);

  /** Limpa o rascunho (ao enviar/limpar). Idempotente. */
  const clear = React.useCallback(async () => {
    const cid = ref.current.conversationId;
    ref.current.savedText = "";
    ref.current.version = 0;
    ref.current.dirty = false;
    setTextState("");
    setSaveState("idle");
    if (cid) {
      await messagingApi.deleteDraft(cid).catch(() => undefined);
      qc.invalidateQueries({ queryKey: inboxKeys.draft(cid) });
    }
  }, [qc]);

  return {
    text,
    setText,
    saveState,
    isConflict: saveState === "conflict",
    resolveConflict,
    clear,
    isLoading: query.isLoading,
  };
}
