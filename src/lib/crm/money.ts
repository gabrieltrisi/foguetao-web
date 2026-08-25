/**
 * Utilidades monetárias. O backend usa Decimal e devolve `value`/`weightedValue`
 * como STRING. A regra do projeto: a string decimal é a fonte de verdade e
 * atravessa toda a aplicação; number só aparece na FORMATAÇÃO de apresentação.
 */

/** Aceita "1500", "1500.50", "0" — não aceita negativo, vazio ou não numérico. */
export function isValidMoney(value: string): boolean {
  return /^\d+(\.\d{1,2})?$/.test(value.trim());
}

/**
 * Converte o que o usuário digitou (pt-BR ou simples) numa string decimal
 * canônica para o backend: "1.500,50" → "1500.50"; "1500,5" → "1500.5";
 * "R$ 2.000" → "2000". Retorna null quando não for um valor monetário válido.
 */
export function parseMoneyInput(input: string): string | null {
  const cleaned = input.replace(/[^\d.,-]/g, "").trim();
  if (!cleaned) return null;

  let normalized = cleaned;
  const hasComma = cleaned.includes(",");
  const hasDot = cleaned.includes(".");

  if (hasComma && hasDot) {
    // formato pt-BR: ponto é separador de milhar, vírgula é decimal
    normalized = cleaned.replace(/\./g, "").replace(",", ".");
  } else if (hasComma) {
    normalized = cleaned.replace(",", ".");
  } else if (hasDot) {
    // "1.500" (milhar) vs "1500.50" (decimal): 3 dígitos após o ponto → milhar
    const parts = cleaned.split(".");
    const isThousands = parts.length > 1 && parts.slice(1).every((p) => p.length === 3);
    normalized = isThousands ? parts.join("") : cleaned;
  }

  if (!/^\d+(\.\d+)?$/.test(normalized)) return null;
  // limita a 2 casas decimais sem usar float
  const [int, dec] = normalized.split(".");
  return dec === undefined ? int : `${int}.${dec.slice(0, 2)}`;
}

/**
 * Formata uma string decimal para exibição (pt-BR). A conversão para number
 * acontece APENAS aqui, na apresentação — nunca na persistência.
 */
export function formatMoney(value: string, currency = "BRL"): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return value;
  try {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    // moeda desconhecida → formata só o número com o código
    return `${currency} ${new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2 }).format(n)}`;
  }
}

/** Formata de forma compacta para chips/cards: R$ 1,2 mil / R$ 3,4 mi. */
export function formatMoneyCompact(value: string, currency = "BRL"): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return value;
  try {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency,
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(n);
  } catch {
    return `${currency} ${n}`;
  }
}
