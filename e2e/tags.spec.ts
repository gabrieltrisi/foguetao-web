import { test, expect, type Page } from "@playwright/test";

const EMPTY_STATE = { cookies: [], origins: [] };
const PASS = "Str0ng!Passw0rd";
const VIEWER = { email: "viewer@foguetao.dev", password: PASS };

/** Prefixo das tags criadas por este spec — usado também na limpeza. */
const PREFIX = "E2E Tag";

async function loginAs(page: Page, email: string) {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(PASS);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL("**/dashboard");
}

/**
 * Remove as tags criadas pelo spec. Sem isso elas se acumulariam e poderiam
 * empurrar a tag "VIP" do seed para fora do combobox (limit=100) usado por
 * crm-integration.spec — quebrando outra suíte.
 */
async function purgeE2ETags(page: Page) {
  const res = await page.request.get(`/api/crm/tags?limit=100&search=${encodeURIComponent(PREFIX)}`);
  if (!res.ok()) return;
  const body = (await res.json()) as { items: { id: string; name: string }[] };
  for (const tag of body.items.filter((t) => t.name.startsWith(PREFIX))) {
    await page.request.delete(`/api/crm/tags/${tag.id}`);
  }
}

async function createTagViaUi(page: Page, name: string, color?: string) {
  await page.getByRole("button", { name: "Nova etiqueta" }).click();
  const modal = page.getByRole("dialog");
  await modal.getByLabel("Nome").fill(name);
  if (color) await modal.getByLabel("Cor").fill(color);
  await modal.getByRole("button", { name: "Criar etiqueta" }).click();
}

test.describe("Etiquetas (owner)", () => {
  test.afterEach(async ({ page }) => {
    await purgeE2ETags(page);
  });

  test("lista etiquetas reais e mostra os controles de gestão", async ({ page }) => {
    await page.goto("/tags");
    await expect(page.getByRole("heading", { level: 1, name: "Etiquetas" })).toBeVisible();
    // a tag VIP existe no seed
    await expect(page.getByRole("cell", { name: "VIP", exact: true })).toBeVisible();
    await expect(page.getByPlaceholder("Buscar etiqueta…")).toBeVisible();
    await expect(page.getByRole("button", { name: "Nova etiqueta" })).toBeVisible();
  });

  test("cria etiqueta e ela aparece na listagem", async ({ page }) => {
    const name = `${PREFIX} ${Date.now()}`;
    await page.goto("/tags");
    await createTagViaUi(page, name, "#FF8800");
    await expect(page.getByRole("cell", { name, exact: true })).toBeVisible();
  });

  test("edita a etiqueta e o novo nome aparece", async ({ page }) => {
    const name = `${PREFIX} ${Date.now()}`;
    const renamed = `${name} editada`;
    await page.goto("/tags");
    await createTagViaUi(page, name);
    await expect(page.getByRole("cell", { name, exact: true })).toBeVisible();

    await page.getByRole("button", { name: `Editar ${name}` }).click();
    const modal = page.getByRole("dialog");
    await modal.getByLabel("Nome").fill(renamed);
    await modal.getByRole("button", { name: "Salvar" }).click();

    await expect(page.getByRole("cell", { name: renamed, exact: true })).toBeVisible();
  });

  test("nome duplicado é recusado pelo backend (409)", async ({ page }) => {
    const name = `${PREFIX} ${Date.now()}`;
    await page.goto("/tags");
    await createTagViaUi(page, name);
    await expect(page.getByRole("cell", { name, exact: true })).toBeVisible();

    // mesma tag, de novo → TAG_ALREADY_EXISTS
    await createTagViaUi(page, name);
    await expect(page.getByText(/já existe uma tag com esse nome/i)).toBeVisible();
  });

  test("cor inválida é barrada no formulário, sem chamar o backend", async ({ page }) => {
    await page.goto("/tags");
    await page.getByRole("button", { name: "Nova etiqueta" }).click();
    const modal = page.getByRole("dialog");
    await modal.getByLabel("Nome").fill(`${PREFIX} cor`);
    await modal.getByLabel("Cor").fill("vermelho");
    await expect(modal.getByText(/cor deve ser hex/i)).toBeVisible();
    await expect(modal.getByRole("button", { name: "Criar etiqueta" })).toBeDisabled();
  });

  test("busca filtra pelo servidor", async ({ page }) => {
    const name = `${PREFIX} ${Date.now()}`;
    await page.goto("/tags");
    await createTagViaUi(page, name);
    await expect(page.getByRole("cell", { name, exact: true })).toBeVisible();

    await page.getByPlaceholder("Buscar etiqueta…").fill(name);
    await expect(page.getByRole("cell", { name, exact: true })).toBeVisible();
    // a VIP do seed some do resultado
    await expect(page.getByRole("cell", { name: "VIP", exact: true })).toHaveCount(0);
  });

  test("exclui a etiqueta e ela some da listagem", async ({ page }) => {
    const name = `${PREFIX} ${Date.now()}`;
    await page.goto("/tags");
    await createTagViaUi(page, name);
    await expect(page.getByRole("cell", { name, exact: true })).toBeVisible();

    await page.getByRole("button", { name: `Excluir ${name}` }).click();
    await page.getByRole("button", { name: "Excluir", exact: true }).click();

    await expect(page.getByRole("cell", { name, exact: true })).toHaveCount(0);
  });
});

test.describe("BFF de etiquetas", () => {
  test("GET /api/crm/tags devolve o envelope paginado", async ({ page }) => {
    const res = await page.request.get("/api/crm/tags?limit=20");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({ page: expect.any(Number), total: expect.any(Number) });
    expect(Array.isArray(body.items)).toBe(true);
  });

  test("cor não-HEX é recusada com 400 no BFF", async ({ page }) => {
    const res = await page.request.post("/api/crm/tags", {
      data: { name: "x", color: "vermelho" },
    });
    expect(res.status()).toBe(400);
  });

  test("criar sem nome é recusado com 400", async ({ page }) => {
    const res = await page.request.post("/api/crm/tags", { data: {} });
    expect(res.status()).toBe(400);
  });

  test("PATCH com corpo vazio é recusado com 400", async ({ page }) => {
    const res = await page.request.patch("/api/crm/tags/3f2504e0-4f89-41d3-9a0c-0305e82c3301", {
      data: {},
    });
    expect(res.status()).toBe(400);
  });

  test("id não-UUID é barrado no BFF, sem chegar ao backend", async ({ page }) => {
    const res = await page.request.delete("/api/crm/tags/nao-uuid");
    expect(res.status()).toBe(400);
  });

  test("sortBy fora da allowlist é recusado com 400", async ({ page }) => {
    const res = await page.request.get("/api/crm/tags?sortBy=color");
    expect(res.status()).toBe(400);
  });
});

test.describe("Etiquetas — VIEWER somente leitura", () => {
  test.use({ storageState: EMPTY_STATE });

  test("viewer lê as etiquetas mas não vê nenhuma ação de escrita", async ({ page }) => {
    await loginAs(page, VIEWER.email);
    await page.goto("/tags");

    // VIEWER tem crm.tags.read → vê a listagem
    await expect(page.getByRole("cell", { name: "VIP", exact: true })).toBeVisible();

    // …e nenhuma ação de escrita (sem create/update/delete)
    await expect(page.getByRole("button", { name: "Nova etiqueta" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: /^Editar / })).toHaveCount(0);
    await expect(page.getByRole("button", { name: /^Excluir / })).toHaveCount(0);
  });

  test("o backend recusa o viewer criando etiqueta", async ({ page }) => {
    await loginAs(page, VIEWER.email);
    const res = await page.request.post("/api/crm/tags", { data: { name: "viewer-tag" } });
    expect(res.status()).toBe(403);
  });
});
