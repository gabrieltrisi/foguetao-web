import { describe, it, expect } from "vitest";
import {
  accountMeta,
  conversationName,
  conversationTime,
  dayLabel,
  groupByDay,
  isCancelable,
  isConnected,
  isFailed,
  isPendingSend,
  messageForMessagingError,
  messageTime,
  newClientMessageId,
  participantName,
  statusMeta,
  toChronological,
} from "@/lib/messaging/display";
import {
  conversationSummarySchema,
  conversationDetailSchema,
  messageSummarySchema,
  messageListSchema,
  conversationListSchema,
  sendableMessageTypes,
} from "@/types/api/messaging";
import { ApiError } from "@/types/api/error";

function apiError(statusCode: number, code: string, message = "x") {
  return new ApiError({ statusCode, code, message });
}

const conv = {
  id: "c1",
  companyId: "co1",
  messagingAccountId: "a1",
  type: "DIRECT",
  status: "OPEN",
  title: null,
  assignedToUserId: null,
  contactId: null,
  unreadCount: 2,
  lastMessageAt: "2026-07-16T12:00:00.000Z",
  lastInboundAt: null,
  lastOutboundAt: null,
  createdAt: "2026-07-16T10:00:00.000Z",
  updatedAt: "2026-07-16T12:00:00.000Z",
  canSend: true,
  sendabilityReason: null,
};

const msg = {
  id: "m1",
  conversationId: "c1",
  messagingAccountId: "a1",
  direction: "OUTBOUND",
  type: "TEXT",
  status: "SENT",
  preview: "Olá",
  hasMedia: false,
  mediaId: null,
  replyToMessageId: null,
  errorCode: null,
  sentAt: "2026-07-16T12:00:00.000Z",
  deliveredAt: null,
  readAt: null,
  failedAt: null,
  receivedAt: null,
  createdAt: "2026-07-16T12:00:00.000Z",
  updatedAt: "2026-07-16T12:00:00.000Z",
};

describe("schemas (contrato real)", () => {
  it("aceita o summary de conversa como o backend devolve", () => {
    expect(conversationSummarySchema.parse(conv).unreadCount).toBe(2);
  });

  it("o envelope de cursor é {items, nextCursor, hasMore}", () => {
    const list = conversationListSchema.parse({ items: [conv], nextCursor: "abc", hasMore: true });
    expect(list.hasMore).toBe(true);
    expect(list.nextCursor).toBe("abc");
    // sem mais páginas → nextCursor nulo
    expect(
      conversationListSchema.parse({ items: [], nextCursor: null, hasMore: false }).nextCursor,
    ).toBeNull();
  });

  it("o detalhe traz participantes e lastMessage (a listagem não)", () => {
    const detail = conversationDetailSchema.parse({
      ...conv,
      participants: [
        { id: "p1", type: "CONTACT", phone: "+55 11 9****-**77", displayName: null, contactId: null, isAdmin: false },
      ],
      lastMessage: msg,
    });
    expect(detail.participants[0].phone).toContain("*");
    expect(detail.lastMessage?.preview).toBe("Olá");
    // o summary NÃO tem lastMessage
    expect("lastMessage" in conversationSummarySchema.parse(conv)).toBe(false);
  });

  it("a mensagem da listagem expõe preview, nunca o conteúdo completo", () => {
    const parsed = messageSummarySchema.parse(msg) as Record<string, unknown>;
    expect(parsed.preview).toBe("Olá");
    expect(parsed.content).toBeUndefined();
    expect(messageListSchema.parse({ items: [msg], nextCursor: null, hasMore: false }).items).toHaveLength(1);
  });

  it("só TEXT, IMAGE e DOCUMENT podem ser enviados", () => {
    expect([...sendableMessageTypes]).toEqual(["TEXT", "IMAGE", "DOCUMENT"]);
  });
});

describe("status", () => {
  it("mapeia os 5 status reais de conversa", () => {
    for (const s of ["OPEN", "PENDING", "RESOLVED", "ARCHIVED", "BLOCKED"]) {
      expect(statusMeta(s).label).toBeTruthy();
    }
    expect(statusMeta("OPEN").tone).toBe("success");
  });

  it("status desconhecido não quebra", () => {
    expect(statusMeta("ZZZ").label).toBe("ZZZ");
  });

  it("só PENDING/QUEUED podem ser cancelados (regra do backend)", () => {
    expect(isCancelable("PENDING")).toBe(true);
    expect(isCancelable("QUEUED")).toBe(true);
    for (const s of ["SENT", "DELIVERED", "READ", "FAILED", "CANCELED", "RECEIVED"]) {
      expect(isCancelable(s)).toBe(false);
    }
  });

  it("identifica envio pendente e falha", () => {
    expect(isPendingSend("QUEUED")).toBe(true);
    expect(isPendingSend("SENT")).toBe(false);
    expect(isFailed("FAILED")).toBe(true);
  });

  it("mapeia status de conta e conexão", () => {
    expect(accountMeta("CONNECTED").tone).toBe("success");
    expect(accountMeta("ERROR").tone).toBe("danger");
    expect(isConnected("CONNECTED")).toBe(true);
    expect(isConnected("DEGRADED")).toBe(false);
  });
});

describe("identidade da conversa", () => {
  it("usa o nome do contato quando conhecido", () => {
    expect(conversationName(conv, "Maria")).toBe("Maria");
  });

  it("cai para o título quando não há contato", () => {
    expect(conversationName({ ...conv, title: "Suporte" }, null)).toBe("Suporte");
  });

  it("sem contato e sem título, rotula por tipo — não inventa nome", () => {
    expect(conversationName({ ...conv, type: "GROUP" }, null)).toBe("Grupo sem título");
    expect(conversationName({ ...conv, type: "BROADCAST" }, null)).toBe("Transmissão");
    expect(conversationName(conv, null)).toBe("Conversa sem título");
  });

  it("participante usa displayName ou o telefone já mascarado", () => {
    expect(
      participantName({ id: "p", type: "CONTACT", phone: "+55 11 9****-**77", displayName: "Ana", contactId: null, isAdmin: false }),
    ).toBe("Ana");
    expect(
      participantName({ id: "p", type: "CONTACT", phone: "+55 11 9****-**77", displayName: null, contactId: null, isAdmin: false }),
    ).toBe("+55 11 9****-**77");
  });
});

describe("datas", () => {
  const now = new Date("2026-07-16T15:00:00.000Z");

  it("hoje mostra hora; ontem mostra 'Ontem'", () => {
    expect(conversationTime("2026-07-16T12:00:00.000Z", now)).toMatch(/\d{2}:\d{2}/);
    expect(conversationTime("2026-07-15T12:00:00.000Z", now)).toBe("Ontem");
  });

  it("sem data não quebra", () => {
    expect(conversationTime(null, now)).toBe("");
    expect(conversationTime("data-ruim", now)).toBe("");
  });

  it("separador de dia usa Hoje/Ontem", () => {
    expect(dayLabel("2026-07-16T09:00:00.000Z", now)).toBe("Hoje");
    expect(dayLabel("2026-07-15T09:00:00.000Z", now)).toBe("Ontem");
  });

  it("hora da mensagem prefere sentAt/receivedAt sobre createdAt", () => {
    expect(messageTime(msg)).toMatch(/\d{2}:\d{2}/);
  });
});

describe("thread", () => {
  it("ordena cronologicamente (a listagem vem do mais recente)", () => {
    const older = { ...msg, id: "m0", createdAt: "2026-07-16T08:00:00.000Z" };
    const ordered = toChronological([msg, older]);
    expect(ordered.map((m) => m.id)).toEqual(["m0", "m1"]);
  });

  it("agrupa por dia preservando a ordem", () => {
    const now = new Date("2026-07-16T15:00:00.000Z");
    const groups = groupByDay(
      [msg, { ...msg, id: "m0", createdAt: "2026-07-15T08:00:00.000Z" }],
      now,
    );
    expect(groups.map((g) => g.day)).toEqual(["Ontem", "Hoje"]);
    expect(groups[1].items[0].id).toBe("m1");
  });

  it("thread vazia vira lista vazia", () => {
    expect(groupByDay([])).toEqual([]);
  });
});

describe("idempotência", () => {
  it("gera clientMessageId no formato aceito pelo contrato", () => {
    const id = newClientMessageId(1784212612139, 0.123456789);
    expect(id).toMatch(/^[a-zA-Z0-9._:-]+$/);
    expect(id.length).toBeLessThanOrEqual(200);
  });

  it("ids diferentes para envios diferentes", () => {
    expect(newClientMessageId(1, 0.1)).not.toBe(newClientMessageId(2, 0.2));
  });
});

describe("messageForMessagingError (códigos reais)", () => {
  it("mapeia os erros do módulo", () => {
    expect(messageForMessagingError(apiError(404, "CONVERSATION_NOT_FOUND"))).toMatch(/não encontrada/i);
    expect(messageForMessagingError(apiError(409, "CONVERSATION_ARCHIVED"))).toMatch(/arquivada/i);
    expect(messageForMessagingError(apiError(409, "MESSAGE_IDEMPOTENCY_CONFLICT"))).toMatch(/já foi enviada/i);
    expect(messageForMessagingError(apiError(409, "MESSAGE_CANCEL_NOT_POSSIBLE"))).toMatch(/não pode mais ser cancelada/i);
    expect(messageForMessagingError(apiError(400, "MESSAGE_RECIPIENT_INVALID"))).toMatch(/destinatário/i);
    expect(messageForMessagingError(apiError(409, "MESSAGING_ACCOUNT_INACTIVE"))).toMatch(/não está conectada/i);
    expect(messageForMessagingError(apiError(400, "MEDIA_TOO_LARGE"))).toMatch(/muito grande/i);
    expect(messageForMessagingError(apiError(403, "INSUFFICIENT_PERMISSION"))).toMatch(/permissão/i);
    expect(messageForMessagingError(apiError(503, "SERVICE_UNAVAILABLE"))).toMatch(/indisponível/i);
  });

  it("tem fallback", () => {
    expect(messageForMessagingError(new Error("boom"))).toBeTruthy();
  });
});
