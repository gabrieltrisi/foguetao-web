/**
 * API pública da feature Inbox (F0). Ponto único de import para hooks/keys/view
 * models/constantes. Os COMPONENTES visuais atuais ainda vivem em
 * `components/messaging/inbox/*` (Fase 6.2) e serão consolidados aqui em F1.
 */
export * from "./query-keys";
export * from "./view-models";
export * from "./constants";
export * from "./url-state";
export * from "./format";
export { useInboxUrlState } from "./hooks/use-inbox-url-state";
export { InboxShell } from "./components/shell/inbox-shell";
export * from "./timeline";
export { ConversationTimeline } from "./components/timeline/conversation-timeline";
export { useConversationMessages } from "./hooks/use-conversation-messages";
export { useConversationDraft, type DraftSaveState } from "./hooks/use-conversation-draft";
export {
  useInboxLabels,
  useCreateLabel,
  useConversationLabelMutation,
} from "./hooks/use-inbox-labels";
export {
  useAssignConversation,
  useChangeConversationOwner,
  useChangeConversationStatus,
  useCreateInternalNote,
} from "./hooks/use-inbox-mutations";
// Estado da conexão realtime (C3.1D) — re-exportado com nome da feature.
export { useRealtimeStatus as useInboxRealtimeStatus } from "@/providers/messaging-realtime-provider";
