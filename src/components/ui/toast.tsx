"use client";

import * as React from "react";
import { CheckCircle2, CircleAlert, Info, TriangleAlert, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "warning" | "info";

type ToastItem = {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
};

type ToastInput = {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
};

type ToastContextValue = {
  toast: (input: ToastInput) => void;
  dismiss: (id: string) => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

const variantConfig: Record<
  ToastVariant,
  { icon: typeof Info; iconClass: string; accent: string }
> = {
  success: { icon: CheckCircle2, iconClass: "text-success", accent: "bg-success" },
  error: { icon: TriangleAlert, iconClass: "text-danger", accent: "bg-danger" },
  warning: { icon: CircleAlert, iconClass: "text-warning", accent: "bg-warning" },
  info: { icon: Info, iconClass: "text-info", accent: "bg-info" },
};

let counter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);
  const timers = React.useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const toast = React.useCallback(
    ({ title, description, variant = "info", duration = 4000 }: ToastInput) => {
      counter += 1;
      const id = `toast-${counter}`;
      setToasts((prev) => [...prev, { id, title, description, variant }]);
      const timer = setTimeout(() => dismiss(id), duration);
      timers.current.set(id, timer);
    },
    [dismiss],
  );

  React.useEffect(() => {
    const map = timers.current;
    return () => {
      map.forEach((timer) => clearTimeout(timer));
      map.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div
        role="region"
        aria-label="Notificações"
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2 px-4 sm:px-0"
      >
        {toasts.map((item) => {
          const config = variantConfig[item.variant];
          const Icon = config.icon;
          return (
            <div
              key={item.id}
              role={item.variant === "error" ? "alert" : "status"}
              className="pointer-events-auto relative flex items-start gap-3 overflow-hidden rounded-lg border border-line bg-white p-4 pl-5 shadow-lg data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-right-4 data-[state=open]:duration-200"
              data-state="open"
            >
              <span className={cn("absolute inset-y-0 left-0 w-1", config.accent)} aria-hidden />
              <Icon className={cn("mt-0.5 size-5 shrink-0", config.iconClass)} aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-body2 font-semibold text-ink">{item.title}</p>
                {item.description ? (
                  <p className="mt-0.5 text-small text-ink-2">{item.description}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                aria-label="Fechar notificação"
                className="rounded-md text-ink-3 transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast deve ser usado dentro de <ToastProvider>.");
  }
  return ctx;
}
