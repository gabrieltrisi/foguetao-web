"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export type ComboboxOption = { value: string; label: string; disabled?: boolean };

const triggerClass =
  "flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-line bg-white px-3 text-body2 text-ink shadow-sm transition-colors hover:bg-surface focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/15 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[state=open]:border-brand";

/** Seleção única pesquisável. */
export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Selecione…",
  searchPlaceholder = "Buscar…",
  emptyText = "Nada encontrado.",
  disabled,
  id,
  className,
}: {
  options: ComboboxOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          aria-haspopup="listbox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(triggerClass, className)}
        >
          <span className={cn("truncate", !selected && "text-ink-3")}>
            {selected?.label ?? placeholder}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 text-ink-3" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            {options.map((o) => (
              <CommandItem
                key={o.value}
                value={o.label}
                disabled={o.disabled}
                onSelect={() => {
                  onValueChange?.(o.value);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn("text-brand", o.value === value ? "opacity-100" : "opacity-0")}
                  aria-hidden
                />
                {o.label}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

/** Alias semântico para seleção única pesquisável. */
export const SearchableSelect = Combobox;

/** Seleção múltipla com chips e busca. */
export function MultiSelect({
  options,
  value = [],
  onValueChange,
  placeholder = "Selecione…",
  searchPlaceholder = "Buscar…",
  emptyText = "Nada encontrado.",
  disabled,
  id,
  className,
}: {
  options: ComboboxOption[];
  value?: string[];
  onValueChange?: (value: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const selectedOptions = options.filter((o) => value.includes(o.value));

  const toggle = (v: string) => {
    onValueChange?.(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          aria-haspopup="listbox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(triggerClass, "h-auto min-h-10 py-1.5", className)}
        >
          <span className="flex flex-1 flex-wrap gap-1">
            {selectedOptions.length === 0 ? (
              <span className="text-ink-3">{placeholder}</span>
            ) : (
              selectedOptions.map((o) => (
                <Badge key={o.value} tone="neutral" size="md" className="normal-case">
                  {o.label}
                  <X
                    className="size-3 cursor-pointer"
                    aria-hidden
                    onClick={(e) => {
                      e.stopPropagation();
                      toggle(o.value);
                    }}
                  />
                </Badge>
              ))
            )}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 text-ink-3" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            {options.map((o) => (
              <CommandItem
                key={o.value}
                value={o.label}
                disabled={o.disabled}
                onSelect={() => toggle(o.value)}
              >
                <Check
                  className={cn(
                    "text-brand",
                    value.includes(o.value) ? "opacity-100" : "opacity-0",
                  )}
                  aria-hidden
                />
                {o.label}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
