import { describe, it, expect } from "vitest";
import { queryKeys, crmInvalidation } from "@/lib/query/keys";

describe("query keys CRM", () => {
  it("chaves de contatos incluem filtros (para cache por filtro)", () => {
    const a = queryKeys.crm.contacts({ page: 1, status: "LEAD" });
    const b = queryKeys.crm.contacts({ page: 2, status: "LEAD" });
    expect(a).not.toEqual(b);
    expect(a[0]).toBe("crm");
    expect(a[1]).toBe("contacts");
  });

  it("chave de contato/organização por id", () => {
    expect(queryKeys.crm.contact("c1")).toEqual(["crm", "contact", "c1"]);
    expect(queryKeys.crm.organization("o1")).toEqual(["crm", "organization", "o1"]);
    expect(queryKeys.crm.orgContacts("o1")).toEqual(["crm", "organization", "o1", "contacts"]);
  });

  it("prefixos de invalidação são amplos e consistentes", () => {
    expect(crmInvalidation.allContacts).toEqual(["crm", "contacts"]);
    expect(crmInvalidation.contact("c1")).toEqual(["crm", "contact", "c1"]);
    // a invalidação de contato deve ser prefixo das subchaves (notas/atividades)
    const notes = queryKeys.crm.contactNotes("c1");
    expect(notes.slice(0, 3)).toEqual(crmInvalidation.contact("c1"));
  });

  it("chave de contatos é prefixada por allContacts (invalidação atinge todas)", () => {
    const key = queryKeys.crm.contacts({ page: 3 });
    expect(key.slice(0, 2)).toEqual(crmInvalidation.allContacts);
  });
});
