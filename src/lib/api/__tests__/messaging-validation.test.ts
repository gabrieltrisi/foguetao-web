import { describe, it, expect } from "vitest";
import {
  parseConversationListQuery,
  parseMessageListQuery,
  parseSendMessageBody,
  parseAssignConversationBody,
  requireUuid,
} from "@/lib/api/validation";
import { queryKeys, messagingInvalidation } from "@/lib/query/keys";
import { isApiError } from "@/types/api/error";

const UUID = "3f2504e0-4f89-41d3-9a0c-0305e82c3301";

function expectValidationError(fn: () => unknown) {
  try {
    fn();
    throw new Error("deveria ter lançado");
  } catch (e) {
    expect(isApiError(e)).toBe(true);
    if (isApiError(e)) {
      expect(e.statusCode).toBe(400);
      expect(e.code).toBe("VALIDATION_ERROR");
    }
  }
}

describe("parseConversationListQuery (cursor + filtros reais)", () => {
  it("aceita os filtros do contrato", () => {
    expect(
      parseConversationListQuery({
        cursor: "b64",
        limit: "30",
        status: "OPEN",
        type: "DIRECT",
        assignedToUserId: UUID,
        search: "acme",
      }),
    ).toMatchObject({ cursor: "b64", limit: 30, status: "OPEN", type: "DIRECT" });
  });

  it("vazio é válido", () => {
    expect(parseConversationListQuery({})).toEqual({});
  });

  it("rejeita limit acima do teto do messaging (100)", () => {
    expectValidationError(() => parseConversationListQuery({ limit: "101" }));
  });

  it("rejeita status/type fora do enum real", () => {
    expectValidationError(() => parseConversationListQuery({ status: "closed" }));
    expectValidationError(() => parseConversationListQuery({ type: "SMS" }));
  });

  it("rejeita uuid inválido nos filtros", () => {
    expectValidationError(() => parseConversationListQuery({ contactId: "abc" }));
  });
});

describe("parseMessageListQuery", () => {
  it("aceita direction do enum e cursor", () => {
    expect(parseMessageListQuery({ direction: "INBOUND", cursor: "x", limit: "50" })).toMatchObject({
      direction: "INBOUND",
      limit: 50,
    });
  });

  it("rejeita direction fora do enum", () => {
    expectValidationError(() => parseMessageListQuery({ direction: "agent" }));
  });
});

describe("parseSendMessageBody (espelha SendMessageDto)", () => {
  const base = {
    messagingAccountId: UUID,
    to: "+5511988887777",
    type: "TEXT",
    content: { text: "oi" },
    clientMessageId: "web-abc-1",
  };

  it("aceita o mínimo do contrato", () => {
    expect(parseSendMessageBody(base)).toMatchObject({ type: "TEXT" });
  });

  it("só aceita os 3 tipos enviáveis", () => {
    expect(parseSendMessageBody({ ...base, type: "IMAGE" }).type).toBe("IMAGE");
    expect(parseSendMessageBody({ ...base, type: "DOCUMENT" }).type).toBe("DOCUMENT");
    // o enum do banco é maior, mas só estes podem ser enviados
    expectValidationError(() => parseSendMessageBody({ ...base, type: "AUDIO" }));
    expectValidationError(() => parseSendMessageBody({ ...base, type: "LOCATION" }));
  });

  it("exige clientMessageId no formato do contrato (idempotência)", () => {
    expectValidationError(() => parseSendMessageBody({ ...base, clientMessageId: "" }));
    expectValidationError(() => parseSendMessageBody({ ...base, clientMessageId: "tem espaço" }));
    expectValidationError(() => parseSendMessageBody({ ...base, clientMessageId: "a".repeat(201) }));
    expect(parseSendMessageBody({ ...base, clientMessageId: "web-1_a.b:c" }).clientMessageId).toBe(
      "web-1_a.b:c",
    );
  });

  it("valida destinatário e conta", () => {
    expectValidationError(() => parseSendMessageBody({ ...base, to: "a" }));
    expectValidationError(() => parseSendMessageBody({ ...base, messagingAccountId: "x" }));
  });

  it("exige content como objeto", () => {
    expectValidationError(() => parseSendMessageBody({ ...base, content: "oi" }));
  });

  it("NÃO valida o formato do content por tipo — quem valida é o backend", () => {
    // content vazio passa no BFF e o backend recusa com MESSAGE_CONTENT_INVALID
    expect(parseSendMessageBody({ ...base, content: {} }).content).toEqual({});
  });
});

describe("parseAssignConversationBody", () => {
  it("exige UUID", () => {
    expect(parseAssignConversationBody({ assignedToUserId: UUID })).toEqual({
      assignedToUserId: UUID,
    });
    expectValidationError(() => parseAssignConversationBody({}));
    expectValidationError(() => parseAssignConversationBody({ assignedToUserId: "eu" }));
  });

  it("requireUuid protege as rotas de conversa/mensagem", () => {
    expect(requireUuid(UUID, "id")).toBe(UUID);
    expectValidationError(() => requireUuid("nao-uuid", "id"));
  });
});

describe("query keys e invalidação de messaging", () => {
  it("conversas variam por filtro; mensagens vivem sob a conversa", () => {
    expect(queryKeys.messaging.conversations({ status: "OPEN" })).toEqual([
      "messaging",
      "conversations",
      { status: "OPEN" },
    ]);
    expect(queryKeys.messaging.conversation("c1")).toEqual(["messaging", "conversation", "c1"]);
    expect(queryKeys.messaging.messages("c1", { limit: 30 })).toEqual([
      "messaging",
      "conversation",
      "c1",
      "messages",
      { limit: 30 },
    ]);
    expect(queryKeys.messaging.accounts()).toEqual(["messaging", "accounts"]);
  });

  it("o prefixo cobre todas as listas de conversas", () => {
    expect(messagingInvalidation.allConversations).toEqual(["messaging", "conversations"]);
    for (const k of [queryKeys.messaging.conversations(), queryKeys.messaging.conversations({ status: "OPEN" })]) {
      expect(k.slice(0, 2)).toEqual(messagingInvalidation.allConversations);
    }
  });

  it("invalidar mensagens de uma conversa não atinge outra", () => {
    expect(messagingInvalidation.messages("c1")).not.toEqual(messagingInvalidation.messages("c2"));
    expect(queryKeys.messaging.messages("c1", {}).slice(0, 4)).toEqual(
      messagingInvalidation.messages("c1"),
    );
  });

  it("messaging é um domínio separado — não colide com crm", () => {
    expect(messagingInvalidation.allConversations[0]).toBe("messaging");
    expect(queryKeys.crm.contacts()[0]).toBe("crm");
  });
});
