import { test, expect, type Page } from "@playwright/test";

const EMPTY_STATE = { cookies: [], origins: [] };
const VIEWER = { email: "viewer@foguetao.dev", password: "Str0ng!Passw0rd" };
const PIPELINE_RE = /\/pipelines\/[0-9a-f-]{36}/;

async function createPipeline(page: Page, name: string, mode: "Padrão" | "Personalizado" | "Vazio") {
  await page.goto("/pipelines/new");
  await page.getByRole("textbox", { name: "Nome", exact: true }).fill(name);
  await page.getByRole("tab", { name: mode, exact: true }).click();
  await page.getByRole("button", { name: "Criar pipeline" }).click();
}

test.describe("Pipelines (owner)", () => {
  test("lista pipelines reais", async ({ page }) => {
    await page.goto("/pipelines");
    await expect(page.getByRole("heading", { level: 1, name: "Pipelines" })).toBeVisible();
    await expect(page.locator("tbody tr").first().getByRole("link").first()).toBeVisible();
    // o seed possui um pipeline padrão
    await expect(page.getByText("Padrão").first()).toBeVisible();
  });

  test("cria pipeline STANDARD com etapas provisionadas", async ({ page }) => {
    const name = `E2E Standard ${Date.now()}`;
    await createPipeline(page, name, "Padrão");
    await page.waitForURL(PIPELINE_RE);
    await expect(page.getByRole("heading", { level: 1, name })).toBeVisible();
    await expect(page.getByText("Configuração completa")).toBeVisible();
    // etapas provisionadas pelo backend
    await expect(page.getByText(/Etapas \([1-9]/)).toBeVisible();
  });

  test("cria pipeline CUSTOM válido", async ({ page }) => {
    const name = `E2E Custom ${Date.now()}`;
    await page.goto("/pipelines/new");
    await page.getByRole("textbox", { name: "Nome", exact: true }).fill(name);
    await page.getByRole("tab", { name: "Personalizado", exact: true }).click();
    // as etapas padrão do editor já satisfazem as invariantes
    await page.getByRole("button", { name: "Criar pipeline" }).click();
    await page.waitForURL(PIPELINE_RE);
    await expect(page.getByText("Configuração completa")).toBeVisible();
  });

  test("rejeita CUSTOM inválido (sem etapa Ganha)", async ({ page }) => {
    await page.goto("/pipelines/new");
    await page.getByRole("textbox", { name: "Nome", exact: true }).fill(`E2E Inválido ${Date.now()}`);
    await page.getByRole("tab", { name: "Personalizado", exact: true }).click();
    // remove a etapa "Ganho" (3ª linha do editor padrão)
    await page.getByRole("button", { name: "Remover etapa 3" }).click();
    await page.getByRole("button", { name: "Criar pipeline" }).click();
    await expect(page.getByText(/exatamente 1 etapa Ganha/)).toBeVisible();
    await expect(page).toHaveURL(/\/pipelines\/new/);
  });

  test("cria EMPTY, impede padrão e configura via setup", async ({ page }) => {
    const name = `E2E Empty ${Date.now()}`;
    await createPipeline(page, name, "Vazio");
    await page.waitForURL(PIPELINE_RE);

    // Estado incompleto
    await expect(page.getByText("Configuração incompleta")).toBeVisible();
    await expect(page.getByText(/Falta:/)).toBeVisible();
    // Não pode virar padrão enquanto incompleto
    await expect(page.getByRole("button", { name: /Tornar padrão/ })).toBeDisabled();

    // Configura com etapas padrão
    await page.getByRole("button", { name: "Configurar pipeline" }).click();
    await expect(page.getByText("Configuração completa")).toBeVisible();
    await expect(page.getByRole("button", { name: /Tornar padrão/ })).toBeEnabled();
  });

  test("gerencia etapas: criar, editar e reordenar", async ({ page }) => {
    const name = `E2E Stages ${Date.now()}`;
    await createPipeline(page, name, "Padrão");
    await page.waitForURL(PIPELINE_RE);

    // Criar etapa
    await page.getByLabel("Nova etapa").fill("Qualificação E2E");
    await page.getByRole("button", { name: "Adicionar" }).click();
    await expect(page.getByText("Qualificação E2E")).toBeVisible();

    // Editar etapa
    const stagesList = page.getByRole("list", { name: "Etapas do pipeline" });
    await stagesList.getByRole("listitem").filter({ hasText: "Qualificação E2E" }).getByRole("button", { name: "Editar" }).click();
    await page.getByRole("textbox", { name: "Nome" }).last().fill("Qualificação Editada");
    await page.getByRole("button", { name: "Salvar etapa" }).click();
    await expect(page.getByText("Qualificação Editada")).toBeVisible();

    // Reordenar (mover a primeira para baixo)
    const first = stagesList.getByRole("listitem").first();
    const firstName = await first.locator("p").first().textContent();
    await first.getByRole("button", { name: /para baixo/ }).click();
    await expect(stagesList.getByRole("listitem").first().locator("p").first()).not.toHaveText(firstName ?? "");
  });
});

test.describe("Pipelines — VIEWER somente leitura", () => {
  test.use({ storageState: EMPTY_STATE });

  test("viewer não vê ações de escrita", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("E-mail").fill(VIEWER.email);
    await page.getByLabel("Senha", { exact: true }).fill(VIEWER.password);
    await page.getByRole("button", { name: "Entrar" }).click();
    await page.waitForURL("**/dashboard");

    await page.goto("/pipelines");
    await expect(page.locator("tbody tr").first().getByRole("link").first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Novo pipeline" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: /Tornar padrão/ })).toHaveCount(0);
  });
});
