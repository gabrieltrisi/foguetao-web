import { describe, it, expect } from "vitest";
import { isValidMoney, parseMoneyInput, formatMoney, formatMoneyCompact } from "@/lib/crm/money";

describe("isValidMoney (string decimal canônica)", () => {
  it("aceita inteiros e até 2 casas", () => {
    expect(isValidMoney("0")).toBe(true);
    expect(isValidMoney("1500")).toBe(true);
    expect(isValidMoney("1500.5")).toBe(true);
    expect(isValidMoney("1500.50")).toBe(true);
  });

  it("rejeita negativo, vazio, texto e mais de 2 casas", () => {
    expect(isValidMoney("-1")).toBe(false);
    expect(isValidMoney("")).toBe(false);
    expect(isValidMoney("abc")).toBe(false);
    expect(isValidMoney("1.234")).toBe(false);
  });
});

describe("parseMoneyInput (entrada do usuário → string decimal)", () => {
  it("pt-BR com milhar e decimal", () => {
    expect(parseMoneyInput("1.500,50")).toBe("1500.50");
    expect(parseMoneyInput("2.000")).toBe("2000");
    expect(parseMoneyInput("R$ 1.234,56")).toBe("1234.56");
  });

  it("vírgula decimal simples e ponto decimal", () => {
    expect(parseMoneyInput("1500,5")).toBe("1500.5");
    expect(parseMoneyInput("1500.50")).toBe("1500.50");
    expect(parseMoneyInput("1500")).toBe("1500");
  });

  it("ponto com 3 dígitos é separador de milhar (pt-BR)", () => {
    expect(parseMoneyInput("10.999")).toBe("10999");
  });

  it("limita o decimal a 2 casas sem usar float", () => {
    expect(parseMoneyInput("10,999")).toBe("10.99");
    expect(parseMoneyInput("10.9999")).toBe("10.99");
  });

  it("devolve null para entradas inválidas", () => {
    expect(parseMoneyInput("")).toBeNull();
    expect(parseMoneyInput("abc")).toBeNull();
    expect(parseMoneyInput("--")).toBeNull();
  });

  it("preserva precisão de valores grandes (sem float)", () => {
    expect(parseMoneyInput("99999999999.99")).toBe("99999999999.99");
  });
});

describe("formatMoney (apenas apresentação)", () => {
  it("formata BRL a partir da string decimal", () => {
    const out = formatMoney("1500.50", "BRL");
    expect(out).toContain("1.500,50");
    expect(out).toMatch(/R\$/);
  });

  it("formata outras moedas", () => {
    expect(formatMoney("233940.00", "USD")).toContain("233.940,00");
  });

  it("tolera moeda desconhecida e valor não numérico", () => {
    expect(formatMoney("100.00", "XYZ")).toContain("100");
    expect(formatMoney("nao-numero", "BRL")).toBe("nao-numero");
  });

  it("compacto para cards", () => {
    expect(formatMoneyCompact("1500.00", "BRL")).toMatch(/mil/i);
  });
});
