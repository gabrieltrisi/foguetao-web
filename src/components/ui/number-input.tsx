"use client";

import * as React from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NumberInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "defaultValue"> {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  (
    { className, value, defaultValue = 0, onValueChange, min, max, step = 1, disabled, ...props },
    ref,
  ) => {
    const isControlled = value !== undefined;
    const [internal, setInternal] = React.useState(defaultValue);
    const current = isControlled ? value : internal;

    const clamp = (n: number) => {
      let next = n;
      if (min !== undefined) next = Math.max(min, next);
      if (max !== undefined) next = Math.min(max, next);
      return next;
    };

    const commit = (next: number) => {
      const clamped = clamp(next);
      if (!isControlled) setInternal(clamped);
      onValueChange?.(clamped);
    };

    return (
      <div
        className={cn(
          "inline-flex h-10 items-stretch overflow-hidden rounded-lg border border-line bg-white shadow-sm focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/15",
          disabled && "opacity-50",
          className,
        )}
      >
        <button
          type="button"
          aria-label="Diminuir"
          disabled={disabled || (min !== undefined && current <= min)}
          onClick={() => commit(current - step)}
          className="flex w-9 items-center justify-center border-r border-line text-ink-2 transition-colors hover:bg-surface disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <Minus className="size-4" aria-hidden />
        </button>
        <input
          ref={ref}
          type="number"
          inputMode="numeric"
          value={Number.isNaN(current) ? "" : current}
          disabled={disabled}
          onChange={(e) => commit(e.target.value === "" ? 0 : Number(e.target.value))}
          className="w-16 [appearance:textfield] bg-transparent text-center text-body text-ink outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          {...props}
        />
        <button
          type="button"
          aria-label="Aumentar"
          disabled={disabled || (max !== undefined && current >= max)}
          onClick={() => commit(current + step)}
          className="flex w-9 items-center justify-center border-l border-line text-ink-2 transition-colors hover:bg-surface disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <Plus className="size-4" aria-hidden />
        </button>
      </div>
    );
  },
);
NumberInput.displayName = "NumberInput";
