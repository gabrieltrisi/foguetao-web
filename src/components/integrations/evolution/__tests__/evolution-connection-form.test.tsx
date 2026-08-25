import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastProvider } from "@/components/ui/toast";
import { EvolutionConnectionForm } from "@/components/integrations/evolution/evolution-connection-form";
import type { ApiEvolutionCapabilities } from "@/types/api/evolution";

const CAPS: ApiEvolutionCapabilities = {
  provider: "EVOLUTION",
  onboarding: { provision: true, qr: true, disconnect: true, webhookConfiguration: true },
  messaging: { text: true, image: false, document: false, audio: false },
  features: { groups: false, broadcast: false, templates: false },
  environments: { sandbox: true, production: false },
};

const CONNECTION = {
  connectionId: "conn-1",
  provider: "EVOLUTION",
  environment: "SANDBOX",
  displayName: "WhatsApp Comercial",
  status: "DRAFT",
  canSend: false,
  sendabilityReason: null,
  instanceName: null,
  webhookConfigured: false,
  qrAvailable: false,
  lastConnectedAt: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const SECRET = "sk_live_supersecret_key";

function renderForm(onCreated = vi.fn()) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  render(
    <QueryClientProvider client={client}>
      <ToastProvider>
        <EvolutionConnectionForm capabilities={CAPS} onCreated={onCreated} />
      </ToastProvider>
    </QueryClientProvider>,
  );
  return { onCreated };
}

describe("EvolutionConnectionForm", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("valida campos obrigatórios sem chamar a API", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    renderForm();

    await user.click(screen.getByRole("button", { name: /Criar conexão/i }));

    expect(await screen.findByText(/Informe um nome/i)).toBeInTheDocument();
    expect(screen.getByText(/Informe a URL base/i)).toBeInTheDocument();
    expect(screen.getByText(/Informe a API key/i)).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("rejeita URL base inválida", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn());
    renderForm();

    await user.type(screen.getByLabelText(/Nome da conexão/i), "Comercial");
    await user.type(screen.getByLabelText(/URL base/i), "not-a-url");
    await user.type(screen.getByLabelText(/API key/i), SECRET);
    await user.click(screen.getByRole("button", { name: /Criar conexão/i }));

    expect(await screen.findByText(/URL inválida/i)).toBeInTheDocument();
  });

  it("envia a apiKey no corpo, limpa o campo no sucesso e NUNCA persiste o segredo", async () => {
    const user = userEvent.setup();
    const localSet = vi.spyOn(Storage.prototype, "setItem");

    let sentBody: string | undefined;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: string, init?: RequestInit) => {
        sentBody = init?.body as string;
        return new Response(JSON.stringify(CONNECTION), {
          status: 201,
          headers: { "content-type": "application/json" },
        });
      }),
    );

    const { onCreated } = renderForm();

    await user.type(screen.getByLabelText(/Nome da conexão/i), "WhatsApp Comercial");
    await user.type(screen.getByLabelText(/URL base/i), "https://evo.example.com");
    const apiKeyField = screen.getByLabelText(/API key/i) as HTMLInputElement;
    await user.type(apiKeyField, SECRET);
    await user.click(screen.getByRole("button", { name: /Criar conexão/i }));

    await waitFor(() => expect(onCreated).toHaveBeenCalledWith(CONNECTION));

    // A apiKey vai no corpo (write-only), mas some do campo depois do sucesso...
    expect(sentBody).toContain(SECRET);
    expect(apiKeyField.value).toBe("");

    // ...e nunca é escrita em localStorage/sessionStorage.
    for (const call of localSet.mock.calls) {
      expect(String(call[1])).not.toContain(SECRET);
    }
  });
});
