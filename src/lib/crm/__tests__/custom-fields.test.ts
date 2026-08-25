import { describe, it, expect } from "vitest";
import {
  CUSTOM_FIELD_TYPES,
  CustomFieldFormatError,
  activeDefs,
  buildForm,
  displayValue,
  entityLabel,
  messageForCustomFieldError,
  missingRequired,
  optionsOf,
  requiresOptions,
  serializeValues,
  toFormValue,
  typeLabel,
} from "@/lib/crm/custom-fields";
import {
  customFieldDefSchema,
  customFieldValueSchema,
  customFieldValueListSchema,
  customFieldTypeSchema,
  customFieldEntitySchema,
} from "@/types/api/crm";
import { ApiError } from "@/types/api/error";
import type { ApiCustomFieldDef } from "@/types/api/crm";

function def(over: Partial<ApiCustomFieldDef> = {}): ApiCustomFieldDef {
  return {
    id: "f1",
    entityType: "CONTACT",
    name: "Segmento",
    key: "segmento",
    type: "TEXT",
    description: null,
    required: false,
    active: true,
    options: null,
    position: 0,
    ...over,
  } as ApiCustomFieldDef;
}

function apiError(statusCode: number, code: string, message = "x") {
  return new ApiError({ statusCode, code, message });
}

describe("enums reais do backend", () => {
  it("expõe exatamente os 12 tipos do enum CustomFieldType", () => {
    expect([...CUSTOM_FIELD_TYPES]).toEqual([
      "TEXT",
      "TEXTAREA",
      "NUMBER",
      "BOOLEAN",
      "DATE",
      "DATETIME",
      "SELECT",
      "MULTISELECT",
      "EMAIL",
      "PHONE",
      "URL",
      "JSON",
    ]);
  });

  it("NÃO existe CURRENCY (moeda não é um tipo do contrato)", () => {
    expect(CUSTOM_FIELD_TYPES).not.toContain("CURRENCY");
    expect(customFieldTypeSchema.safeParse("CURRENCY").success).toBe(false);
  });

  it("as entidades são apenas CONTACT e ORGANIZATION", () => {
    expect(customFieldEntitySchema.options).toEqual(["CONTACT", "ORGANIZATION"]);
  });

  it("só SELECT/MULTISELECT exigem opções", () => {
    expect(requiresOptions("SELECT")).toBe(true);
    expect(requiresOptions("MULTISELECT")).toBe(true);
    for (const t of ["TEXT", "NUMBER", "BOOLEAN", "JSON", "DATE"]) {
      expect(requiresOptions(t)).toBe(false);
    }
  });

  it("todo tipo tem rótulo legível", () => {
    for (const t of CUSTOM_FIELD_TYPES) expect(typeLabel(t)).toBeTruthy();
    expect(entityLabel("CONTACT")).toBe("Contato");
    expect(entityLabel("ORGANIZATION")).toBe("Organização");
  });
});

describe("schemas (contrato real)", () => {
  it("aceita a definição como o backend devolve", () => {
    const parsed = customFieldDefSchema.parse({
      id: "f1",
      entityType: "CONTACT",
      name: "Segmento",
      key: "segmento",
      type: "SELECT",
      description: null,
      required: true,
      active: true,
      options: ["A", "B"],
      position: 2,
    });
    expect(parsed.options).toEqual(["A", "B"]);
    expect(parsed.required).toBe(true);
  });

  it("aceita o valor como getValues devolve ({key,name,type,value})", () => {
    const parsed = customFieldValueSchema.parse({
      key: "segmento",
      name: "Segmento",
      type: "SELECT",
      value: "A",
    });
    expect(parsed.key).toBe("segmento");
    expect(customFieldValueListSchema.parse([]).length).toBe(0);
  });

  it("options normaliza para array mesmo quando nulo", () => {
    expect(optionsOf(def({ options: null }))).toEqual([]);
    expect(optionsOf(def({ options: ["X"] }))).toEqual(["X"]);
  });

  it("activeDefs descarta definições inativas", () => {
    const list = [def({ id: "a" }), def({ id: "b", active: false })];
    expect(activeDefs(list).map((d) => d.id)).toEqual(["a"]);
  });
});

describe("toFormValue / buildForm", () => {
  it("BOOLEAN vira boolean e MULTISELECT vira array", () => {
    expect(toFormValue("BOOLEAN", true)).toBe(true);
    expect(toFormValue("BOOLEAN", null)).toBe(false);
    expect(toFormValue("MULTISELECT", ["A"])).toEqual(["A"]);
    expect(toFormValue("MULTISELECT", null)).toEqual([]);
  });

  it("DATE corta para yyyy-mm-dd e DATETIME para o formato do input", () => {
    expect(toFormValue("DATE", "2026-07-15T12:30:00.000Z")).toBe("2026-07-15");
    expect(toFormValue("DATETIME", "2026-07-15T12:30:00.000Z")).toBe("2026-07-15T12:30");
  });

  it("JSON vira texto editável", () => {
    expect(toFormValue("JSON", { a: 1 })).toBe('{\n  "a": 1\n}');
  });

  it("buildForm casa definições com valores por key", () => {
    const form = buildForm(
      [def({ key: "segmento" }), def({ key: "vip", type: "BOOLEAN" })],
      [{ key: "segmento", name: "Segmento", type: "TEXT", value: "A" }],
    );
    expect(form).toEqual({ segmento: "A", vip: false });
  });
});

describe("serializeValues (espelha validateCustomFieldValue)", () => {
  it("texto vazio vira null — é assim que o contrato LIMPA o valor", () => {
    expect(serializeValues([def()], { segmento: "   " })).toEqual({ segmento: null });
  });

  it("BOOLEAN sempre envia boolean real (nunca string)", () => {
    const d = def({ key: "vip", type: "BOOLEAN" });
    expect(serializeValues([d], { vip: true })).toEqual({ vip: true });
    // false é valor legítimo, não "vazio"
    expect(serializeValues([d], { vip: false })).toEqual({ vip: false });
  });

  it("NUMBER envia number; texto não numérico é barrado no cliente", () => {
    const d = def({ key: "n", type: "NUMBER" });
    expect(serializeValues([d], { n: "12.5" })).toEqual({ n: 12.5 });
    expect(() => serializeValues([d], { n: "abc" })).toThrow(CustomFieldFormatError);
  });

  it("MULTISELECT envia array; vazio vira null", () => {
    const d = def({ key: "m", type: "MULTISELECT", options: ["A", "B"] });
    expect(serializeValues([d], { m: ["A", "B"] })).toEqual({ m: ["A", "B"] });
    expect(serializeValues([d], { m: [] })).toEqual({ m: null });
  });

  it("DATE/DATETIME viram ISO", () => {
    const d = def({ key: "d", type: "DATE" });
    expect(String(serializeValues([d], { d: "2026-07-15" }).d)).toContain("2026-07-15");
    expect(() => serializeValues([d], { d: "não-é-data" })).toThrow(CustomFieldFormatError);
  });

  it("JSON é parseado; inválido é barrado no cliente", () => {
    const d = def({ key: "j", type: "JSON" });
    expect(serializeValues([d], { j: '{"a":1}' })).toEqual({ j: { a: 1 } });
    expect(() => serializeValues([d], { j: "{nope" })).toThrow(CustomFieldFormatError);
  });

  it("texto simples é enviado como string", () => {
    expect(serializeValues([def({ key: "t", type: "TEXT" })], { t: " oi " })).toEqual({ t: "oi" });
  });
});

describe("missingRequired (espelha o enforce do backend)", () => {
  it("aponta obrigatório sem valor", () => {
    const d = def({ key: "req", required: true });
    expect(missingRequired([d], { req: null }).map((x) => x.key)).toEqual(["req"]);
    expect(missingRequired([d], { req: "ok" })).toEqual([]);
  });

  it("BOOLEAN false CONTA como preenchido", () => {
    const d = def({ key: "vip", type: "BOOLEAN", required: true });
    expect(missingRequired([d], { vip: false })).toEqual([]);
  });

  it("ignora campos não obrigatórios", () => {
    expect(missingRequired([def({ required: false })], { segmento: null })).toEqual([]);
  });
});

describe("displayValue", () => {
  it("formata por tipo", () => {
    expect(displayValue("BOOLEAN", true)).toBe("Sim");
    expect(displayValue("BOOLEAN", false)).toBe("Não");
    expect(displayValue("MULTISELECT", ["A", "B"])).toBe("A, B");
    expect(displayValue("TEXT", null)).toBe("—");
    expect(displayValue("TEXT", "x")).toBe("x");
    expect(displayValue("JSON", { a: 1 })).toBe('{"a":1}');
  });
});

describe("messageForCustomFieldError (códigos reais)", () => {
  it("mapeia todos os erros obrigatórios do módulo", () => {
    expect(messageForCustomFieldError(apiError(404, "CUSTOM_FIELD_NOT_FOUND"))).toMatch(/não encontrado/i);
    expect(messageForCustomFieldError(apiError(409, "CUSTOM_FIELD_KEY_ALREADY_EXISTS"))).toMatch(/já existe/i);
    expect(messageForCustomFieldError(apiError(409, "CUSTOM_FIELD_TYPE_IMMUTABLE"))).toMatch(/tipo não pode/i);
    expect(messageForCustomFieldError(apiError(400, "CUSTOM_FIELD_REQUIRED", "Campo obrigatório ausente: x"))).toMatch(/obrigatório/i);
    expect(messageForCustomFieldError(apiError(400, "CUSTOM_FIELD_OPTION_INVALID", "Valor fora das opções permitidas"))).toMatch(/opções/i);
    expect(messageForCustomFieldError(apiError(400, "CUSTOM_FIELD_INVALID_VALUE", "Número inválido"))).toBeTruthy();
    expect(messageForCustomFieldError(apiError(403, "INSUFFICIENT_PERMISSION"))).toMatch(/permissão/i);
    expect(messageForCustomFieldError(apiError(404, "ORGANIZATION_NOT_FOUND"))).toMatch(/organização/i);
    expect(messageForCustomFieldError(apiError(503, "SERVICE_UNAVAILABLE"))).toMatch(/indisponível/i);
  });

  it("mapeia o erro de formato do cliente", () => {
    expect(messageForCustomFieldError(new CustomFieldFormatError("Valor: número inválido"))).toMatch(/número inválido/i);
  });

  it("tem fallback", () => {
    expect(messageForCustomFieldError(new Error("boom"))).toBeTruthy();
  });
});
