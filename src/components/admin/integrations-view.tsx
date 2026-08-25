"use client";

import * as React from "react";
import Link from "next/link";
import { Plug, ShieldAlert } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Combobox } from "@/components/ui/combobox";
import { SearchInput } from "@/components/ui/search-input";
import { FilterBar } from "@/components/ui/filter-bar";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { AdminIcon } from "@/components/admin/admin-icon";
import { useSession } from "@/providers/session-provider";
import { useIntegrationCatalog } from "@/hooks/integrations/use-integrations";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { availabilityMeta, capabilityLabel, catalogCategoryMeta } from "@/lib/integrations/display";
import type { ApiCatalogItem, Availability, CatalogCategory } from "@/types/api/integrations";

const CATEGORY_OPTIONS = [
  { value: "todas", label: "Todas as categorias" },
  ...(Object.keys(catalogCategoryMeta) as CatalogCategory[]).map((c) => ({
    value: c,
    label: catalogCategoryMeta[c],
  })),
];

const AVAILABILITY_OPTIONS = [
  { value: "todas", label: "Todas as disponibilidades" },
  ...(["AVAILABLE", "COMING_SOON", "DISABLED"] as Availability[]).map((a) => ({
    value: a,
    label: availabilityMeta[a].label,
  })),
];

export function IntegrationsView() {
  const { can } = useSession();
  const [query, setQuery] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState("todas");
  const [availability, setAvailability] = React.useState("todas");

  React.useEffect(() => {
    const t = setTimeout(() => setSearch(query), 350);
    return () => clearTimeout(t);
  }, [query]);

  const { data, isLoading, isError, refetch } = useIntegrationCatalog({
    search: search || undefined,
    category: category === "todas" ? undefined : (category as CatalogCategory),
    availability: availability === "todas" ? undefined : (availability as Availability),
  });

  if (!can(PERMISSIONS.INTEGRATIONS_CONNECTIONS_READ)) {
    return (
      <p className="py-10 text-center text-body2 text-ink-3">
        Você não tem permissão para ver integrações.
      </p>
    );
  }
  if (isError) {
    return <ErrorState title="Não foi possível carregar o catálogo." onRetry={() => refetch()} />;
  }

  const items = data?.items ?? [];

  return (
    <div className="flex flex-col gap-4">
      {/* Nenhuma integração externa é executada nesta fase — dizer isso é mais
          honesto do que deixar a UI insinuar que conecta de verdade. */}
      {data && !data.enabled ? (
        <Card className="flex items-center gap-2 p-4 text-body2 text-warning">
          <ShieldAlert className="size-4 shrink-0" aria-hidden />
          As integrações estão desabilitadas nesta instalação.
        </Card>
      ) : data?.mode === "mock" ? (
        <Card className="flex items-center gap-2 p-4 text-body2 text-ink-2">
          <ShieldAlert className="size-4 shrink-0 text-info" aria-hidden />
          Modo estrutural: nenhuma conexão com serviços externos é realizada.
        </Card>
      ) : null}

      <FilterBar>
        <SearchInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar integrações…"
          containerClassName="w-full max-w-xs"
        />
        <div className="w-56">
          <Combobox options={CATEGORY_OPTIONS} value={category} onValueChange={setCategory} />
        </div>
        <div className="w-56">
          <Combobox
            options={AVAILABILITY_OPTIONS}
            value={availability}
            onValueChange={setAvailability}
          />
        </div>
        <Button asChild size="sm" variant="secondary" className="ml-auto">
          <Link href="/integrations/connections">Ver conexões</Link>
        </Button>
      </FilterBar>

      {isLoading ? (
        <p className="py-10 text-center text-body2 text-ink-3">Carregando catálogo…</p>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Plug}
          title="Nenhuma integração encontrada."
          description="Ajuste os filtros para ver outras integrações."
        />
      ) : (
        // Lista semântica: o grid é uma lista de integrações, e nomeá-la evita
        // que a navegação lateral se confunda com o catálogo.
        <ul
          aria-label="Catálogo de integrações"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {items.map((item) => (
            <li key={item.key} className="flex">
              <IntegrationCard item={item} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function IntegrationCard({ item }: { item: ApiCatalogItem }) {
  const availability = availabilityMeta[item.availability];
  return (
    <Card className="flex w-full flex-col gap-3 p-5">
      <div className="flex items-start justify-between gap-2">
        <span className="flex size-11 items-center justify-center rounded-xl bg-surface text-ink">
          <AdminIcon name={item.icon} className="size-6" />
        </span>
        <div className="flex flex-wrap justify-end gap-1.5">
          <Badge tone={availability.tone}>{availability.label}</Badge>
          {item.mock ? <Badge tone="info">MOCK</Badge> : null}
        </div>
      </div>

      <div>
        <p className="font-medium text-ink">{item.name}</p>
        <p className="text-caption text-ink-3">{catalogCategoryMeta[item.category]}</p>
      </div>

      <p className="min-h-[2.5rem] text-body2 text-ink-2">{item.description}</p>

      {item.capabilities.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {item.capabilities.slice(0, 3).map((c) => (
            <span key={c} className="rounded bg-surface px-1.5 py-0.5 text-micro text-ink-2">
              {capabilityLabel[c] ?? c}
            </span>
          ))}
          {item.capabilities.length > 3 ? (
            <span className="rounded bg-surface px-1.5 py-0.5 text-micro text-ink-3">
              +{item.capabilities.length - 3}
            </span>
          ) : null}
        </div>
      ) : null}

      <div className="mt-auto flex items-center justify-end border-t border-line pt-3">
        <Button asChild size="sm" variant="secondary">
          <Link href={`/integrations/catalog/${item.key}`}>Ver detalhes</Link>
        </Button>
      </div>
    </Card>
  );
}
