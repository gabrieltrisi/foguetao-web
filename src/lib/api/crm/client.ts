"use client";

import { clientFetch } from "@/lib/api/client";
import { buildQuery } from "@/lib/api/query-string";
import type {
  ApiContact,
  ApiContactDetail,
  ApiNote,
  ApiActivity,
  ApiOrganization,
  Paginated,
  ApiTag,
  ApiCustomFieldDef,
  ApiCustomFieldValue,
  ApiOrgContactSummary,
} from "@/types/api/crm";

export type ContactFilters = Record<string, string | number | string[] | undefined>;

/**
 * Corpo de criação/edição de definição — espelha Create/UpdateCustomFieldDto.
 * `key` e `entityType` só existem na criação (a key é imutável); `validation`
 * é omitido de propósito: o backend armazena mas NÃO usa na validação real.
 */
export interface CustomFieldDefInput {
  entityType?: string;
  name?: string;
  key?: string;
  type?: string;
  description?: string;
  required?: boolean;
  active?: boolean;
  options?: string[];
  position?: number;
}

/** Corpo de criação/edição de tag — espelha Create/UpdateTagDto. */
export interface TagInput {
  name?: string;
  color?: string;
  description?: string;
}

/** Filtros de GET /tags (paginação + busca + ordenação reais). */
export interface TagFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "createdAt" | "name";
  sortOrder?: "asc" | "desc";
  [key: string]: string | number | undefined;
}

/** Mantido como alias tipado de `buildQuery` para os filtros de CRM. */
export function crmQs(params?: ContactFilters): string {
  return buildQuery(params);
}

const B = "/api/crm";

/** Cliente CRM do browser → BFF. Respostas já validadas por Zod no servidor. */
export const crmApi = {
  // Contacts
  listContacts: (params?: ContactFilters) =>
    clientFetch<Paginated<ApiContact>>(`${B}/contacts${crmQs(params)}`),
  getContact: (id: string) => clientFetch<ApiContactDetail>(`${B}/contacts/${id}`),
  createContact: (body: unknown) => clientFetch<ApiContact>(`${B}/contacts`, { method: "POST", body }),
  updateContact: (id: string, body: unknown) =>
    clientFetch<ApiContact>(`${B}/contacts/${id}`, { method: "PATCH", body }),
  deleteContact: (id: string) => clientFetch(`${B}/contacts/${id}`, { method: "DELETE" }),
  archiveContact: (id: string) => clientFetch<ApiContact>(`${B}/contacts/${id}/archive`, { method: "POST" }),
  restoreContact: (id: string) => clientFetch<ApiContact>(`${B}/contacts/${id}/restore`, { method: "POST" }),

  // Notes
  listNotes: (id: string) => clientFetch<Paginated<ApiNote>>(`${B}/contacts/${id}/notes`),
  createNote: (id: string, body: { content: string; pinned?: boolean }) =>
    clientFetch<ApiNote>(`${B}/contacts/${id}/notes`, { method: "POST", body }),
  updateNote: (id: string, noteId: string, body: unknown) =>
    clientFetch<ApiNote>(`${B}/contacts/${id}/notes/${noteId}`, { method: "PATCH", body }),
  deleteNote: (id: string, noteId: string) =>
    clientFetch(`${B}/contacts/${id}/notes/${noteId}`, { method: "DELETE" }),

  // Activities
  listActivities: (id: string) => clientFetch<Paginated<ApiActivity>>(`${B}/contacts/${id}/activities`),
  createActivity: (id: string, body: unknown) =>
    clientFetch<ApiActivity>(`${B}/contacts/${id}/activities`, { method: "POST", body }),

  // Tags
  /** Lista enxuta para associação em contatos (combobox). */
  listTags: () => clientFetch<Paginated<ApiTag>>(`${B}/tags?limit=100`),
  /** Lista paginada para a gestão de tags (busca/ordenação do servidor). */
  listTagsPaged: (params?: TagFilters) =>
    clientFetch<Paginated<ApiTag>>(`${B}/tags${crmQs(params)}`),
  createTag: (body: TagInput) => clientFetch<ApiTag>(`${B}/tags`, { method: "POST", body }),
  updateTag: (id: string, body: TagInput) =>
    clientFetch<ApiTag>(`${B}/tags/${id}`, { method: "PATCH", body }),
  deleteTag: (id: string) => clientFetch(`${B}/tags/${id}`, { method: "DELETE" }),
  attachTag: (id: string, tagId: string) =>
    clientFetch(`${B}/contacts/${id}/tags/${tagId}`, { method: "POST" }),
  detachTag: (id: string, tagId: string) =>
    clientFetch(`${B}/contacts/${id}/tags/${tagId}`, { method: "DELETE" }),

  // Custom fields — definições
  listCustomFieldDefs: (entityType?: string) =>
    clientFetch<ApiCustomFieldDef[]>(`${B}/custom-fields${crmQs({ entityType })}`),
  createCustomFieldDef: (body: CustomFieldDefInput) =>
    clientFetch<ApiCustomFieldDef>(`${B}/custom-fields`, { method: "POST", body }),
  updateCustomFieldDef: (id: string, body: CustomFieldDefInput) =>
    clientFetch<ApiCustomFieldDef>(`${B}/custom-fields/${id}`, { method: "PATCH", body }),
  deleteCustomFieldDef: (id: string) =>
    clientFetch(`${B}/custom-fields/${id}`, { method: "DELETE" }),

  // Custom fields — valores (PUT em lote; `null` limpa o valor)
  setContactCustomFields: (id: string, values: Record<string, unknown>) =>
    clientFetch(`${B}/contacts/${id}/custom-fields`, { method: "PUT", body: { values } }),
  getOrgCustomFields: (id: string) =>
    clientFetch<ApiCustomFieldValue[]>(`${B}/organizations/${id}/custom-fields`),
  setOrgCustomFields: (id: string, values: Record<string, unknown>) =>
    clientFetch(`${B}/organizations/${id}/custom-fields`, { method: "PUT", body: { values } }),

  // Organizations
  listOrganizations: (params?: ContactFilters) =>
    clientFetch<Paginated<ApiOrganization>>(`${B}/organizations${crmQs(params)}`),
  getOrganization: (id: string) => clientFetch<ApiOrganization>(`${B}/organizations/${id}`),
  createOrganization: (body: unknown) =>
    clientFetch<ApiOrganization>(`${B}/organizations`, { method: "POST", body }),
  updateOrganization: (id: string, body: unknown) =>
    clientFetch<ApiOrganization>(`${B}/organizations/${id}`, { method: "PATCH", body }),
  deleteOrganization: (id: string) => clientFetch(`${B}/organizations/${id}`, { method: "DELETE" }),
  listOrgContacts: (id: string, params?: ContactFilters) =>
    clientFetch<Paginated<ApiOrgContactSummary>>(`${B}/organizations/${id}/contacts${crmQs(params)}`),
};
