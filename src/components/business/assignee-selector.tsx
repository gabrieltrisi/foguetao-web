"use client";

import * as React from "react";
import { Check, ChevronsUpDown, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { EntityAvatar } from "@/components/business/entity-avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export type Person = { id: string; name: string };

/** Seletor de responsável (avatar + nome, pesquisável). */
export function AssigneeSelector({
  people,
  value,
  onValueChange,
  placeholder = "Atribuir a…",
  id,
  className,
}: {
  people: Person[];
  value?: string;
  onValueChange?: (id: string) => void;
  placeholder?: string;
  id?: string;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const selected = people.find((p) => p.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          aria-haspopup="listbox"
          aria-expanded={open}
          className={cn(
            "flex h-10 w-full items-center gap-2 rounded-lg border border-line bg-white px-3 text-body2 shadow-sm transition-colors hover:bg-surface focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/15 focus-visible:outline-none data-[state=open]:border-brand",
            className,
          )}
        >
          {selected ? (
            <>
              <EntityAvatar name={selected.name} size="sm" className="size-6 text-[10px]" />
              <span className="flex-1 truncate text-left text-ink">{selected.name}</span>
            </>
          ) : (
            <>
              <UserPlus className="size-4 text-ink-3" aria-hidden />
              <span className="flex-1 truncate text-left text-ink-3">{placeholder}</span>
            </>
          )}
          <ChevronsUpDown className="size-4 shrink-0 text-ink-3" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandInput placeholder="Buscar pessoa…" />
          <CommandList>
            <CommandEmpty>Ninguém encontrado.</CommandEmpty>
            {people.map((p) => (
              <CommandItem
                key={p.id}
                value={p.name}
                onSelect={() => {
                  onValueChange?.(p.id);
                  setOpen(false);
                }}
              >
                <EntityAvatar name={p.name} size="sm" className="size-6 text-[10px]" />
                <span className="flex-1">{p.name}</span>
                {p.id === value ? <Check className="size-4 text-brand" aria-hidden /> : null}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
