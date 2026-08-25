"use client";

import { Moon, Sun } from "lucide-react";

/**
 * Alterna o tema claro/escuro. Sem estado React: mexe direto na classe `.dark`
 * de <html> e persiste em localStorage. Os dois ícones ficam no DOM e a
 * visibilidade é decidida por CSS (`dark:`), então não há divergência de
 * hidratação nem re-render por frame.
 */
export function ThemeToggle() {
  function toggle() {
    const root = document.documentElement;
    const isDark = root.classList.toggle("dark");
    try {
      localStorage.setItem("fg_theme", isDark ? "dark" : "light");
    } catch {
      // storage indisponível (modo privado): tema não persiste, tudo bem
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Alternar tema claro e escuro"
      title="Alternar tema"
      className="flex size-9 items-center justify-center rounded-lg text-ink-2 transition-colors hover:bg-surface hover:text-ink focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
    >
      <Moon className="size-5 dark:hidden" aria-hidden />
      <Sun className="hidden size-5 dark:block" aria-hidden />
    </button>
  );
}
