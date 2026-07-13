import { cn } from "@/lib/utils";

/** Placeholder de carregamento. Usa animação suave (respeita reduced-motion). */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-line/70", className)} {...props} />;
}
