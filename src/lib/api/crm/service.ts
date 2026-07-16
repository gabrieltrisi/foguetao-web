import "server-only";
import { backendFetch } from "@/lib/api/http";
import { buildQuery, type QueryParams } from "@/lib/api/query-string";
import {
  contactSchema,
  contactListSchema,
  contactDetailSchema,
  noteSchema,
  noteListSchema,
  activitySchema,
  activityListSchema,
  tagSchema,
  tagListSchema,
  customFieldDefListSchema,
  organizationSchema,
  organizationListSchema,
  orgContactListSchema,
} from "@/types/api/crm";

interface Ctx {
  token: string;
  companyId: string;
}

/* ---------- Contacts ---------- */
export const crmService = {
  listContacts: ({ token, companyId }: Ctx, params?: QueryParams) =>
    backendFetch(`/contacts${buildQuery(params)}`, { token, companyId, schema: contactListSchema }),
  getContact: ({ token, companyId }: Ctx, id: string) =>
    backendFetch(`/contacts/${id}`, { token, companyId, schema: contactDetailSchema }),
  createContact: ({ token, companyId }: Ctx, body: unknown) =>
    backendFetch(`/contacts`, { method: "POST", token, companyId, body, schema: contactSchema }),
  updateContact: ({ token, companyId }: Ctx, id: string, body: unknown) =>
    backendFetch(`/contacts/${id}`, { method: "PATCH", token, companyId, body, schema: contactSchema }),
  deleteContact: ({ token, companyId }: Ctx, id: string) =>
    backendFetch(`/contacts/${id}`, { method: "DELETE", token, companyId }),
  archiveContact: ({ token, companyId }: Ctx, id: string) =>
    backendFetch(`/contacts/${id}/archive`, { method: "POST", token, companyId, schema: contactSchema }),
  restoreContact: ({ token, companyId }: Ctx, id: string) =>
    backendFetch(`/contacts/${id}/restore`, { method: "POST", token, companyId, schema: contactSchema }),
  timeline: ({ token, companyId }: Ctx, id: string, params?: QueryParams) =>
    backendFetch(`/contacts/${id}/timeline${buildQuery(params)}`, { token, companyId, schema: activityListSchema }),

  /* Notes */
  listNotes: ({ token, companyId }: Ctx, contactId: string, params?: QueryParams) =>
    backendFetch(`/contacts/${contactId}/notes${buildQuery(params)}`, { token, companyId, schema: noteListSchema }),
  createNote: ({ token, companyId }: Ctx, contactId: string, body: unknown) =>
    backendFetch(`/contacts/${contactId}/notes`, { method: "POST", token, companyId, body, schema: noteSchema }),
  updateNote: ({ token, companyId }: Ctx, contactId: string, noteId: string, body: unknown) =>
    backendFetch(`/contacts/${contactId}/notes/${noteId}`, { method: "PATCH", token, companyId, body, schema: noteSchema }),
  deleteNote: ({ token, companyId }: Ctx, contactId: string, noteId: string) =>
    backendFetch(`/contacts/${contactId}/notes/${noteId}`, { method: "DELETE", token, companyId }),

  /* Activities */
  listActivities: ({ token, companyId }: Ctx, contactId: string, params?: QueryParams) =>
    backendFetch(`/contacts/${contactId}/activities${buildQuery(params)}`, { token, companyId, schema: activityListSchema }),
  createActivity: ({ token, companyId }: Ctx, contactId: string, body: unknown) =>
    backendFetch(`/contacts/${contactId}/activities`, { method: "POST", token, companyId, body, schema: activitySchema }),

  /* Tags */
  listTags: ({ token, companyId }: Ctx, params?: QueryParams) =>
    backendFetch(`/tags${buildQuery(params)}`, { token, companyId, schema: tagListSchema }),
  getTag: ({ token, companyId }: Ctx, id: string) =>
    backendFetch(`/tags/${id}`, { token, companyId, schema: tagSchema }),
  createTag: ({ token, companyId }: Ctx, body: unknown) =>
    backendFetch(`/tags`, { method: "POST", token, companyId, body, schema: tagSchema }),
  updateTag: ({ token, companyId }: Ctx, id: string, body: unknown) =>
    backendFetch(`/tags/${id}`, { method: "PATCH", token, companyId, body, schema: tagSchema }),
  /** DELETE devolve `{ message }` — repassado sem reescrita. */
  deleteTag: ({ token, companyId }: Ctx, id: string) =>
    backendFetch(`/tags/${id}`, { method: "DELETE", token, companyId }),
  attachTag: ({ token, companyId }: Ctx, contactId: string, tagId: string) =>
    backendFetch(`/contacts/${contactId}/tags/${tagId}`, { method: "POST", token, companyId }),
  detachTag: ({ token, companyId }: Ctx, contactId: string, tagId: string) =>
    backendFetch(`/contacts/${contactId}/tags/${tagId}`, { method: "DELETE", token, companyId }),

  /* Custom fields */
  listCustomFieldDefs: ({ token, companyId }: Ctx, params?: QueryParams) =>
    backendFetch(`/custom-fields${buildQuery(params)}`, { token, companyId, schema: customFieldDefListSchema }),
  setContactCustomFields: ({ token, companyId }: Ctx, contactId: string, values: Record<string, unknown>) =>
    backendFetch(`/contacts/${contactId}/custom-fields`, { method: "PUT", token, companyId, body: { values } }),
  setOrgCustomFields: ({ token, companyId }: Ctx, orgId: string, values: Record<string, unknown>) =>
    backendFetch(`/organizations/${orgId}/custom-fields`, { method: "PUT", token, companyId, body: { values } }),

  /* Organizations */
  listOrganizations: ({ token, companyId }: Ctx, params?: QueryParams) =>
    backendFetch(`/organizations${buildQuery(params)}`, { token, companyId, schema: organizationListSchema }),
  getOrganization: ({ token, companyId }: Ctx, id: string) =>
    backendFetch(`/organizations/${id}`, { token, companyId, schema: organizationSchema }),
  createOrganization: ({ token, companyId }: Ctx, body: unknown) =>
    backendFetch(`/organizations`, { method: "POST", token, companyId, body, schema: organizationSchema }),
  updateOrganization: ({ token, companyId }: Ctx, id: string, body: unknown) =>
    backendFetch(`/organizations/${id}`, { method: "PATCH", token, companyId, body, schema: organizationSchema }),
  deleteOrganization: ({ token, companyId }: Ctx, id: string) =>
    backendFetch(`/organizations/${id}`, { method: "DELETE", token, companyId }),
  listOrgContacts: ({ token, companyId }: Ctx, id: string, params?: QueryParams) =>
    backendFetch(`/organizations/${id}/contacts${buildQuery(params)}`, { token, companyId, schema: orgContactListSchema }),
};
