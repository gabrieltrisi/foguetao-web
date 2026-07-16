import { test, expect, type Page } from "@playwright/test";

const EMPTY_STATE = { cookies: [], origins: [] };
const PASS = "Str0ng!Passw0rd";
const VIEWER = { email: "viewer@foguetao.dev", password: PASS };

/** Chaves/segredos que JAMAIS podem aparecer no corpo da auditoria. */
const FORBIDDEN = /authorization|bearer|refresh_?token|access_?token|password|secret|cookie|"set-cookie"/i;

async function loginAs(page: Page, email: string) {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(PASS);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL("**/dashboard");
}

/** Gera pelo menos um registro de auditoria company-scoped (COMPANY_UPDATED). */
async function seedAuditRow(page: Page) {
  const res = await page.request.patch("/api/company", { data: { locale: "pt-BR" } });
  expect(res.ok()).toBe(true);
}

test.describe("Auditoria (owner)", () => {
  test.beforeEach(async ({ page }) => {
    await seedAuditRow(page);
  });

  test("lista dados reais com filtros, busca e cabeçalhos", async ({ page }) => {
    await page.goto("/audit");
    await expect(page.getByRole("heading", { level: 1, name: "Auditoria" })).toBeVisible();

    // aviso de sanitização obrigatório
    await expect(page.getByText(/dados sensíveis .* nunca são exibidos/i)).toBeVisible();

    // controles reais de filtro/busca (o Combobox se identifica pelo valor atual)
    await expect(page.getByPlaceholder(/Request ID/i)).toBeVisible();
    await expect(page.getByRole("button", { name: "Todas as ações", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Todos os recursos", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: /Ordenar por data/i })).toBeVisible();

    // cabeçalhos da tabela
    for (const h of ["Data", "Ação", "Recurso", "Ator", "Origem"]) {
      await expect(page.getByRole("columnheader", { name: h })).toBeVisible();
    }

    // há pelo menos uma linha real com botão de detalhe
    await expect(page.getByRole("button", { name: "Ver" }).first()).toBeVisible();
  });

  test("abre o detalhe lateral com RequestId, origem e aviso de sanitização", async ({ page }) => {
    await page.goto("/audit");
    await page.getByRole("button", { name: "Ver" }).first().click();

    const sheet = page.getByRole("dialog");
    await expect(sheet).toBeVisible();
    await expect(sheet.getByText("Request ID", { exact: true })).toBeVisible();
    await expect(sheet.getByText("Origem", { exact: true })).toBeVisible();
    await expect(sheet.getByText("Metadata", { exact: true })).toBeVisible();
    await expect(sheet.getByText(/nunca são exibidos/i)).toBeVisible();

    // Nenhum segredo/credencial no corpo do detalhe. (O mascaramento de IP
    // público é coberto pelos testes unitários de maskIp; em e2e o IP é local.)
    const body = await sheet.textContent();
    expect(body ?? "").not.toMatch(FORBIDDEN);
  });

  test("filtra por ação e ordena por data sem erro", async ({ page }) => {
    await page.goto("/audit");
    await page.getByRole("button", { name: "Todas as ações", exact: true }).click();
    await page.getByRole("option", { name: "Empresa atualizada" }).click();
    // a linha filtrada aparece
    await expect(page.getByText("Empresa atualizada").first()).toBeVisible();

    // inverte a ordem
    await page.getByRole("button", { name: /Ordenar por data/i }).click();
    await expect(page.getByRole("columnheader", { name: "Data" })).toBeVisible();
  });

  test("busca sem correspondência mostra estado vazio", async ({ page }) => {
    await page.goto("/audit");
    await page.getByPlaceholder(/Request ID/i).fill("zzz-nao-existe-000");
    await expect(page.getByText(/Nenhum registro de auditoria/i)).toBeVisible();
  });
});

test.describe("Activity Log (owner) — mesma fonte", () => {
  test.beforeEach(async ({ page }) => {
    await seedAuditRow(page);
  });

  test("renderiza a timeline a partir dos mesmos dados", async ({ page }) => {
    await page.goto("/activity-log");
    await expect(page.getByRole("heading", { level: 1, name: "Atividades" })).toBeVisible();
    await expect(page.getByPlaceholder(/Request ID/i)).toBeVisible();
    // pelo menos uma atividade real (COMPANY_UPDATED → "Empresa atualizada")
    await expect(page.getByText("Empresa atualizada").first()).toBeVisible();

    const body = await page.locator("main").textContent();
    expect(body ?? "").not.toMatch(FORBIDDEN);
  });
});

test.describe("BFF de auditoria", () => {
  test("GET /api/admin/audit devolve o envelope paginado sem segredos", async ({ page }) => {
    await seedAuditRow(page);
    const res = await page.request.get("/api/admin/audit?limit=20");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({
      page: expect.any(Number),
      limit: expect.any(Number),
      total: expect.any(Number),
      totalPages: expect.any(Number),
    });
    expect(Array.isArray(body.items)).toBe(true);
    // nenhum registro expõe companyId nem chave sensível
    const raw = JSON.stringify(body);
    expect(raw).not.toMatch(/"companyId"/);
    expect(raw).not.toMatch(FORBIDDEN);
  });

  test("filtros inválidos são recusados com 400", async ({ page }) => {
    const res = await page.request.get("/api/admin/audit?limit=99999");
    expect(res.status()).toBe(400);
  });

  test("detalhe com id não-UUID é recusado com 400", async ({ page }) => {
    const res = await page.request.get("/api/admin/audit/nao-uuid");
    expect(res.status()).toBe(400);
  });
});

test.describe("VIEWER sem company.audit.read", () => {
  test.use({ storageState: EMPTY_STATE });

  test("não vê a auditoria e o backend recusa; a navegação esconde os links", async ({ page }) => {
    await loginAs(page, VIEWER.email);

    await page.goto("/audit");
    await expect(page.getByText(/não tem permissão para ver a auditoria/i)).toBeVisible();

    await page.goto("/activity-log");
    await expect(page.getByText(/não tem permissão para ver as atividades/i)).toBeVisible();

    // o BFF/backend também recusa se chamado direto
    const res = await page.request.get("/api/admin/audit");
    expect(res.status()).toBe(403);

    // os links da navegação de analytics somem
    await page.goto("/reports");
    const nav = page.getByRole("navigation", { name: "Analytics" });
    await expect(nav.getByRole("link", { name: "Auditoria" })).toHaveCount(0);
    await expect(nav.getByRole("link", { name: "Atividades" })).toHaveCount(0);
  });
});
