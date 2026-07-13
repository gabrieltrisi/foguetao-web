"use client";

import { Megaphone, MessageCircle, Plus, Target, User, CheckSquare } from "lucide-react";
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
  { label: "Novo contato", icon: User },
  { label: "Nova oportunidade", icon: Target },
  { label: "Nova tarefa", icon: CheckSquare },
  { label: "Nova mensagem", icon: MessageCircle },
  { label: "Nova campanha", icon: Megaphone },
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
            <DropdownMenuItem key={action.label}>
              <Icon aria-hidden />
              {action.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
