import { describe, expect, it } from "vitest";
import type { ApiConversation, ApiPublicMessageListItem } from "@/types/api/messaging";
import {
  connectionLabel,
  conversationTitle,
  messageKind,
  shouldSurfaceConnection,
  toConversationListItem,
  toSendabilityVM,
  toTimelineMessage,
} from "@/features/inbox/view-models";
import { inboxKeys } from "@/features/inbox/query-keys";

function conv(over: Partial<ApiConversation> = {}): ApiConversation {
  return {
    id: "c1",
    companyId: "co1",
    messagingAccountId: "a1",
    type: "DIRECT",
    status: "OPEN",
    title: null,
    normalizedPhone: "+5511999",
    assignedToUserId: null,
    contactId: null,
    unreadCount: 3,
    lastMessageAt: "2026-07-27T10:00:00.000Z",
    lastInboundAt: null,
    lastOutboundAt: null,
    createdAt: "2026-07-27T09:00:00.000Z",
    updatedAt: "2026-07-27T10:00:00.000Z",
    canSend: true,
    sendabilityReason: null,
    ...over,
  } as ApiConversation;
}

function msg(over: Partial<ApiPublicMessageListItem> = {}): ApiPublicMessageListItem {
  return {
    id: "m1",
    direction: "OUTBOUND",
    type: "TEXT",
    text: "oi",
    status: "SENT",
    createdAt: "2026-07-27T10:00:00.000Z",
    scheduledAt: null,
    sentAt: "2026-07-27T10:00:00.000Z",
    deliveredAt: null,
    readAt: null,
    failedAt: null,
    failure: null,
    ...over,
  } as ApiPublicMessageListItem;
}

describe("conversation view models", () => {
  it("título cai para telefone e depois 'Conversa'", () => {
    expect(conversationTitle({ title: "Ana", normalizedPhone: "x" })).toBe("Ana");
    expect(conversationTitle({ title: null, normalizedPhone: "+55" })).toBe("+55");
    expect(conversationTitle({ title: null, normalizedPhone: null })).toBe("Conversa");
  });

  it("unread usa unreadForUser quando presente, senão o global", () => {
    expect(toConversationListItem(conv({ unreadForUser: 1, unreadCount: 9 })).unread).toBe(1);
    expect(toConversationListItem(conv({ unreadForUser: null, unreadCount: 9 })).unread).toBe(9);
  });

  it("projeta canal/labels/preview/owner (defaults tolerantes)", () => {
    const vm = toConversationListItem(
      conv({
        channel: "WHATSAPP",
        ownerId: "o1",
        labels: [{ id: "l", name: "Urgente", color: "#f00" }],
        lastMessagePreview: { preview: "ola", direction: "INBOUND", type: "TEXT", at: "t" },
      }),
    );
    expect(vm.channel).toBe("WHATSAPP");
    expect(vm.ownerId).toBe("o1");
    expect(vm.labels[0].name).toBe("Urgente");
    expect(vm.preview).toBe("ola");
  });
});

describe("timeline message kind", () => {
  it("distingue interna/sistema/pública", () => {
    expect(messageKind({ direction: "OUTBOUND", visibility: "INTERNAL" })).toBe("internal");
    expect(messageKind({ direction: "SYSTEM" })).toBe("system");
    expect(messageKind({ direction: "INBOUND", visibility: "PUBLIC" })).toBe("public");
  });

  it("toTimelineMessage marca falha e mídia", () => {
    const vm = toTimelineMessage(msg({ status: "FAILED", hasMedia: true, visibility: "PUBLIC" }));
    expect(vm.isFailed).toBe(true);
    expect(vm.hasMedia).toBe(true);
    expect(vm.kind).toBe("public");
  });
});

describe("sendability VM", () => {
  it("sem detalhe → usa fallback canSend, janela aberta", () => {
    const vm = toSendabilityVM(null, true);
    expect(vm.canSend).toBe(true);
    expect(vm.withinReplyWindow).toBe(true);
  });
  it("com detalhe → janela/template/tipos", () => {
    const vm = toSendabilityVM(
      {
        canSend: false,
        reasonCode: "OUTSIDE_WINDOW",
        retryable: false,
        connectionStatus: "CONNECTED",
        channel: "WHATSAPP",
        allowedMessageTypes: ["TEXT", "IMAGE"],
        requiresTemplate: true,
        replyWindow: { hasWindow: true, windowSeconds: 86400, expiresAt: "t", withinWindow: false },
        supportedMimeTypes: ["image/png"],
      },
      true,
    );
    expect(vm.canSend).toBe(false);
    expect(vm.requiresTemplate).toBe(true);
    expect(vm.withinReplyWindow).toBe(false);
    expect(vm.allowedMessageTypes).toContain("IMAGE");
  });
});

describe("connection presentation", () => {
  it("rótulo + quando sinalizar", () => {
    expect(connectionLabel("offline")).toBe("Offline");
    expect(shouldSurfaceConnection("connected")).toBe(false);
    expect(shouldSurfaceConnection("reconnecting")).toBe(true);
    expect(shouldSurfaceConnection("offline")).toBe(true);
  });
});

describe("inboxKeys (dispatcher-compatível)", () => {
  it("usa o root 'messaging' e casa por prefixo", () => {
    expect(inboxKeys.lists()).toEqual(["messaging", "conversations"]);
    expect(inboxKeys.detail("c1")).toEqual(["messaging", "conversation", "c1"]);
    expect(inboxKeys.messagesAll("c1")).toEqual(["messaging", "conversation", "c1", "messages"]);
    expect(inboxKeys.draft("c1")).toEqual(["messaging", "conversation", "c1", "draft"]);
    expect(inboxKeys.labels()).toEqual(["messaging", "labels"]);
  });
});
