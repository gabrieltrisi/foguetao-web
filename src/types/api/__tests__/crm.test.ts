import { describe, it, expect } from "vitest";
import {
  contactSchema,
  contactListSchema,
  contactDetailSchema,
  organizationSchema,
  organizationListSchema,
  tagSchema,
  noteSchema,
  activitySchema,
  customFieldDefSchema,
  orgContactSummarySchema,
  paginated,
} from "@/types/api/crm";
import { z } from "zod";
import { apiErrorFromResponse } from "@/types/api/error";

const contact = {
  id: "c1",
  firstName: "Maria",
  lastName: "Souza",
  fullName: "Maria Souza",
  email: "maria@x.com",
  phone: "11999",
  whatsappPhone: null,
  document: null,
  jobTitle: "CEO",
  status: "LEAD",
  source: "MANUAL",
  organizationId: null,
  assignedToUserId: "u1",
  lastActivityAt: "2026-07-14T00:00:00.000Z",
  createdAt: "2026-07-14T00:00:00.000Z",
  updatedAt: "2026-07-14T00:00:00.000Z",
};

describe("CRM Zod parsers", () => {
  it("valida contato e rejeita status inválido", () => {
    expect(contactSchema.parse(contact).status).toBe("LEAD");
    expect(() => contactSchema.parse({ ...contact, status: "FOO" })).toThrow();
  });

  it("valida lista paginada de contatos", () => {
    const list = contactListSchema.parse({ items: [contact], page: 1, limit: 20, total: 1, totalPages: 1 });
    expect(list.items).toHaveLength(1);
    expect(list.totalPages).toBe(1);
  });

  it("paginated() é genérico e valida o item", () => {
    const schema = paginated(z.object({ id: z.string() }));
    expect(schema.parse({ items: [{ id: "x" }], page: 1, limit: 10, total: 1, totalPages: 1 }).items[0].id).toBe("x");
    expect(() => schema.parse({ items: [{ id: 1 }], page: 1, limit: 10, total: 1, totalPages: 1 })).toThrow();
  });

  it("valida detalhe agregado do contato", () => {
    const detail = contactDetailSchema.parse({
      contact,
      organization: { id: "o1", name: "Acme" },
      assignee: { id: "u1", name: "Dev", email: "dev@x.com" },
      tags: [{ id: "t1", name: "VIP", color: "#f00" }],
      customFields: [],
      recentNotes: [],
      recentActivities: [],
      counters: { notes: 0, activities: 0, tags: 1 },
    });
    expect(detail.organization?.name).toBe("Acme");
    expect(detail.counters.tags).toBe(1);
  });

  it("valida organização, tag, nota, atividade, custom field, contato-resumo", () => {
    expect(organizationSchema.parse({ id: "o1", name: "Acme", legalName: null, document: null, email: null, phone: null, website: null, industry: "SaaS", size: "SMALL", address: null, createdAt: "x", updatedAt: "x" }).size).toBe("SMALL");
    expect(organizationListSchema.parse({ items: [], page: 1, limit: 20, total: 0, totalPages: 1 }).total).toBe(0);
    expect(tagSchema.parse({ id: "t", name: "VIP", color: null }).name).toBe("VIP");
    expect(noteSchema.parse({ id: "n", contactId: "c", authorUserId: "u", content: "oi", pinned: false, createdAt: "x", updatedAt: "x" }).pinned).toBe(false);
    expect(activitySchema.parse({ id: "a", contactId: "c", userId: "u", type: "CREATED", title: "t", description: null, occurredAt: "x", createdAt: "x" }).type).toBe("CREATED");
    expect(customFieldDefSchema.parse({ id: "f", entityType: "CONTACT", name: "Seg", key: "seg", type: "SELECT", description: null, required: false, active: true, options: ["A"] }).type).toBe("SELECT");
    expect(orgContactSummarySchema.parse({ id: "c", fullName: "Ana", email: null, status: "ACTIVE" }).status).toBe("ACTIVE");
  });

  it("mapeia erros de duplicidade/permição do backend (409/403/404)", () => {
    expect(apiErrorFromResponse(409, { statusCode: 409, code: "CONTACT_EMAIL_ALREADY_EXISTS", message: "dup" }).code).toBe("CONTACT_EMAIL_ALREADY_EXISTS");
    expect(apiErrorFromResponse(409, { statusCode: 409, code: "ORGANIZATION_HAS_CONTACTS", message: "x" }).statusCode).toBe(409);
    expect(apiErrorFromResponse(403, { statusCode: 403, code: "INSUFFICIENT_PERMISSION", message: "x" }).isForbidden).toBe(true);
    expect(apiErrorFromResponse(404, { statusCode: 404, code: "CONTACT_NOT_FOUND", message: "x" }).statusCode).toBe(404);
  });
});
