"use client";

import Link from "next/link";
import { Megaphone, Plus, Target, User, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const createActions = [
  { label: "Novo contato", icon: User, href: "/contacts/new" },
  { label: "Nova oportunidade", icon: Target, href: "/deals/new" },
  { label: "Nova tarefa", icon: CheckSquare, href: "/tasks/new" },
  { label: "Nova campanha", icon: Megaphone, href: "/campaigns/new" },
];

export function CreateMenu({ compact = false }: { compact?: boolean }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {compact ? (
          <Button size="sm" aria-label="Criar" className="px-3">
            <Plus />
            <span className="hidden sm:inline">Criar</span>
          </Button>
        ) : (
          <Button size="sm">
            <Plus />
            Criar
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Criar novo</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {createActions.map((action) => {
          const Icon = action.icon;
          return (
            <DropdownMenuItem key={action.label} asChild>
              <Link href={action.href}>
                <Icon aria-hidden />
                {action.label}
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
