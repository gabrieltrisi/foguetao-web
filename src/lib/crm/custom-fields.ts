import { isApiError } from "@/types/api/error";
import type { ApiCustomFieldDef, ApiCustomFieldValue, CustomFieldEntity } from "@/types/api/crm";

/**
 * Apresentação e serialização de campos personalizados.
 *
 * A serialização espelha `validateCustomFieldValue` do backend, que é a
 * autoridade final. Pontos que o backend exige e que ditam o formato enviado:
 * - BOOLEAN precisa ser boolean de verdade (não a string "true");
 * - NUMBER aceita number ou string numérica finita;
 * - DATE/DATETIME aceitam string ISO;
 * - MULTISELECT precisa ser array de strings sem duplicatas;
 * - SELECT/MULTISELECT só aceitam valores presentes em `options`;
 * - JSON precisa ser objeto ou array;
 * - `null` LIMPA o valor (o backend apaga a linha).
 */

export const CUSTOM_FIELD_TYPES = [
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
] as const;

export type CustomFieldType = (typeof CUSTOM_FIELD_TYPES)[number];

/** Tipos que exigem `options` — mesma regra do CustomFieldsService. */
export const OPTION_TYPES: readonly CustomFieldType[] = ["SELECT", "MULTISELECT"];

export function requiresOptions(type: string): boolean {
  return OPTION_TYPES.includes(type as CustomFieldType);
}

export const customFieldTypeLabel: Record<CustomFieldType, string> = {
  TEXT: "Texto",
  TEXTAREA: "Texto longo",
  NUMBER: "Número",
  BOOLEAN: "Sim/Não",
  DATE: "Data",
  DATETIME: "Data e hora",
  SELECT: "Seleção",
  MULTISELECT: "Múltipla seleção",
  EMAIL: "E-mail",
  PHONE: "Telefone",
  URL: "URL",
  JSON: "JSON",
};

export const customFieldEntityLabel: Record<CustomFieldEntity, string> = {
  CONTACT: "Contato",
  ORGANIZATION: "Organização",
};

export function typeLabel(type: string): string {
  return customFieldTypeLabel[type as CustomFieldType] ?? type;
}

export function entityLabel(entity: string): string {
  return customFieldEntityLabel[entity as CustomFieldEntity] ?? entity;
}

/** `options` chega como JSON do backend; normaliza para string[]. */
export function optionsOf(def: Pick<ApiCustomFieldDef, "options">): string[] {
  return Array.isArray(def.options) ? def.options : [];
}

/** Definições ativas, na ordem real (`position` asc — o backend já ordena). */
export function activeDefs(defs: readonly ApiCustomFieldDef[]): ApiCustomFieldDef[] {
  return defs.filter((d) => d.active);
}

/* ---------- Estado do formulário ---------- */

/**
 * Estado editável: `string` para entradas de texto/data/número/select/json,
 * `boolean` para BOOLEAN e `string[]` para MULTISELECT. A conversão para o
 * formato do contrato acontece em `serializeValues`.
 */
export type FieldFormValue = string | boolean | string[];
export type CustomFieldForm = Record<string, FieldFormValue>;

/** Converte o valor vindo do backend para o estado do formulário. */
export function toFormValue(type: string, value: unknown): FieldFormValue {
  if (type === "BOOLEAN") return value === true;
  if (type === "MULTISELECT") return Array.isArray(value) ? (value as string[]) : [];
  if (value === null || value === undefined) return "";
  if (type === "DATE") return typeof value === "string" ? value.slice(0, 10) : String(value);
  if (type === "DATETIME") return typeof value === "string" ? value.slice(0, 16) : String(value);
  if (type === "JSON") return typeof value === "string" ? value : JSON.stringify(value, null, 2);
  return String(value);
}

/** Monta o estado inicial do formulário a partir das definições + valores. */
export function buildForm(
  defs: readonly ApiCustomFieldDef[],
  values: readonly ApiCustomFieldValue[],
): CustomFieldForm {
  const byKey = new Map(values.map((v) => [v.key, v.value]));
  const form: CustomFieldForm = {};
  for (const def of defs) {
    form[def.key] = toFormValue(def.type, byKey.get(def.key) ?? null);
  }
  return form;
}

/* ---------- Serialização ---------- */

export class CustomFieldFormatError extends Error {}

/**
 * Converte o formulário para o payload do PUT em lote. Campos vazios viram
 * `null` — que é como o contrato LIMPA o valor. Lança `CustomFieldFormatError`
 * apenas nos formatos que dá para checar no cliente (número e JSON); o resto
 * é validado pelo backend, que continua sendo a autoridade.
 */
export function serializeValues(
  defs: readonly ApiCustomFieldDef[],
  form: CustomFieldForm,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};

  for (const def of defs) {
    const raw = form[def.key];

    if (def.type === "BOOLEAN") {
      // BOOLEAN não tem "vazio": false é um valor legítimo.
      out[def.key] = raw === true;
      continue;
    }

    if (def.type === "MULTISELECT") {
      const list = Array.isArray(raw) ? raw : [];
      out[def.key] = list.length > 0 ? list : null;
      continue;
    }

    const text = typeof raw === "string" ? raw.trim() : "";
    if (text === "") {
      out[def.key] = null; // limpa
      continue;
    }

    switch (def.type) {
      case "NUMBER": {
        const num = Number(text);
        if (!Number.isFinite(num)) {
          throw new CustomFieldFormatError(`${def.name}: número inválido`);
        }
        out[def.key] = num;
        break;
      }
      case "JSON": {
        try {
          out[def.key] = JSON.parse(text);
        } catch {
          throw new CustomFieldFormatError(`${def.name}: JSON inválido`);
        }
        break;
      }
      case "DATE":
      case "DATETIME": {
        const date = new Date(text);
        if (Number.isNaN(date.getTime())) {
          throw new CustomFieldFormatError(`${def.name}: data inválida`);
        }
        out[def.key] = date.toISOString();
        break;
      }
      default:
        out[def.key] = text;
    }
  }

  return out;
}

/** Campos obrigatórios sem valor — espelha o enforce de `required` do backend. */
export function missingRequired(
  defs: readonly ApiCustomFieldDef[],
  payload: Record<string, unknown>,
): ApiCustomFieldDef[] {
  return defs.filter((def) => {
    if (!def.required) return false;
    const v = payload[def.key];
    // BOOLEAN=false conta como preenchido; só null/undefined é ausência.
    return v === null || v === undefined;
  });
}

/* ---------- Exibição ---------- */

/** Formata o valor para leitura. */
export function displayValue(type: string, value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  switch (type) {
    case "BOOLEAN":
      return value === true ? "Sim" : "Não";
    case "MULTISELECT":
      return Array.isArray(value) && value.length > 0 ? (value as string[]).join(", ") : "—";
    case "DATE":
      return formatIso(value, false);
    case "DATETIME":
      return formatIso(value, true);
    case "JSON":
      return typeof value === "string" ? value : JSON.stringify(value);
    default:
      return String(value);
  }
}

function formatIso(value: unknown, withTime: boolean): string {
  if (typeof value !== "string") return String(value);
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

/* ---------- Erros ---------- */

/** Mensagens dos ErrorCodes REAIS do módulo de campos personalizados. */
export function messageForCustomFieldError(error: unknown): string {
  if (isApiError(error)) {
    switch (error.code) {
      case "CUSTOM_FIELD_NOT_FOUND":
        return "Campo personalizado não encontrado.";
      case "CUSTOM_FIELD_KEY_ALREADY_EXISTS":
        return "Já existe um campo com essa key nesta entidade.";
      case "CUSTOM_FIELD_TYPE_IMMUTABLE":
        return "O tipo não pode ser alterado: já existem valores gravados.";
      case "CUSTOM_FIELD_REQUIRED":
        return error.message || "Preencha os campos obrigatórios.";
      case "CUSTOM_FIELD_OPTION_INVALID":
        return error.message || "Valor fora das opções permitidas.";
      case "CUSTOM_FIELD_INVALID_VALUE":
        return error.message || "Valor inválido para o tipo do campo.";
      case "CONTACT_NOT_FOUND":
        return "Contato não encontrado.";
      case "ORGANIZATION_NOT_FOUND":
        return "Organização não encontrada.";
      case "INSUFFICIENT_PERMISSION":
      case "INSUFFICIENT_ROLE":
        return "Você não tem permissão para esta ação.";
      case "VALIDATION_ERROR":
        return error.message || "Dados inválidos.";
      default:
        if (error.isForbidden) return "Você não tem permissão para esta ação.";
        if (error.isUnavailable) return "Servidor indisponível. Tente novamente em instantes.";
        return error.message;
    }
  }
  if (error instanceof CustomFieldFormatError) return error.message;
  return "Não foi possível concluir a ação.";
}
