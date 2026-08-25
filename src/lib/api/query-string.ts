/**
 * Construção de querystring compartilhada pelas camadas de API (server e
 * client). Fonte única: antes existiam quatro implementações equivalentes.
 *
 * Regras: valores `undefined`/`null`/"" são omitidos; arrays viram chaves
 * repetidas (`tagIds=a&tagIds=b`); arrays vazios são omitidos.
 */
export type QueryValue = string | number | boolean | string[] | undefined | null;
export type QueryParams = Record<string, QueryValue>;

export function buildQuery(params?: QueryParams): string {
  if (!params) return "";
  const sp = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value)) {
      value.forEach((item) => sp.append(key, item));
    } else {
      sp.set(key, String(value));
    }
  }

  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}
