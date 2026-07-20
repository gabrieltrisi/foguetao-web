"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import Link from "next/link";
import { X } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Logo } from "@/components/brand/logo";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarBody } from "@/components/layout/sidebar-body";
import { softTransition } from "@/components/ui/motion";
import { useSidebar } from "@/hooks/use-sidebar";

/**
 * Drawer de navegação para mobile.
 * Radix Dialog fornece focus trap, fechar no Escape e no clique fora.
 * A entrada é animada com Framer Motion (respeita prefers-reduced-motion).
 */
export function MobileDrawer() {
  const { mobileOpen, setMobileOpen } = useSidebar();
  const reduce = useReducedMotion();

  return (
    <DialogPrimitive.Root open={mobileOpen} onOpenChange={setMobileOpen}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay asChild>
          <motion.div
            className="fixed inset-0 z-50 bg-ink/40 lg:hidden"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          />
        </DialogPrimitive.Overlay>
        <DialogPrimitive.Content asChild aria-label="Menu de navegação">
          <motion.div
            className="fixed inset-y-0 left-0 z-50 flex w-[280px] max-w-[85vw] flex-col bg-white shadow-lg lg:hidden"
            initial={reduce ? false : { x: "-100%" }}
            animate={{ x: 0 }}
            transition={softTransition}
          >
            <DialogPrimitive.Title className="sr-only">Menu de navegação</DialogPrimitive.Title>
            <DialogPrimitive.Description className="sr-only">
              Navegue entre as seções do Foguetão.
            </DialogPrimitive.Description>
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-4">
              <Link
                href="/dashboard"
                aria-label="Foguetão — Visão geral"
                onClick={() => setMobileOpen(false)}
                className="flex items-center rounded-md"
              >
                <Logo variant="sidebar" className="h-9 w-auto dark:hidden" />
                <Logo variant="mono" white className="hidden h-9 w-auto dark:block" />
              </Link>
              <DialogPrimitive.Close
                aria-label="Fechar menu"
                className="flex size-9 items-center justify-center rounded-md text-ink-2 transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <X className="size-5" aria-hidden />
              </DialogPrimitive.Close>
            </div>

            <TooltipProvider>
              <SidebarBody collapsed={false} onNavigate={() => setMobileOpen(false)} />
            </TooltipProvider>
          </motion.div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
