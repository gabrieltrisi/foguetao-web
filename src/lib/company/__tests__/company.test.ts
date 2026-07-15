import { describe, it, expect } from "vitest";
import {
  companyStatusMeta,
  companyPlanMeta,
  TIMEZONE_OPTIONS,
  LOCALE_OPTIONS,
  CURRENCY_OPTIONS,
  withCurrent,
  formatDate,
  messageForCompanyError,
} from "@/lib/company/company";
import {
  companySchema,
  companyStatusSchema,
  companyPlanSchema,
  companySummarySchema,
  companyContextSchema,
} from "@/types/api/company";
import { ApiError } from "@/types/api/error";

const company = {
  id: "co-1",
  name: "Empresa Seed",
  slug: "empresa-seed",
  legalName: null,
  document: null,
  email: null,
  phone: null,
  logoUrl: null,
  timezone: "America/Sao_Paulo",
  locale: "pt-BR",
  currency: "BRL",
  status: "ACTIVE",
  plan: "FREE",
  createdAt: "2026-07-14T01:48:03.982Z",
};

describe("schema da empresa (contrato real, 14 campos)", () => {
  it("aceita a resposta exata do backend", () => {
    expect(companySchema.parse(company)).toMatchObject({ id: "co-1", slug: "empresa-seed" });
  });

  it("aceita nulos onde o backend permite", () => {
    const parsed = companySchema.parse(company);
    expect(parsed.legalName).toBeNull();
    expect(parsed.logoUrl).toBeNull();
  });

  it("NÃO tem `settings`: o backend aceita gravar mas nunca devolve", () => {
    // Verificado contra a API: settings não aparece no PATCH nem no GET.
    // Se um dia passar a vir, este teste falha e nos obriga a decidir.
    const parsed = companySchema.parse({ ...company, settings: { x: 1 } });
    expect(parsed).not.toHaveProperty("settings");
  });

  it("não tem updatedAt nem deletedAt (fora do response DTO)", () => {
    const parsed = companySchema.parse(company);
    expect(parsed).not.toHaveProperty("updatedAt");
    expect(parsed).not.toHaveProperty("deletedAt");
  });

  it("rejeita status e plano fora do enum real", () => {
    expect(companySchema.safeParse({ ...company, status: "TRIAL" }).success).toBe(false);
    expect(companySchema.safeParse({ ...company, plan: "PREMIUM" }).success).toBe(false);
  });

  it("o mock inventava TRIAL — o enum real não tem", () => {
    expect(companyStatusSchema.options).toEqual(["ACTIVE", "SUSPENDED", "DISABLED"]);
    expect(companyPlanSchema.options).toEqual(["FREE", "STARTER", "PRO", "ENTERPRISE"]);
  });

  it("summary e context seguem seus contratos", () => {
    expect(
      companySummarySchema.parse({
        id: "co-1",
        name: "X",
        slug: "x",
        status: "ACTIVE",
        plan: "FREE",
        role: "OWNER",
      }),
    ).toMatchObject({ role: "OWNER" });

    expect(
      companyContextSchema.parse({
        company,
        role: "OWNER",
        membershipStatus: "ACTIVE",
        isOwner: true,
        permissions: ["company.read"],
      }).isOwner,
    ).toBe(true);
  });
});

describe("rótulos", () => {
  it("todo status e plano tem rótulo e tom", () => {
    for (const s of companyStatusSchema.options) expect(companyStatusMeta[s].label).toBeTruthy();
    for (const p of companyPlanSchema.options) expect(companyPlanMeta[p].label).toBeTruthy();
  });

  it("o rótulo do plano casa com o valor do enum (usado para marcar o atual)", () => {
    for (const p of companyPlanSchema.options) {
      expect(companyPlanMeta[p].label.toUpperCase()).toBe(p);
    }
  });
});

describe("opções de fuso, idioma e moeda", () => {
  it("são conveniência de UI, não allowlist — o valor atual sempre aparece", () => {
    const exotic = "Pacific/Kiritimati";
    expect(TIMEZONE_OPTIONS.some((o) => o.value === exotic)).toBe(false);
    const withExotic = withCurrent(TIMEZONE_OPTIONS, exotic);
    expect(withExotic[0]).toEqual({ value: exotic, label: exotic });
    expect(withExotic).toHaveLength(TIMEZONE_OPTIONS.length + 1);
  });

  it("valor já presente não é duplicado", () => {
    const same = withCurrent(TIMEZONE_OPTIONS, "America/Sao_Paulo");
    expect(same).toHaveLength(TIMEZONE_OPTIONS.length);
  });

  it("valor vazio/indefinido não altera a lista", () => {
    expect(withCurrent(LOCALE_OPTIONS, undefined)).toHaveLength(LOCALE_OPTIONS.length);
    expect(withCurrent(LOCALE_OPTIONS, "")).toHaveLength(LOCALE_OPTIONS.length);
  });

  it("moedas seguem o formato ISO 4217 exigido pelo backend", () => {
    for (const o of CURRENCY_OPTIONS) expect(o.value).toMatch(/^[A-Z]{3}$/);
  });

  it("locales seguem BCP 47", () => {
    for (const o of LOCALE_OPTIONS) expect(o.value).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/);
  });
});

describe("erros reais dos fluxos de empresa", () => {
  const err = (code: string, statusCode: number, message = "msg do backend") =>
    new ApiError({ statusCode, code, message });

  it("404 empresa não encontrada", () => {
    expect(messageForCompanyError(err("COMPANY_NOT_FOUND", 404))).toMatch(/não encontrada/i);
  });

  it("403 empresa suspensa e acesso negado", () => {
    expect(messageForCompanyError(err("COMPANY_INACTIVE", 403))).toMatch(/suspensa|desativada/i);
    expect(messageForCompanyError(err("COMPANY_ACCESS_DENIED", 403))).toMatch(/não tem acesso/i);
  });

  it("403 sem permissão", () => {
    expect(messageForCompanyError(err("INSUFFICIENT_PERMISSION", 403))).toMatch(/permissão/i);
    expect(messageForCompanyError(err("INSUFFICIENT_ROLE", 403))).toMatch(/permissão/i);
  });

  it("400 contexto de empresa e validação", () => {
    expect(messageForCompanyError(err("COMPANY_CONTEXT_REQUIRED", 400))).toMatch(/empresa ativa/i);
    expect(messageForCompanyError(err("VALIDATION_ERROR", 400))).toMatch(/verifique os campos/i);
  });

  it("409 slug indisponível", () => {
    expect(messageForCompanyError(err("COMPANY_SLUG_UNAVAILABLE", 409))).toMatch(/já está em uso/i);
  });

  it("backend indisponível", () => {
    expect(messageForCompanyError(err("SERVICE_UNAVAILABLE", 0))).toMatch(/indisponível/i);
  });

  it("código desconhecido preserva a mensagem do backend", () => {
    expect(messageForCompanyError(err("ALGO_NOVO", 400))).toBe("msg do backend");
  });

  it("erro não-API não vaza detalhe interno", () => {
    expect(messageForCompanyError(new Error("at Object.<anonymous>"))).toBe(
      "Não foi possível concluir a ação.",
    );
  });
});

describe("formatação", () => {
  it("data nula ou inválida vira travessão", () => {
    expect(formatDate(null)).toBe("—");
    expect(formatDate("lixo")).toBe("—");
    expect(formatDate("2026-07-14T01:48:03.982Z")).not.toBe("—");
  });
});
