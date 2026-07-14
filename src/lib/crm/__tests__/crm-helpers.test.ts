import { describe, it, expect } from "vitest";
import { crmQs } from "@/lib/api/crm/client";
import { contactStatusMeta, organizationSizeLabel, formatDate } from "@/lib/crm/display";

describe("crmQs (filtros/paginação → querystring)", () => {
  it("ignora vazios/undefined e serializa page/limit/search/status", () => {
    expect(crmQs({ page: 2, limit: 20, search: "ana", status: "LEAD", empty: "" })).toBe(
      "?page=2&limit=20&search=ana&status=LEAD",
    );
  });

  it("arrays viram chaves repetidas; sem params → string vazia", () => {
    expect(crmQs({ tagIds: ["a", "b"] })).toBe("?tagIds=a&tagIds=b");
    expect(crmQs()).toBe("");
    expect(crmQs({ tagIds: [] })).toBe("");
  });
});

describe("display CRM", () => {
  it("status do contato mapeia rótulo/tom pt-BR", () => {
    expect(contactStatusMeta.LEAD.label).toBe("Lead");
    expect(contactStatusMeta.CUSTOMER.tone).toBe("brand");
    expect(contactStatusMeta.ARCHIVED.label).toBe("Arquivado");
  });

  it("porte da organização mapeia rótulo", () => {
    expect(organizationSizeLabel.SMALL).toBe("Pequena");
    expect(organizationSizeLabel.ENTERPRISE).toBe("Enterprise");
  });

  it("formatDate tolera nulos", () => {
    expect(formatDate(null)).toBe("—");
    expect(formatDate("2026-07-14T00:00:00.000Z")).toMatch(/2026/);
  });
});
