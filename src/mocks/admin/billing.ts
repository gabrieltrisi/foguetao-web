import type { Invoice, InvoiceStatus, PaymentMethod } from "@/types/admin";
import type { BadgeProps } from "@/components/ui/badge";

export const paymentMethod: PaymentMethod = {
  brand: "Visa",
  last4: "4821",
  expiry: "08/2028",
  holder: "Foguetão Tecnologia Ltda.",
};

export const nextCharge = {
  amount: 449,
  date: "01 ago 2026",
  plan: "Pro (mensal)",
};

export const invoices: Invoice[] = [
  { id: "inv-9", number: "FT-2026-0009", date: "01 jul 2026", amount: 449, status: "paid", plan: "Pro" },
  { id: "inv-8", number: "FT-2026-0008", date: "01 jun 2026", amount: 449, status: "paid", plan: "Pro" },
  { id: "inv-7", number: "FT-2026-0007", date: "01 mai 2026", amount: 449, status: "paid", plan: "Pro" },
  { id: "inv-6", number: "FT-2026-0006", date: "01 abr 2026", amount: 449, status: "paid", plan: "Pro" },
  { id: "inv-5", number: "FT-2026-0005", date: "01 mar 2026", amount: 149, status: "paid", plan: "Starter" },
  { id: "inv-4", number: "FT-2026-0004", date: "01 fev 2026", amount: 149, status: "failed", plan: "Starter" },
];

export const invoiceStatusLabel: Record<InvoiceStatus, string> = {
  paid: "Paga",
  pending: "Pendente",
  failed: "Falhou",
};

export const invoiceStatusTone: Record<InvoiceStatus, NonNullable<BadgeProps["tone"]>> = {
  paid: "success",
  pending: "warning",
  failed: "danger",
};
