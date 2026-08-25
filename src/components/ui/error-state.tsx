import { RotateCw, TriangleAlert, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Estado de erro reutilizável.
 * - variant "page": ocupa a área de conteúdo (erro de rota).
 * - variant "card": compacto, para uso dentro de um card/seção.
 */
export function ErrorState({
  title = "Algo deu errado",
  message = "Não foi possível carregar estas informações. Tente novamente.",
  onRetry,
  retryLabel = "Tentar novamente",
  icon: Icon = TriangleAlert,
  variant = "page",
  className,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  icon?: LucideIcon;
  variant?: "page" | "card";
  className?: string;
}) {
  const isPage = variant === "page";
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center text-center",
        isPage
          ? "min-h-[60vh] rounded-lg border border-line bg-white px-6 py-16"
          : "rounded-lg border border-dashed border-line bg-white px-5 py-10",
        className,
      )}
    >
      <span
        className={cn(
          "flex items-center justify-center rounded-full bg-danger/10 text-danger",
          isPage ? "size-12" : "size-10",
        )}
        aria-hidden
      >
        <Icon className={isPage ? "size-6" : "size-5"} />
      </span>
      <h3
        className={cn(
          "mt-4 font-display font-semibold text-ink",
          isPage ? "text-h2" : "text-h3",
        )}
      >
        {title}
      </h3>
      <p className="mt-1.5 max-w-md text-body2 text-ink-2">{message}</p>
      {onRetry ? (
        <Button
          variant="secondary"
          size={isPage ? "md" : "sm"}
          onClick={onRetry}
          className="mt-5"
        >
          <RotateCw />
          {retryLabel}
        </Button>
      ) : null}
    </div>
  );
}
