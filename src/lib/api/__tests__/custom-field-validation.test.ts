import { describe, it, expect } from "vitest";
import {
  parseCustomFieldListQuery,
  parseCreateCustomFieldBody,
  parseUpdateCustomFieldBody,
  parseSetCustomFieldValuesBody,
  requireUuid,
} from "@/lib/api/validation";
import { queryKeys, crmInvalidation } from "@/lib/query/keys";
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

describe("parseCustomFieldListQuery (o backend só aceita entityType)", () => {
  it("aceita entityType válido e vazio", () => {
    expect(parseCustomFieldListQuery({ entityType: "CONTACT" })).toEqual({ entityType: "CONTACT" });
    expect(parseCustomFieldListQuery({})).toEqual({});
  });

  it("rejeita entidade fora do enum", () => {
    expectValidationError(() => parseCustomFieldListQuery({ entityType: "DEAL" }));
  });
});

describe("parseCreateCustomFieldBody (espelha CreateCustomFieldDto)", () => {
  const base = { entityType: "CONTACT", name: "Segmento", key: "segmento", type: "TEXT" };

  it("aceita o mínimo do contrato", () => {
    expect(parseCreateCustomFieldBody(base)).toMatchObject(base);
  });

  it("exige key no formato estável do backend", () => {
    expectValidationError(() => parseCreateCustomFieldBody({ ...base, key: "Segmento" }));
    expectValidationError(() => parseCreateCustomFieldBody({ ...base, key: "1seg" }));
    expectValidationError(() => parseCreateCustomFieldBody({ ...base, key: "seg-mento" }));
    expect(parseCreateCustomFieldBody({ ...base, key: "seg_mento_2" }).key).toBe("seg_mento_2");
  });

  it("rejeita tipo inexistente — inclusive CURRENCY", () => {
    expectValidationError(() => parseCreateCustomFieldBody({ ...base, type: "CURRENCY" }));
    expectValidationError(() => parseCreateCustomFieldBody({ ...base, type: "MOEDA" }));
  });

  it("exige options em SELECT/MULTISELECT", () => {
    expectValidationError(() => parseCreateCustomFieldBody({ ...base, type: "SELECT" }));
    expectValidationError(() =>
      parseCreateCustomFieldBody({ ...base, type: "MULTISELECT", options: [] }),
    );
    expect(
      parseCreateCustomFieldBody({ ...base, type: "SELECT", options: ["A"] }).options,
    ).toEqual(["A"]);
  });

  it("não exige options nos demais tipos", () => {
    expect(parseCreateCustomFieldBody({ ...base, type: "NUMBER" }).type).toBe("NUMBER");
  });

  it("rejeita entidade inválida e nome vazio", () => {
    expectValidationError(() => parseCreateCustomFieldBody({ ...base, entityType: "DEAL" }));
    expectValidationError(() => parseCreateCustomFieldBody({ ...base, name: "" }));
  });

  it("ignora `validation` — não faz parte do formulário (o backend não a usa)", () => {
    const out = parseCreateCustomFieldBody({ ...base, validation: { min: 1 } });
    expect(out.validation).toBeUndefined();
  });
});

describe("parseUpdateCustomFieldBody (key imutável)", () => {
  it("aceita atualização parcial", () => {
    expect(parseUpdateCustomFieldBody({ name: "Novo" })).toEqual({ name: "Novo" });
    expect(parseUpdateCustomFieldBody({ required: true })).toEqual({ required: true });
  });

  it("NÃO deixa passar key nem entityType (imutáveis)", () => {
    expect(parseUpdateCustomFieldBody({ name: "x", key: "outra" }).key).toBeUndefined();
    expect(parseUpdateCustomFieldBody({ name: "x", entityType: "ORGANIZATION" }).entityType).toBeUndefined();
  });

  it("rejeita corpo vazio", () => {
    expectValidationError(() => parseUpdateCustomFieldBody({}));
  });

  it("exige options ao mudar para SELECT/MULTISELECT", () => {
    expectValidationError(() => parseUpdateCustomFieldBody({ type: "SELECT" }));
    expect(parseUpdateCustomFieldBody({ type: "SELECT", options: ["A"] }).type).toBe("SELECT");
  });
});

describe("parseSetCustomFieldValuesBody (PUT em lote)", () => {
  it("aceita mapa key → valor, incluindo null (limpeza)", () => {
    expect(parseSetCustomFieldValuesBody({ values: { a: "x", b: null } })).toEqual({
      values: { a: "x", b: null },
    });
  });

  it("aceita mapa vazio", () => {
    expect(parseSetCustomFieldValuesBody({ values: {} })).toEqual({ values: {} });
  });

  it("rejeita corpo sem values ou com values não-objeto", () => {
    expectValidationError(() => parseSetCustomFieldValuesBody({}));
    expectValidationError(() => parseSetCustomFieldValuesBody({ values: "x" }));
  });

  it("NÃO valida o valor por tipo — isso é do backend, a autoridade final", () => {
    // um número onde o campo é BOOLEAN passa no BFF e é recusado pelo backend
    expect(parseSetCustomFieldValuesBody({ values: { vip: 123 } }).values.vip).toBe(123);
  });

  it("requireUuid protege as rotas de valores e de definição", () => {
    expect(requireUuid(UUID, "id")).toBe(UUID);
    expectValidationError(() => requireUuid("nao-uuid", "fieldId"));
  });
});

describe("query keys e invalidação", () => {
  it("definições variam por entidade", () => {
    expect(queryKeys.crm.customFieldDefs("CONTACT")).toEqual(["crm", "custom-fields", "CONTACT"]);
    expect(queryKeys.crm.customFieldDefs()).toEqual(["crm", "custom-fields", "all"]);
  });

  it("valores da organização têm chave própria sob a organização", () => {
    expect(queryKeys.crm.orgCustomFields("o1")).toEqual([
      "crm",
      "organization",
      "o1",
      "custom-fields",
    ]);
  });

  it("o prefixo de invalidação cobre as definições de todas as entidades", () => {
    expect(crmInvalidation.allCustomFieldDefs).toEqual(["crm", "custom-fields"]);
    for (const e of ["CONTACT", "ORGANIZATION", undefined]) {
      expect(queryKeys.crm.customFieldDefs(e).slice(0, 2)).toEqual(
        crmInvalidation.allCustomFieldDefs,
      );
    }
  });

  it("valores da organização são invalidados junto com a própria organização", () => {
    expect(queryKeys.crm.orgCustomFields("o1").slice(0, 3)).toEqual(crmInvalidation.organization("o1"));
  });
});
