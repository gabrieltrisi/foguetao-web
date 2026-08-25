/** Helpers de formatação pt-BR usados na UI (dados mockados). */

const numberFormatter = new Intl.NumberFormat("pt-BR");

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

const currencyFormatterCents = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** 12482 → "12.482" */
export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

/** 1284900 → "R$ 1.284.900" */
export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

/** 4280.5 → "R$ 4.280,50" */
export function formatCurrencyCents(value: number): string {
  return currencyFormatterCents.format(value);
}

/** 8.2 → "+8,2%" · -2.1 → "-2,1%" */
export function formatPercentDelta(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
}
