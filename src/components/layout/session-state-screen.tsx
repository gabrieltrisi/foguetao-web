import type { LucideIcon } from "lucide-react";
import { Logo } from "@/components/brand/logo";

/**
 * Tela de estado de sessão em página inteira (sem a shell autenticada). Usada
 * pelo SessionGate para os estados que impedem o uso normal do app: sessão
 * expirada, empresa inacessível, servidor indisponível e erro inesperado.
 * Nunca deixa o usuário diante de uma tela quebrada — sempre explica o problema
 * e oferece a próxima ação.
 */
export function SessionStateScreen({
  icon: Icon,
  title,
  description,
  tone = "neutral",
  children,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  tone?: "neutral" | "danger";
  children?: React.ReactNode;
}) {
  const iconWrap =
    tone === "danger"
      ? "bg-danger/10 text-danger"
      : "bg-brand-soft text-brand";

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-surface px-4 py-10">
      <div className="mb-8">
        <Logo variant="sidebar-balanced" className="h-9 w-auto dark:hidden" />
        <Logo variant="mono" white className="hidden h-9 w-auto dark:block" />
      </div>

      <div className="w-full max-w-md rounded-2xl border border-line bg-white p-8 text-center shadow-sm">
        <div
          className={`mx-auto flex size-14 items-center justify-center rounded-2xl ${iconWrap}`}
          aria-hidden
        >
          <Icon className="size-7" />
        </div>

        <h1 className="mt-5 font-display text-h2 font-semibold text-ink">{title}</h1>
        <p className="mt-2 text-body2 text-ink-2">{description}</p>

        {children ? (
          <div className="mt-6 flex flex-col items-center justify-center gap-2 sm:flex-row">
            {children}
          </div>
        ) : null}
      </div>
    </div>
  );
}
