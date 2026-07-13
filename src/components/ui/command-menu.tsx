"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { motion, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { softTransition } from "@/components/ui/motion";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export type CommandMenuItem = {
  label: string;
  icon?: LucideIcon;
  shortcut?: string;
  onSelect?: () => void;
};

export type CommandMenuGroup = {
  heading: string;
  items: CommandMenuItem[];
};

/**
 * Paleta de comandos (Ctrl/⌘+K).
 * Controlada por `open`/`onOpenChange`; `enableShortcut` liga o atalho global.
 */
export function CommandMenu({
  groups,
  open,
  onOpenChange,
  enableShortcut = false,
  placeholder = "Digite um comando ou busque…",
}: {
  groups: CommandMenuGroup[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enableShortcut?: boolean;
  placeholder?: string;
}) {
  const reduce = useReducedMotion();

  React.useEffect(() => {
    if (!enableShortcut) return;
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enableShortcut, open, onOpenChange]);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay asChild>
          <motion.div
            className="fixed inset-0 z-50 bg-ink/40"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          />
        </DialogPrimitive.Overlay>
        <DialogPrimitive.Content asChild aria-label="Paleta de comandos">
          <motion.div
            className="fixed left-1/2 top-[15%] z-50 w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 overflow-hidden rounded-xl border border-line bg-white shadow-lg"
            initial={reduce ? false : { opacity: 0, scale: 0.98, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={softTransition}
          >
            <DialogPrimitive.Title className="sr-only">Paleta de comandos</DialogPrimitive.Title>
            <DialogPrimitive.Description className="sr-only">
              Busque e execute ações rapidamente.
            </DialogPrimitive.Description>
            <Command>
              <CommandInput placeholder={placeholder} />
              <CommandList>
                <CommandEmpty>Nenhum resultado.</CommandEmpty>
                {groups.map((group) => (
                  <CommandGroup key={group.heading} heading={group.heading}>
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <CommandItem
                          key={item.label}
                          value={item.label}
                          onSelect={() => {
                            item.onSelect?.();
                            onOpenChange(false);
                          }}
                        >
                          {Icon ? <Icon aria-hidden /> : null}
                          <span className="flex-1">{item.label}</span>
                          {item.shortcut ? (
                            <kbd className="rounded border border-line bg-surface px-1.5 py-0.5 text-micro text-ink-3">
                              {item.shortcut}
                            </kbd>
                          ) : null}
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                ))}
              </CommandList>
            </Command>
          </motion.div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
