"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/** Aplica máscara de telefone brasileiro: (11) 91234-5678. */
function maskPhone(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export interface PhoneInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "defaultValue"> {
  value?: string;
  defaultValue?: string;
  /** Recebe apenas os dígitos. */
  onValueChange?: (digits: string) => void;
}

export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, value, defaultValue = "", onValueChange, ...props }, ref) => {
    const isControlled = value !== undefined;
    const [internal, setInternal] = React.useState(defaultValue);
    const current = isControlled ? value : internal;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
      if (!isControlled) setInternal(digits);
      onValueChange?.(digits);
    };

    return (
      <input
        ref={ref}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        value={maskPhone(current)}
        onChange={handleChange}
        placeholder="(11) 91234-5678"
        className={cn(
          "flex h-10 w-full rounded-lg border border-line bg-white px-3 text-body text-ink shadow-sm transition-colors",
          "placeholder:text-ink-3",
          "focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/15 focus-visible:outline-none",
          "disabled:cursor-not-allowed disabled:bg-surface disabled:text-ink-3",
          className,
        )}
        {...props}
      />
    );
  },
);
PhoneInput.displayName = "PhoneInput";
