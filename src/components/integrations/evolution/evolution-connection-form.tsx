"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { useToast } from "@/components/ui/toast";
import { useCreateEvolutionConnection } from "@/hooks/integrations/use-evolution";
import { evolutionErrorMessage } from "@/lib/integrations/evolution-errors";
import type {
  ApiEvolutionCapabilities,
  ApiEvolutionConnection,
  CreateEvolutionConnectionInput,
} from "@/types/api/evolution";
import type { IntegrationEnvironment } from "@/types/api/integrations";

interface Props {
  capabilities: ApiEvolutionCapabilities;
  onCreated: (conn: ApiEvolutionConnection) => void;
}

interface FieldErrors {
  name?: string;
  baseUrl?: string;
  apiKey?: string;
}

/** Ambientes ofertados vêm das CAPABILITIES — nada de hardcode de provider. */
function allowedEnvironments(
  caps: ApiEvolutionCapabilities,
): { value: IntegrationEnvironment; label: string }[] {
  const out: { value: IntegrationEnvironment; label: string }[] = [];
  if (caps.environments.sandbox) out.push({ value: "SANDBOX", label: "Sandbox" });
  if (caps.environments.production) out.push({ value: "PRODUCTION", label: "Produção" });
  return out;
}

function validate(values: { name: string; baseUrl: string; apiKey: string }): FieldErrors {
  const errors: FieldErrors = {};
  if (!values.name.trim()) errors.name = "Informe um nome para a conexão.";
  else if (values.name.trim().length > 160) errors.name = "Máximo de 160 caracteres.";

  if (!values.baseUrl.trim()) {
    errors.baseUrl = "Informe a URL base da instância Evolution.";
  } else {
    try {
      const u = new URL(values.baseUrl.trim());
      if (u.protocol !== "http:" && u.protocol !== "https:") {
        errors.baseUrl = "A URL deve começar com http:// ou https://.";
      }
    } catch {
      errors.baseUrl = "URL inválida.";
    }
  }

  if (!values.apiKey) errors.apiKey = "Informe a API key da instância.";
  return errors;
}

export function EvolutionConnectionForm({ capabilities, onCreated }: Props) {
  const baseId = useId();
  const { toast } = useToast();
  const create = useCreateEvolutionConnection();

  const environments = allowedEnvironments(capabilities);
  const [name, setName] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [environment, setEnvironment] = useState<IntegrationEnvironment>(
    environments[0]?.value ?? "SANDBOX",
  );
  const [errors, setErrors] = useState<FieldErrors>({});

  const submitting = create.isPending;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return; // evita duplo submit

    const nextErrors = validate({ name, baseUrl, apiKey });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload: CreateEvolutionConnectionInput = {
      name: name.trim(),
      baseUrl: baseUrl.trim(),
      apiKey,
      ...(environments.length > 0 ? { environment } : {}),
    };
    // NUNCA logar `payload` (contém apiKey). Não persistimos em storage/URL.
    create.mutate(payload, {
      onSuccess: (conn) => {
        setApiKey(""); // limpa o segredo do estado imediatamente após uso
        toast({
          title: "Conexão criada",
          description: "Instância provisionada. Gere o QR para conectar.",
          variant: "success",
        });
        onCreated(conn);
      },
      onError: (err) => {
        toast({ title: "Não foi possível criar", description: evolutionErrorMessage(err), variant: "error" });
      },
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <FormField id={`${baseId}-name`} label="Nome da conexão" required error={errors.name}>
        {(p) => (
          <Input
            {...p}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex.: WhatsApp Comercial"
            maxLength={160}
            disabled={submitting}
            autoComplete="off"
          />
        )}
      </FormField>

      <FormField
        id={`${baseId}-baseurl`}
        label="URL base da Evolution"
        required
        description="Endereço da API Evolution (https://…). Precisa estar entre os hosts permitidos."
        error={errors.baseUrl}
      >
        {(p) => (
          <Input
            {...p}
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://evolution.suaempresa.com"
            inputMode="url"
            disabled={submitting}
            autoComplete="off"
          />
        )}
      </FormField>

      <FormField
        id={`${baseId}-apikey`}
        label="API key"
        required
        description="Usada apenas para provisionar. É armazenada com segurança e nunca é exibida novamente."
        error={errors.apiKey}
      >
        {(p) => (
          <PasswordInput
            {...p}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="••••••••"
            disabled={submitting}
            autoComplete="off"
          />
        )}
      </FormField>

      {environments.length > 1 ? (
        <FormField id={`${baseId}-env`} label="Ambiente">
          {(p) => (
            <select
              {...p}
              value={environment}
              onChange={(e) => setEnvironment(e.target.value as IntegrationEnvironment)}
              disabled={submitting}
              className="h-10 rounded-lg border border-line bg-white px-3 text-body text-ink outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              {environments.map((env) => (
                <option key={env.value} value={env.value}>
                  {env.label}
                </option>
              ))}
            </select>
          )}
        </FormField>
      ) : null}

      <div className="flex justify-end">
        <Button type="submit" loading={submitting} disabled={submitting}>
          Criar conexão
        </Button>
      </div>
    </form>
  );
}
