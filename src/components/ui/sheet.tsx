"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { softTransition } from "@/components/ui/motion";
import { cn } from "@/lib/utils";

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;

type Side = "right" | "left" | "top" | "bottom";

const sideClasses: Record<Side, string> = {
  right: "inset-y-0 right-0 h-full w-[380px] max-w-[90vw] border-l",
  left: "inset-y-0 left-0 h-full w-[380px] max-w-[90vw] border-r",
  top: "inset-x-0 top-0 w-full border-b",
  bottom: "inset-x-0 bottom-0 w-full rounded-t-2xl border-t",
};

const sideMotion: Record<Side, { x?: string; y?: string }> = {
  right: { x: "100%" },
  left: { x: "-100%" },
  top: { y: "-100%" },
  bottom: { y: "100%" },
};

function SheetContent({
  side = "right",
  title,
  description,
  children,
  footer,
  className,
}: {
  side?: Side;
  title: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay asChild>
        <motion.div
          className="fixed inset-0 z-50 bg-ink/40"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        />
      </DialogPrimitive.Overlay>
      <DialogPrimitive.Content asChild>
        <motion.div
          className={cn(
            "fixed z-50 flex flex-col bg-white shadow-lg",
            sideClasses[side],
            className,
          )}
          initial={reduce ? false : sideMotion[side]}
          animate={{ x: 0, y: 0 }}
          transition={softTransition}
        >
          <div className="flex items-start justify-between gap-4 border-b border-line p-4">
            <div>
              <DialogPrimitive.Title className="font-display text-h3 font-semibold text-ink">
                {title}
              </DialogPrimitive.Title>
              {description ? (
                <DialogPrimitive.Description className="mt-0.5 text-body2 text-ink-2">
                  {description}
                </DialogPrimitive.Description>
              ) : null}
            </div>
            <DialogPrimitive.Close
              aria-label="Fechar"
              className="flex size-8 shrink-0 items-center justify-center rounded-md text-ink-3 transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <X className="size-4" aria-hidden />
            </DialogPrimitive.Close>
          </div>
          <div className="flex-1 overflow-y-auto p-4 text-body2 text-ink-2">{children}</div>
          {footer ? (
            <div className="flex justify-end gap-2 border-t border-line p-4">{footer}</div>
          ) : null}
        </motion.div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

/** Drawer — variante de Sheet ancorada na base (útil no mobile). */
function DrawerContent(props: Omit<React.ComponentProps<typeof SheetContent>, "side">) {
  return <SheetContent side="bottom" {...props} />;
}

export { Sheet, SheetTrigger, SheetClose, SheetContent };
export const Drawer = Sheet;
export const DrawerTrigger = SheetTrigger;
export const DrawerClose = SheetClose;
export { DrawerContent };
