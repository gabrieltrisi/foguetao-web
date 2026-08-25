import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

/**
 * Primitivos de formulário (agnósticos de biblioteca).
 * FormField faz o wiring de id/aria entre label, controle, descrição e erro.
 */

export function FormLabel({
  children,
  htmlFor,
  required,
  className,
}: {
  children: React.ReactNode;
  htmlFor?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <Label htmlFor={htmlFor} className={className}>
      {children}
      {required ? (
        <span className="ml-0.5 text-danger" aria-hidden>
          *
        </span>
      ) : null}
    </Label>
  );
}

export function FormMessage({
  children,
  id,
  tone = "error",
  className,
}: {
  children?: React.ReactNode;
  id?: string;
  tone?: "error" | "hint";
  className?: string;
}) {
  if (!children) return null;
  return (
    <p
      id={id}
      role={tone === "error" ? "alert" : undefined}
      className={cn("text-small", tone === "error" ? "text-danger" : "text-ink-3", className)}
    >
      {children}
    </p>
  );
}

export function FormField({
  id,
  label,
  required,
  description,
  error,
  children,
  className,
}: {
  id: string;
  label?: string;
  required?: boolean;
  description?: string;
  error?: string;
  /** Recebe as props de acessibilidade (id, aria-*) para o controle. */
  children: (fieldProps: {
    id: string;
    "aria-describedby"?: string;
    "aria-invalid"?: boolean;
  }) => React.ReactNode;
  className?: string;
}) {
  const descId = description ? `${id}-desc` : undefined;
  const errId = error ? `${id}-error` : undefined;
  const describedBy = [descId, errId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label ? (
        <FormLabel htmlFor={id} required={required}>
          {label}
        </FormLabel>
      ) : null}
      {description ? (
        <p id={descId} className="text-small text-ink-3">
          {description}
        </p>
      ) : null}
      {children({ id, "aria-describedby": describedBy, "aria-invalid": error ? true : undefined })}
      <FormMessage id={errId}>{error}</FormMessage>
    </div>
  );
}
