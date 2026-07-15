"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Combobox } from "@/components/ui/combobox";
import { FormPageLayout } from "@/components/patterns/page-patterns";
import { ErrorState } from "@/components/ui/error-state";
import { useToast } from "@/components/ui/toast";
import { useSession } from "@/providers/session-provider";
import {
  useConnection,
  useCreateConnection,
  useIntegrationCatalog,
  useUpdateConnection,
} from "@/hooks/integrations/use-integrations";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { messageForIntegrationError } from "@/lib/integrations/display";
import { isApiError } from "@/types/api/error";
import type {
  ApiCatalogItem,
  CreateConnectionInput,
  IntegrationEnvironment,
  UpdateConnectionInput,
} from "@/types/api/integrations";

/**
 * Cenários do adapter MOCK (backend: mock-provider.config). São o único campo
 * de configuração que a fundação precisa: permitem exercitar sucesso e as
 * falhas normalizadas sem tocar em rede.
 */
const MOCK_SCENARIOS = [
  { value: "success", label: "Sucesso" },
  { value: "slow_success", label: "Sucesso lento" },
  { value: "timeout", label: "Tempo esgotado" },
  { value: "transient_error", label: "Erro transitório" },
  { value: "permanent_error", label: "Erro permanente" },
  { value: "rate_limited", label: "Limite de requisições" },
  { value: "invalid_credentials", label: "Credencial inválida" },
];

const ENVIRONMENTS = [
  { value: "SANDBOX", label: "Sandbox" },
  { value: "PRODUCTION", label: "Produção" },
];

interface FormState {
  name: string;
  environment: string;
  scenario: string;
}

export function ConnectionForm({ connectionId }: { connectionId?: string }) {
  const isEdit = Boolean(connectionId);
  const { can } = useSession();
  const searchParams = useSearchParams();
  const providerKey = searchParams.get("provider") ?? "";

  const catalog = useIntegrationCatalog();
  const detail = useConnection(connectionId ?? "");

  const permission = isEdit
    ? PERMISSIONS.INTEGRATIONS_CONNECTIONS_UPDATE
    : PERMISSIONS.INTEGRATIONS_CONNECTIONS_CREATE;
  if (!can(permission)) {
    return (
      <p className="py-16 text-center text-body2 text-ink-3">
        Você não tem permissão para {isEdit ? "editar" : "criar"} conexões.
      </p>
    );
  }

  if (isEdit) {
    if (detail.isLoading) return <p className="py-16 text-center text-body2 text-ink-3">Carregando…</p>;
    if (detail.isError || !detail.data) {
      const notFound = isApiError(detail.error) && detail.error.statusCode === 404;
      return (
        <ErrorState
          title={notFound ? "Conexão não encontrada." : "Falha ao carregar a conexão."}
          onRetry={notFound ? undefined : () => detail.refetch()}
        />
      );
    }
  }

  if (catalog.isLoading) {
    return <p className="py-16 text-center text-body2 text-ink-3">Carregando…</p>;
  }

  const item: ApiCatalogItem | undefined = isEdit
    ? catalog.data?.items.find((i) => i.provider === detail.data?.provider)
    : catalog.data?.items.find((i) => i.key === providerKey);

  if (!item) {
    return (
      <ErrorState
        title="Integração não encontrada."
        message="Escolha uma integração no catálogo."
      />
    );
  }
  // Blindagem: sem provider/categoria não há como montar um POST válido, e o
  // backend recusaria. Melhor um estado claro do que um formulário quebrado.
  if (!isEdit && (!item.connectable || !item.provider || !item.connectionCategory)) {
    return (
      <ErrorState
        title="Esta integração ainda não pode ser configurada."
        message={item.limitations}
      />
    );
  }

  const initial: FormState = detail.data
    ? {
        name: detail.data.name,
        environment: detail.data.environment,
        scenario: String(detail.data.config?.scenario ?? "success"),
      }
    : { name: `${item.name} 1`, environment: "SANDBOX", scenario: "success" };

  return (
    <ConnectionFormFields
      key={connectionId ?? item.key}
      initial={initial}
      item={item}
      connectionId={connectionId}
    />
  );
}

function ConnectionFormFields({
  initial,
  item,
  connectionId,
}: {
  initial: FormState;
  item: ApiCatalogItem;
  connectionId?: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const isEdit = Boolean(connectionId);
  const [form, setForm] = React.useState<FormState>(initial);
  const set = (k: keyof FormState) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const create = useCreateConnection();
  const update = useUpdateConnection(connectionId ?? "");
  const pending = create.isPending || update.isPending;
  const backHref = isEdit && connectionId ? `/integrations/connections/${connectionId}` : "/integrations";

  const isMock = item.mock;

  async function handleSave() {
    // Config pública apenas. Segredo NUNCA entra aqui — o backend recusa.
    const config = isMock ? { scenario: form.scenario } : {};
    try {
      if (isEdit && connectionId) {
        const body: UpdateConnectionInput = {
          name: form.name.trim(),
          environment: form.environment as IntegrationEnvironment,
          config,
        };
        await update.mutateAsync(body);
        toast({ title: "Conexão atualizada", variant: "success" });
        router.push(`/integrations/connections/${connectionId}`);
        return;
      }
      const body: CreateConnectionInput = {
        provider: item.provider!,
        category: item.connectionCategory!,
        name: form.name.trim(),
        environment: form.environment as IntegrationEnvironment,
        config,
      };
      const created = await create.mutateAsync(body);
      toast({ title: "Conexão criada", variant: "success" });
      router.push(`/integrations/connections/${created.id}`);
    } catch (error) {
      toast({ title: messageForIntegrationError(error), variant: "error" });
    }
  }

  return (
    <FormPageLayout
      title={isEdit ? "Editar conexão" : `Configurar ${item.name}`}
      description={
        isEdit
          ? "Atualize o nome e a configuração pública."
          : "Cadastro estrutural. Nenhuma conexão externa será realizada."
      }
      back={{ href: backHref, label: isEdit ? "Conexão" : "Integrações" }}
      footer={
        <>
          <Button asChild variant="secondary" size="sm">
            <Link href={backHref}>Cancelar</Link>
          </Button>
          <Button size="sm" loading={pending} disabled={!form.name.trim() || pending} onClick={handleSave}>
            {isEdit ? "Salvar alterações" : "Criar conexão"}
          </Button>
        </>
      }
    >
      <Card className="flex flex-col gap-5 p-5">
        <div className="flex items-start gap-2 rounded-lg bg-surface p-3 text-body2 text-ink-2">
          <ShieldAlert className="mt-0.5 size-4 shrink-0 text-info" aria-hidden />
          <span>
            Nenhuma chamada a serviços externos é feita ao salvar ou testar. A configuração é
            armazenada apenas internamente.
          </span>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField id="cf-name" label="Nome" required className="sm:col-span-2">
            {(p) => (
              <Input
                placeholder="Ex.: Ambiente de testes"
                value={form.name}
                onChange={(e) => set("name")(e.target.value)}
                {...p}
              />
            )}
          </FormField>

          <FormField id="cf-env" label="Ambiente">
            {(p) => (
              <Combobox
                id={p.id}
                options={ENVIRONMENTS}
                value={form.environment}
                onValueChange={set("environment")}
              />
            )}
          </FormField>

          {isMock ? (
            <FormField
              id="cf-scenario"
              label="Cenário do teste"
              description="Define o resultado que o provider MOCK devolverá."
            >
              {(p) => (
                <Combobox
                  id={p.id}
                  options={MOCK_SCENARIOS}
                  value={form.scenario}
                  onValueChange={set("scenario")}
                />
              )}
            </FormField>
          ) : null}
        </div>

        <p className="text-caption text-ink-3">
          Credenciais não são configuradas aqui: elas seguem um fluxo próprio, cifrado, e nunca são
          reexibidas depois de salvas.
        </p>
      </Card>
    </FormPageLayout>
  );
}
