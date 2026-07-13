"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const avatarVariants = cva(
  "relative flex shrink-0 overflow-hidden rounded-full bg-ink text-white",
  {
    variants: {
      size: {
        sm: "size-7 text-caption",
        md: "size-9 text-body2",
        lg: "size-11 text-body",
      },
    },
    defaultVariants: { size: "md" },
  },
);

export interface AvatarProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>,
    VariantProps<typeof avatarVariants> {
  /** Iniciais exibidas quando não há imagem. */
  initials?: string;
  src?: string;
  alt?: string;
}

const Avatar = React.forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(({ className, size, initials, src, alt, ...props }, ref) => (
  <AvatarPrimitive.Root ref={ref} className={cn(avatarVariants({ size }), className)} {...props}>
    {src ? <AvatarPrimitive.Image src={src} alt={alt ?? ""} className="aspect-square h-full w-full object-cover" /> : null}
    <AvatarPrimitive.Fallback
      className="flex h-full w-full items-center justify-center font-semibold"
      delayMs={src ? 300 : 0}
    >
      {initials}
    </AvatarPrimitive.Fallback>
  </AvatarPrimitive.Root>
));
Avatar.displayName = "Avatar";

export { Avatar, avatarVariants };
