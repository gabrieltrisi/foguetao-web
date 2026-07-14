import { test, expect, type Page } from "@playwright/test";

const EMPTY_STATE = { cookies: [], origins: [] };
const VIEWER = { email: "viewer@foguetao.dev", password: "Str0ng!Passw0rd" };
const CONTACT_RE = /\/contacts\/[0-9a-f-]{36}/;

async function createContact(page: Page, first: string, email?: string) {
  await page.goto("/contacts/new");
  await page.getByRole("textbox", { name: "Nome", exact: true }).fill(first);
  if (email) await page.getByRole("textbox", { name: "E-mail", exact: true }).fill(email);
  await page.getByRole("button", { name: "Salvar contato" }).click();
  await page.waitForURL(CONTACT_RE);
}

/* ---------- Owner (storageState) ---------- */

test.describe("CRM — contatos (owner)", () => {
  test("lista contatos reais", async ({ page }) => {
    await page.goto("/contacts");
    await expect(page.getByRole("heading", { level: 1, name: "Contatos" })).toBeVisible();
    // Ao menos uma linha de contato real na tabela.
    await expect(page.locator("tbody tr").first().getByRole("link").first()).toBeVisible();
  });

  test("empty state em busca sem resultados", async ({ page }) => {
    await page.goto("/contacts");
    await page.getByPlaceholder("Buscar contatos…").fill("zzz-nao-existe-xyz");
    await expect(page.getByText("Nenhum contato encontrado.")).toBeVisible();
  });

  test("contato inexistente mostra não encontrado", async ({ page }) => {
    await page.goto("/contacts/00000000-0000-4000-8000-000000000000");
    await expect(page.getByText("Contato não encontrado.")).toBeVisible();
  });

  test("ciclo completo: criar, nota, atividade, tag, arquivar e restaurar", async ({ page }) => {
    const stamp = Date.now();
    await createContact(page, `E2E Contato ${stamp}`, `e2e-${stamp}@teste.dev`);
    await expect(page.getByRole("heading", { level: 1, name: new RegExp(`E2E Contato ${stamp}`) })).toBeVisible();

    // Nota
    await page.getByRole("tab", { name: /Notas/ }).click();
    await page.getByLabel("Nova nota").fill("Primeira nota e2e");
    await page.getByRole("button", { name: "Adicionar nota" }).click();
    await expect(page.getByText("Primeira nota e2e")).toBeVisible();

    // Atividade
    await page.getByRole("tab", { name: /Atividades/ }).click();
    await page.getByLabel("Nova atividade").fill("Ligação de prospecção");
    await page.getByRole("button", { name: "Registrar" }).click();
    await expect(page.getByText("Ligação de prospecção")).toBeVisible();

    // Tag (VIP existe no seed)
    await page.getByRole("button", { name: /Adicionar tag…/ }).click();
    await page.getByRole("option", { name: "VIP" }).click();
    await page.getByRole("button", { name: "Adicionar tag" }).click();
    await expect(page.getByRole("button", { name: "Remover tag VIP" })).toBeVisible();

    // Arquivar (status no aside)
    await page.getByRole("button", { name: "Mais ações" }).click();
    await page.getByRole("menuitem", { name: "Arquivar" }).click();
    await expect(page.locator("aside").getByText("Arquivado")).toBeVisible();

    // Restaurar (status no aside deixa de ser "Arquivado")
    await page.getByRole("button", { name: "Mais ações" }).click();
    await page.getByRole("menuitem", { name: "Restaurar" }).click();
    await expect(page.locator("aside").getByText("Arquivado")).toHaveCount(0);
  });

  test("editar contato altera o cargo", async ({ page }) => {
    const stamp = Date.now();
    await createContact(page, `Editar ${stamp}`, `edit-${stamp}@teste.dev`);
    const url = page.url();
    const id = url.match(/contacts\/([0-9a-f-]{36})/)![1];
    await page.goto(`/contacts/${id}/edit`);
    await page.getByRole("textbox", { name: "Cargo" }).fill("Diretor Comercial");
    await page.getByRole("button", { name: "Salvar alterações" }).click();
    await page.waitForURL(`**/contacts/${id}`);
    await expect(page.getByText("Diretor Comercial").first()).toBeVisible();
  });

  test("e-mail duplicado é rejeitado", async ({ page }) => {
    const stamp = Date.now();
    const email = `dup-${stamp}@teste.dev`;
    await createContact(page, `Dup A ${stamp}`, email);
    // segunda criação com o mesmo e-mail
    await page.goto("/contacts/new");
    await page.getByRole("textbox", { name: "Nome", exact: true }).fill(`Dup B ${stamp}`);
    await page.getByRole("textbox", { name: "E-mail", exact: true }).fill(email);
    await page.getByRole("button", { name: "Salvar contato" }).click();
    await expect(page.getByText(/Já existe um contato com este e-mail/)).toBeVisible();
    await expect(page).toHaveURL(/\/contacts\/new/);
  });
});

test.describe("CRM — organizações (owner)", () => {
  test("cria e edita organização", async ({ page }) => {
    const stamp = Date.now();
    await page.goto("/organizations/new");
    await page.getByRole("textbox", { name: "Nome", exact: true }).fill(`Org E2E ${stamp}`);
    await page.getByRole("textbox", { name: "Segmento" }).fill("Tecnologia");
    await page.getByRole("button", { name: "Salvar organização" }).click();
    await page.waitForURL(/\/organizations\/[0-9a-f-]{36}/);
    await expect(page.getByRole("heading", { level: 1, name: new RegExp(`Org E2E ${stamp}`) })).toBeVisible();

    const id = page.url().match(/organizations\/([0-9a-f-]{36})/)![1];
    await page.goto(`/organizations/${id}/edit`);
    await page.getByRole("textbox", { name: "Website" }).fill("https://e2e.example.com");
    await page.getByRole("button", { name: "Salvar alterações" }).click();
    await page.waitForURL(`**/organizations/${id}`);
    await expect(page.getByText("https://e2e.example.com")).toBeVisible();
  });

  test("impede exclusão de organização com contatos", async ({ page }) => {
    await page.goto("/organizations");
    await page.getByRole("link", { name: "Acme Seed" }).first().click();
    await page.waitForURL(/\/organizations\/[0-9a-f-]{36}/);
    await page.getByRole("button", { name: "Mais ações" }).click();
    await page.getByRole("button", { name: "Excluir organização" }).click();
    await page.getByRole("button", { name: "Excluir" }).click();
    await expect(page.getByText(/Remova ou realoque os contatos/)).toBeVisible();
  });
});

/* ---------- Viewer (somente leitura) ---------- */

test.describe("CRM — VIEWER somente leitura", () => {
  test.use({ storageState: EMPTY_STATE });

  test("viewer não vê ações de escrita", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("E-mail").fill(VIEWER.email);
    await page.getByLabel("Senha", { exact: true }).fill(VIEWER.password);
    await page.getByRole("button", { name: "Entrar" }).click();
    await page.waitForURL("**/dashboard");

    await page.goto("/contacts");
    await expect(page.locator("tbody tr").first().getByRole("link").first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Novo contato" })).toHaveCount(0);

    await page.locator("tbody tr").first().getByRole("link").first().click();
    await page.waitForURL(CONTACT_RE);
    await expect(page.getByRole("link", { name: "Editar" })).toHaveCount(0);
  });
});
