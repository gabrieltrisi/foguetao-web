"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/toast";
import { useSession } from "@/providers/session-provider";
import { isApiError } from "@/types/api/error";

const planLabel: Record<string, string> = {
  FREE: "Free",
  STARTER: "Starter",
  PRO: "Pro",
  ENTERPRISE: "Enterprise",
};

export function CompanySwitcher() {
  const { toast } = useToast();
  const { companies, activeCompanyId, activeCompany, switchCompany, isSwitchingCompany } =
    useSession();

  if (companies.length === 0) {
    return null;
  }

  const label = activeCompany?.name ?? companies[0]?.name ?? "Empresa";

  async function handleSelect(id: string) {
    if (id === activeCompanyId) return;
    try {
      await switchCompany(id);
    } catch (error) {
      toast({
        title: "Não foi possível trocar de empresa",
        description:
          isApiError(error) && error.isForbidden ? "Você não tem acesso a esta empresa." : undefined,
        variant: "error",
      });
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          disabled={isSwitchingCompany}
          className="flex h-9 items-center gap-2 rounded-lg border border-line bg-white px-2.5 text-body2 text-ink transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-60"
        >
          <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-brand text-micro font-bold text-white">
            F
          </span>
          <span className="hidden max-w-[160px] truncate font-medium sm:inline">{label}</span>
          {isSwitchingCompany ? (
            <Loader2 className="size-4 shrink-0 animate-spin text-ink-3" aria-hidden />
          ) : (
            <ChevronsUpDown className="size-4 shrink-0 text-ink-3" aria-hidden />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>Empresas</DropdownMenuLabel>
        {companies.map((company) => (
          <DropdownMenuItem
            key={company.id}
            onSelect={(e) => {
              e.preventDefault();
              void handleSelect(company.id);
            }}
            className="justify-between"
          >
            <span className="flex items-center gap-2">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-brand text-micro font-bold text-white">
                F
              </span>
              <span className="min-w-0">
                <span className="block truncate">{company.name}</span>
                <span className="block text-caption text-ink-3">
                  {planLabel[company.plan] ?? company.plan}
                </span>
              </span>
            </span>
            <Check
              className={cn(
                "size-4 text-brand",
                company.id === activeCompanyId ? "opacity-100" : "opacity-0",
              )}
              aria-hidden
            />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
