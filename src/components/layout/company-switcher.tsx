"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { companies, defaultCompanyId } from "@/mocks/account";

export function CompanySwitcher() {
  const [selectedId, setSelectedId] = React.useState(defaultCompanyId);
  const selected = companies.find((c) => c.id === selectedId) ?? companies[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex h-9 items-center gap-2 rounded-lg border border-line bg-white px-2.5 text-body2 text-ink transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-brand text-micro font-bold text-white">
            F
          </span>
          <span className="hidden max-w-[160px] truncate font-medium sm:inline">
            {selected.name}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 text-ink-3" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>Empresas</DropdownMenuLabel>
        {companies.map((company) => (
          <DropdownMenuItem
            key={company.id}
            onSelect={() => setSelectedId(company.id)}
            className="justify-between"
          >
            <span className="flex items-center gap-2">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-brand text-micro font-bold text-white">
                F
              </span>
              <span className="min-w-0">
                <span className="block truncate">{company.name}</span>
                <span className="block text-caption text-ink-3">{company.plan}</span>
              </span>
            </span>
            <Check
              className={cn(
                "size-4 text-brand",
                company.id === selectedId ? "opacity-100" : "opacity-0",
              )}
              aria-hidden
            />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
