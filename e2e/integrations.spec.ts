import { test, expect, type Page } from "@playwright/test";

const EMPTY_STATE = { cookies: [], origins: [] };
const VIEWER = { email: "viewer@foguetao.dev", password: "Str0ng!Passw0rd" };
const CONNECTION_RE = /\/integrations\/connections\/[0-9a-f-]{36}/;

/** Hosts do ambiente. Qualquer outro host é chamada externa — proibida. */
const LOCAL_HOSTS = ["localhost", "127.0.0.1", "[::1]"];

function isExternal(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return !LOCAL_HOSTS.includes(host) && !host.endsWith(".local");
  } catch {
    return false;
  }
}

/**
 * O catálogo, e só ele. A sidebar tem links "Meta Ads"/"Google Ads", então
 * asserções na página inteira acertariam a navegação em vez dos cards.
 */
function catalog(page: Page) {
  return page.getByRole("list", { name: "Catálogo de integrações" });
}

async function pickOption(page: Page, trigger: string | RegExp, option: string | RegExp) {
  await page.getByRole("button", { name: trigger }).click();
  await page.getByRole("option", { name: option }).click();
}

async function pickField(page: Page, label: string, option: string | RegExp) {
  await page.getByRole("button", { name: label, exact: true }).click();
  await page.getByRole("option", { name: option }).click();
}

async function createMockConnection(page: Page, name: string, scenario?: string) {
  await page.goto("/integrations/connections/new?provider=MOCK");
  await page.getByRole("textbox", { name: "Nome", exact: true }).fill(name);
  if (scenario) await pickField(page, "Cenário do teste", scenario);
  await page.getByRole("button", { name: "Criar conexão" }).click();
  await page.waitForURL(CONNECTION_RE);
}

test.describe("Central de Integrações — catálogo (owner)", () => {
  test("acessa Integrações e vê o catálogo real", async ({ page }) => {
    // Sprint MVP 1.1: a aba Integrações saiu da navegação (módulo fora do MVP),
    // mas a rota continua existindo e funcional — acesso direto por URL.
    await page.goto("/integrations");

    await expect(page.getByRole("heading", { level: 1, name: "Integrações" })).toBeVisible();
    await expect(catalog(page).getByText("Integração MOCK")).toBeVisible();
    await expect(catalog(page).getByText("WhatsApp Evolution")).toBeVisible();
    // o modo estrutural é declarado, não deixado subentendido
    await expect(page.getByText(/nenhuma conexão com serviços externos/i)).toBeVisible();
  });

  test("filtra o catálogo por categoria", async ({ page }) => {
    await page.goto("/integrations");
    await expect(catalog(page).getByText("Integração MOCK")).toBeVisible();

    await pickOption(page, "Todas as categorias", "Anúncios");
    await expect(catalog(page).getByText("Meta Ads")).toBeVisible();
    await expect(catalog(page).getByText("Google Ads")).toBeVisible();
    await expect(catalog(page).getByText("Integração MOCK")).toHaveCount(0);
  });

  test("busca uma integração pelo nome", async ({ page }) => {
    await page.goto("/integrations");
    await expect(catalog(page).getByText("Meta Ads")).toBeVisible();

    await page.getByPlaceholder("Buscar integrações…").fill("planilha");
    await expect(catalog(page).getByText("Google Sheets")).toBeVisible();
    await expect(catalog(page).getByText("Meta Ads")).toHaveCount(0);
  });

  test("item 'Em breve' aparece marcado e sem ação de configurar", async ({ page }) => {
    await page.goto("/integrations/catalog/EVOLUTION");
    await expect(page.getByRole("heading", { level: 1, name: "WhatsApp Evolution" })).toBeVisible();
    await expect(page.getByText("Em breve").first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Criar configuração" })).toHaveCount(0);
  });

  test("abre o detalhe de uma integração disponível", async ({ page }) => {
    await page.goto("/integrations");
    await catalog(page)
      .getByRole("listitem")
      .filter({ hasText: "Integração MOCK" })
      .getByRole("link", { name: "Ver detalhes" })
      .click();
    await page.waitForURL("**/integrations/catalog/MOCK");

    await expect(page.getByRole("heading", { level: 1, name: "Integração MOCK" })).toBeVisible();
    await expect(page.getByText("Testar conexão").first()).toBeVisible();
    await expect(page.getByText(/nenhuma conexão com serviços externos/i)).toBeVisible();
    await expect(page.getByRole("link", { name: "Criar configuração" })).toBeVisible();
  });
});

test.describe("Central de Integrações — fluxo MOCK (owner)", () => {
  test("cria conexão MOCK e abre o detalhe", async ({ page }) => {
    const name = `E2E Mock ${Date.now()}`;
    await createMockConnection(page, name);

    await expect(page.getByRole("heading", { level: 1, name })).toBeVisible();
    await expect(page.getByText("Rascunho").first()).toBeVisible();
    await expect(page.getByText("MOCK").first()).toBeVisible();
  });

  test("executa teste MOCK e vê o log da execução", async ({ page }) => {
    const name = `E2E Teste ${Date.now()}`;
    await createMockConnection(page, name);

    await expect(page.getByText(/nenhuma execução registrada/i)).toBeVisible();

    await page.getByRole("button", { name: "Testar estrutura" }).click();
    await expect(page.getByText("Teste concluído com sucesso")).toBeVisible();

    const logs = page.getByRole("list", { name: "Logs da conexão" });
    await expect(logs.getByText("Teste de conexão").first()).toBeVisible();
    await expect(logs.getByText("Sucesso").first()).toBeVisible();
  });

  test("teste MOCK com erro mostra falha controlada e registra o log", async ({ page }) => {
    const name = `E2E Falha ${Date.now()}`;
    await createMockConnection(page, name, "Erro permanente");

    await page.getByRole("button", { name: "Testar estrutura" }).click();
    // erro normalizado do backend, não stack trace
    await expect(page.getByText(/falha permanente|não foi possível|falhou/i).first()).toBeVisible();

    const logs = page.getByRole("list", { name: "Logs da conexão" });
    await expect(logs.getByText("Falha").first()).toBeVisible();
  });

  test("ativa e pausa a conexão", async ({ page }) => {
    const name = `E2E Ciclo ${Date.now()}`;
    await createMockConnection(page, name);

    await page.getByRole("button", { name: "Ativar" }).click();
    await expect(page.getByText("Conexão ativada")).toBeVisible();
    await expect(page.getByText("Ativa").first()).toBeVisible();

    await page.getByRole("button", { name: "Pausar" }).click();
    await expect(page.getByText("Conexão pausada")).toBeVisible();
    await expect(page.getByText("Pausada").first()).toBeVisible();
  });

  test("edita o nome da conexão", async ({ page }) => {
    const name = `E2E Edit ${Date.now()}`;
    await createMockConnection(page, name);

    await page.getByRole("link", { name: "Editar" }).click();
    await page.getByRole("textbox", { name: "Nome", exact: true }).fill(`${name} atualizado`);
    await page.getByRole("button", { name: "Salvar alterações" }).click();

    await page.waitForURL(CONNECTION_RE);
    await expect(page.getByRole("heading", { level: 1, name: `${name} atualizado` })).toBeVisible();
  });

  test("exclui a conexão e volta para a listagem", async ({ page }) => {
    const name = `E2E Delete ${Date.now()}`;
    await createMockConnection(page, name);

    await page.getByRole("button", { name: "Excluir conexão" }).click();
    await page.getByRole("button", { name: "Excluir", exact: true }).click();

    await page.waitForURL("**/integrations/connections");
    await expect(page.getByText("Conexão excluída")).toBeVisible();
    await expect(page.getByRole("link", { name })).toHaveCount(0);
  });

  test("a conexão aparece na listagem e no detalhe da integração", async ({ page }) => {
    const name = `E2E Lista ${Date.now()}`;
    await createMockConnection(page, name);

    await page.goto("/integrations/connections");
    await expect(page.getByRole("link", { name })).toBeVisible();

    await page.goto("/integrations/catalog/MOCK");
    await expect(
      page.getByRole("list", { name: "Conexões desta integração" }).getByText(name),
    ).toBeVisible();
  });
});

test.describe("Central de Integrações — segurança", () => {
  test("o segredo não aparece no HTML nem nas respostas", async ({ page }) => {
    const SECRET = "sk_live_NUNCA_DEVE_VAZAR_12345";
    const name = `E2E Segredo ${Date.now()}`;

    const bodies: string[] = [];
    page.on("response", async (r) => {
      if (r.url().includes("/api/integrations")) {
        bodies.push(await r.text().catch(() => ""));
      }
    });

    await createMockConnection(page, name);
    const connectionId = page.url().match(/connections\/([0-9a-f-]{36})/)![1];

    // Cadastra uma credencial pelo contrato real (não há tela que a reexiba).
    const created = await page.request.post(
      `http://localhost:3000/api/v1/integrations/${connectionId}/credentials`,
      { data: { type: "API_KEY", value: SECRET }, failOnStatusCode: false },
    );
    // Se o ambiente não permitir chamar a API direto, o teste ainda vale para o HTML.
    expect([201, 401, 400, 403]).toContain(created.status());

    await page.reload();
    await page.getByRole("button", { name: "Testar estrutura" }).click();
    await expect(page.getByText(/teste concluído|falha/i).first()).toBeVisible();

    expect(await page.content()).not.toContain(SECRET);
    for (const body of bodies) expect(body).not.toContain(SECRET);
  });

  test("a configuração pública recusa segredo no BFF", async ({ page }) => {
    const res = await page.request.post("/api/integrations/connections", {
      data: {
        provider: "MOCK",
        category: "CUSTOM",
        name: "Com segredo",
        config: { apiKey: "sk_live_123" },
      },
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).code).toBe("VALIDATION_ERROR");
  });

  test("id inválido é barrado no BFF, sem chegar ao backend", async ({ page }) => {
    const res = await page.request.get("/api/integrations/connections/conn-1");
    expect(res.status()).toBe(400);
    expect((await res.json()).code).toBe("VALIDATION_ERROR");
  });

  test("chave de catálogo arbitrária é barrada no BFF", async ({ page }) => {
    const res = await page.request.get("/api/integrations/catalog/..%2F..%2Fsecrets");
    expect([400, 404]).toContain(res.status());
  });

  test("filtro inválido é barrado no BFF", async ({ page }) => {
    const res = await page.request.get("/api/integrations/connections?sortBy=config");
    expect(res.status()).toBe(400);
    expect((await res.json()).code).toBe("VALIDATION_ERROR");
  });

  test("conexão inexistente mostra estado de não encontrada", async ({ page }) => {
    await page.goto("/integrations/connections/00000000-0000-4000-8000-000000000000");
    await expect(page.getByText("Conexão não encontrada.")).toBeVisible();
  });

  test("nenhuma chamada externa é feita pelo browser em todo o fluxo", async ({ page }) => {
    const external: string[] = [];
    page.on("request", (r) => {
      if (isExternal(r.url())) external.push(r.url());
    });

    const name = `E2E Rede ${Date.now()}`;
    await page.goto("/integrations");
    await page.goto("/integrations/catalog/MOCK");
    await createMockConnection(page, name);
    await page.getByRole("button", { name: "Testar estrutura" }).click();
    await expect(page.getByText(/teste concluído/i)).toBeVisible();
    await page.goto("/integrations/connections");

    expect(external, `chamadas externas: ${external.join(", ")}`).toEqual([]);
  });
});

test.describe("Central de Integrações — VIEWER somente leitura", () => {
  test.use({ storageState: EMPTY_STATE });

  test("viewer lê o catálogo mas não vê ações de escrita", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("E-mail").fill(VIEWER.email);
    await page.getByLabel("Senha", { exact: true }).fill(VIEWER.password);
    await page.getByRole("button", { name: "Entrar" }).click();
    await page.waitForURL("**/dashboard");

    await page.goto("/integrations");
    await expect(catalog(page).getByText("Integração MOCK")).toBeVisible();

    await page.goto("/integrations/catalog/MOCK");
    await expect(page.getByRole("link", { name: "Criar configuração" })).toHaveCount(0);

    await page.goto("/integrations/connections");
    await expect(page.getByRole("heading", { level: 1, name: "Conexões" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Testar estrutura" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Excluir conexão" })).toHaveCount(0);
  });

  test("viewer não consegue criar conexão nem pela rota direta", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("E-mail").fill(VIEWER.email);
    await page.getByLabel("Senha", { exact: true }).fill(VIEWER.password);
    await page.getByRole("button", { name: "Entrar" }).click();
    await page.waitForURL("**/dashboard");

    await page.goto("/integrations/connections/new?provider=MOCK");
    await expect(page.getByText(/não tem permissão para criar/i)).toBeVisible();

    // e o backend também recusa, se alguém tentar pelo BFF
    const res = await page.request.post("/api/integrations/connections", {
      data: { provider: "MOCK", category: "CUSTOM", name: "viewer tentou" },
    });
    expect(res.status()).toBe(403);
  });
});
