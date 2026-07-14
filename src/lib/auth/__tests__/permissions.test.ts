import { describe, it, expect } from "vitest";
import { can, canAny, canAll } from "@/lib/auth/permissions";

const perms = ["company.read", "company.members.read", "crm.contacts.read"];

describe("permission helpers", () => {
  it("can: verifica permissão exata", () => {
    expect(can(perms, "company.read")).toBe(true);
    expect(can(perms, "company.update")).toBe(false);
  });

  it("canAny: verdadeiro se ao menos uma permissão existe", () => {
    expect(canAny(perms, ["company.update", "company.members.read"])).toBe(true);
    expect(canAny(perms, ["company.update", "company.delete"])).toBe(false);
    expect(canAny(perms, [])).toBe(true); // vazio = sem exigência
  });

  it("canAll: verdadeiro apenas se todas existem", () => {
    expect(canAll(perms, ["company.read", "crm.contacts.read"])).toBe(true);
    expect(canAll(perms, ["company.read", "company.delete"])).toBe(false);
    expect(canAll(perms, [])).toBe(true);
  });

  it("lista vazia de permissões nega tudo (exceto exigência vazia)", () => {
    expect(can([], "company.read")).toBe(false);
    expect(canAny([], ["company.read"])).toBe(false);
    expect(canAll([], ["company.read"])).toBe(false);
  });
});
