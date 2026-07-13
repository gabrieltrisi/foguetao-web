"use client";

import { ErrorState } from "@/components/ui/error-state";

export default function AppError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <ErrorState
      title="Não foi possível carregar esta página"
      message="Ocorreu um erro inesperado. Você pode tentar novamente."
      onRetry={reset}
    />
  );
}
