import { describe, it, expect } from "vitest";
import { messageForTagError } from "@/lib/crm/tag-errors";
import { tagSchema, tagListSchema } from "@/types/api/crm";
import { ApiError } from "@/types/api/error";

function apiError(statusCode: number, code: string, message = "x") {
  return new ApiError({ statusCode, code, message });
}

describe("schema de tag (contrato real do TagResponseDto)", () => {
  it("aceita a resposta exata do backend", () => {
    expect(
      tagSchema.parse({
        id: "t1",
        name: "VIP",
        color: "#FF8800",
        description: "Clientes VIP",
        createdAt: "2026-07-15T12:00:00.000Z",
      }),
    ).toMatchObject({ id: "t1", name: "VIP" });
  });

  it("color e description podem ser nulos (o backend os grava nullable)", () => {
    const parsed = tagSchema.parse({ id: "t1", name: "A", color: null, description: null });
    expect(parsed.color).toBeNull();
    expect(parsed.description).toBeNull();
  });

  it("valida o envelope paginado de GET /tags", () => {
    const list = tagListSchema.parse({
      items: [{ id: "t1", name: "A", color: null }],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(list.items).toHaveLength(1);
  });
});

describe("messageForTagError (códigos reais do TagsService)", () => {
  it("mapeia nome duplicado (409 TAG_ALREADY_EXISTS)", () => {
    expect(messageForTagError(apiError(409, "TAG_ALREADY_EXISTS"))).toMatch(/já existe/i);
  });

  it("mapeia tag inexistente (404 TAG_NOT_FOUND)", () => {
    expect(messageForTagError(apiError(404, "TAG_NOT_FOUND"))).toMatch(/não encontrada/i);
  });

  it("mapeia contato inexistente ao associar (404 CONTACT_NOT_FOUND)", () => {
    expect(messageForTagError(apiError(404, "CONTACT_NOT_FOUND"))).toMatch(/contato não encontrado/i);
  });

  it("mapeia permissão negada", () => {
    expect(messageForTagError(apiError(403, "INSUFFICIENT_PERMISSION"))).toMatch(/permissão/i);
    // 403 com código desconhecido ainda cai no fallback de permissão
    expect(messageForTagError(apiError(403, "SOMETHING_ELSE"))).toMatch(/permissão/i);
  });

  it("mapeia backend indisponível", () => {
    expect(messageForTagError(apiError(503, "SERVICE_UNAVAILABLE"))).toMatch(/indisponível/i);
  });

  it("tem fallback para erro desconhecido", () => {
    expect(messageForTagError(new Error("boom"))).toBeTruthy();
  });
});
