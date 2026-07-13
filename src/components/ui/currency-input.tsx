"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { formatCurrencyCents } from "@/lib/format";

export interface CurrencyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "defaultValue"> {
  /** Valor em reais. */
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
}

/** Campo de moeda BRL — digita-se apenas números; formata como R$ 1.234,56. */
export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, value, defaultValue = 0, onValueChange, ...props }, ref) => {
    const isControlled = value !== undefined;
    const [internal, setInternal] = React.useState(defaultValue);
    const current = isControlled ? value : internal;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const digits = e.target.value.replace(/\D/g, "");
      const reais = digits === "" ? 0 : Number(digits) / 100;
      if (!isControlled) setInternal(reais);
      onValueChange?.(reais);
    };

    return (
      <input
        ref={ref}
        inputMode="numeric"
        value={formatCurrencyCents(current)}
        onChange={handleChange}
        className={cn(
          "flex h-10 w-full rounded-lg border border-line bg-white px-3 text-body tabular-nums text-ink shadow-sm transition-colors",
          "focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/15 focus-visible:outline-none",
          "disabled:cursor-not-allowed disabled:bg-surface disabled:text-ink-3",
          className,
        )}
        {...props}
      />
    );
  },
);
CurrencyInput.displayName = "CurrencyInput";
