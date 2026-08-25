import { notFound } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { routeMeta } from "@/config/routes";

/**
 * Placeholder padrão das rotas internas ainda não implementadas.
 * Renderiza PageHeader + EmptyState com ação coerente, a partir de routeMeta.
 */
export function RoutePlaceholder({ path }: { path: keyof typeof routeMeta }) {
  const meta = routeMeta[path];
  if (!meta) notFound();

  const actionButton = meta.action ? (
    <Button size="sm">
      <Plus />
      {meta.action.label}
    </Button>
  ) : meta.badge ? (
    <Badge tone="neutral" size="md">
      {meta.badge}
    </Badge>
  ) : undefined;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={meta.title} description={meta.description} actions={actionButton} />
      <EmptyState
        icon={meta.empty.icon}
        title={meta.empty.title}
        description={meta.empty.description}
        action={
          meta.action ? (
            <Button>
              <Plus />
              {meta.action.label}
            </Button>
          ) : undefined
        }
      />
    </div>
  );
}
