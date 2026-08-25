import { describe, it, expect } from "vitest";
import { parseUpdateCompanyBody } from "@/lib/api/validation";
import { queryKeys, companyInvalidation, crmInvalidation, integrationsInvalidation } from "@/lib/query/keys";
import { isApiError } from "@/types/api/error";

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

describe("parseUpdateCompanyBody", () => {
  it("aceita os campos reais do UpdateCompanyDto", () => {
    expect(
      parseUpdateCompanyBody({
        name: "Nova Empresa",
        legalName: "Nova Empresa Ltda",
        document: "00.000.000/0001-00",
        email: "contato@ex.com",
        phone: "+55 11 90000-0000",
        timezone: "America/Sao_Paulo",
        locale: "pt-BR",
        currency: "BRL",
        logoUrl: "https://ex.com/logo.svg",
      }),
    ).toMatchObject({ name: "Nova Empresa", currency: "BRL" });
  });

  it("aceita alteração parcial (só um campo)", () => {
    expect(parseUpdateCompanyBody({ timezone: "Europe/Lisbon" })).toEqual({
      timezone: "Europe/Lisbon",
    });
  });

  it("corpo vazio é rejeitado", () => {
    expectValidationError(() => parseUpdateCompanyBody({}));
  });

  it("REJEITA slug: é imutável no backend (que responde 400)", () => {
    expectValidationError(() => parseUpdateCompanyBody({ slug: "novo-slug" }));
    expectValidationError(() => parseUpdateCompanyBody({ name: "X", slug: "novo-slug" }));
  });

  it("REJEITA plan e status: não são editáveis por rota alguma", () => {
    expectValidationError(() => parseUpdateCompanyBody({ plan: "PRO" }));
    expectValidationError(() => parseUpdateCompanyBody({ status: "ACTIVE" }));
  });

  it("REJEITA settings: o backend grava mas nunca devolve — a UI não o expõe", () => {
    expectValidationError(() => parseUpdateCompanyBody({ settings: { tema: "escuro" } }));
  });

  it("REJEITA id/companyId no corpo (tenant vem da sessão)", () => {
    expectValidationError(() =>
      parseUpdateCompanyBody({ id: "3f2504e0-4f89-41d3-9a0c-0305e82c3301" }),
    );
    expectValidationError(() =>
      parseUpdateCompanyBody({ companyId: "3f2504e0-4f89-41d3-9a0c-0305e82c3301" }),
    );
  });

  it("normaliza a moeda para maiúsculas, como o backend faz", () => {
    expect(parseUpdateCompanyBody({ currency: "usd" })).toEqual({ currency: "USD" });
  });

  it("rejeita moeda fora do formato ISO 4217", () => {
    expectValidationError(() => parseUpdateCompanyBody({ currency: "REAL" }));
    expectValidationError(() => parseUpdateCompanyBody({ currency: "R$" }));
    expectValidationError(() => parseUpdateCompanyBody({ currency: "12" }));
  });

  it("rejeita e-mail inválido antes de sair da rede interna", () => {
    expectValidationError(() => parseUpdateCompanyBody({ email: "nao-e-email" }));
  });

  it("respeita os limites de tamanho do backend", () => {
    expectValidationError(() => parseUpdateCompanyBody({ name: "a" })); // min 2
    expectValidationError(() => parseUpdateCompanyBody({ name: "a".repeat(121) }));
    expectValidationError(() => parseUpdateCompanyBody({ legalName: "a".repeat(201) }));
    expectValidationError(() => parseUpdateCompanyBody({ document: "a".repeat(65) }));
    expectValidationError(() => parseUpdateCompanyBody({ phone: "a".repeat(41) }));
    expectValidationError(() => parseUpdateCompanyBody({ logoUrl: "a".repeat(513) }));
    expectValidationError(() => parseUpdateCompanyBody({ timezone: "a".repeat(65) }));
  });

  it("apara espaços", () => {
    expect(parseUpdateCompanyBody({ name: "  Empresa  " })).toEqual({ name: "Empresa" });
  });
});

describe("query keys de empresa", () => {
  it("a empresa ativa tem chave própria e centralizada", () => {
    expect(queryKeys.company.current()).toEqual(["company", "current"]);
    expect(companyInvalidation.current).toEqual(["company", "current"]);
  });

  it("não colide com membros nem convites", () => {
    expect(queryKeys.company.current()).not.toEqual(
      queryKeys.company.members({}).slice(0, 2),
    );
    expect(companyInvalidation.current[1]).not.toBe(companyInvalidation.allMembers[1]);
    expect(companyInvalidation.current[1]).not.toBe(companyInvalidation.allInvitations[1]);
  });

  it("invalidar a empresa NÃO alcança membros/convites (prefixos distintos)", () => {
    const memberKey = queryKeys.company.members({ page: 1 });
    expect(memberKey.slice(0, 2)).not.toEqual(companyInvalidation.current);
  });

  it("não colide com CRM nem integrações", () => {
    for (const other of [
      crmInvalidation.allDeals,
      crmInvalidation.allTasks,
      crmInvalidation.allContacts,
      integrationsInvalidation.allConnections,
    ]) {
      expect(other[0]).not.toBe("company");
    }
  });
});
