import { test, expect, type Page } from "@playwright/test";

const EMPTY_STATE = { cookies: [], origins: [] };
const PASS = "Str0ng!Passw0rd";
const VIEWER = { email: "viewer@foguetao.dev", password: PASS };

async function loginAs(page: Page, email: string) {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(PASS);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL("**/dashboard");
}

/** Abre um Combobox pelo texto ATUAL do gatilho e escolhe uma opção. */
async function pick(page: Page, currentValue: string, option: string | RegExp) {
  await page.getByRole("button", { name: currentValue, exact: true }).click();
  await page.getByRole("option", { name: option }).click();
}

test.describe("Papéis (owner)", () => {
  test("lista os 9 papéis do sistema, sem ação de edição", async ({ page }) => {
    await page.goto("/roles");
    await expect(page.getByRole("heading", { level: 1, name: "Papéis" })).toBeVisible();

    // aviso obrigatório
    await expect(page.getByText(/papéis atuais são definidos pelo sistema/i)).toBeVisible();

    // os 9 papéis reais
    for (const name of [
      "Proprietário",
      "Administrador",
      "Gerente",
      "Marketing",
      "Comercial",
      "Suporte",
      "Financeiro",
      "Afiliado",
      "Visualizador",
    ]) {
      await expect(page.getByRole("heading", { level: 3, name })).toBeVisible();
    }

    // NENHUMA ação de edição/criação/exclusão
    await expect(page.getByRole("button", { name: /novo papel/i })).toHaveCount(0);
    await expect(page.getByRole("button", { name: /^Configurar$/ })).toHaveCount(0);
    await expect(page.getByText("Papel do sistema").first()).toBeVisible();
  });

  test("cada card mostra contagem real de permissões e enum", async ({ page }) => {
    await page.goto("/roles");
    // OWNER: o enum e a contagem aparecem no grid (não na navegação)
    await expect(page.getByText("OWNER", { exact: true })).toBeVisible();
    await expect(page.getByText(/permissões/).first()).toBeVisible();
    await expect(page.getByText(/rank/).first()).toBeVisible();
  });
});

test.describe("Permissões (owner)", () => {
  test("matriz somente leitura, sem switches", async ({ page }) => {
    await page.goto("/permissions");
    await expect(page.getByRole("heading", { level: 1, name: "Permissões" })).toBeVisible();
    await expect(page.getByText(/somente leitura/i)).toBeVisible();

    // A matriz de leitura NÃO usa switches interativos.
    await expect(page.getByRole("switch")).toHaveCount(0);
    // Botão de salvar do mock não existe mais.
    await expect(page.getByRole("button", { name: /salvar/i })).toHaveCount(0);
  });

  test("troca o papel e a matriz muda", async ({ page }) => {
    await page.goto("/permissions?role=VIEWER");
    // VIEWER: alguma permissão de escrita aparece como não concedida
    await expect(page.getByText(/Visualizador/).first()).toBeVisible();

    // conta as concedidas do VIEWER
    const summary = page.getByText(/de \d+ permissões/);
    await expect(summary).toBeVisible();
    const viewerText = await summary.textContent();

    // troca para OWNER — deve ter mais permissões
    await pick(page, "Visualizador", "Proprietário");
    await expect(page.getByText(/Proprietário/).first()).toBeVisible();
    const ownerText = await page.getByText(/de \d+ permissões/).textContent();
    expect(ownerText).not.toBe(viewerText);
  });

  test("busca por permissão filtra a matriz", async ({ page }) => {
    await page.goto("/permissions?role=OWNER");
    await page.getByPlaceholder("Buscar permissão…").fill("deals");
    // aparecem permissões de deals…
    await expect(page.getByText("crm.deals.read").first()).toBeVisible();
    // …e some o que não casa
    await expect(page.getByText("company.read")).toHaveCount(0);
  });

  test("filtra por módulo", async ({ page }) => {
    await page.goto("/permissions?role=OWNER");
    await pick(page, "Todos os módulos", "Faturamento");
    await expect(page.getByText("billing.read").first()).toBeVisible();
    await expect(page.getByText("crm.contacts.read")).toHaveCount(0);
  });

  test("compara dois papéis lado a lado", async ({ page }) => {
    await page.goto("/permissions?role=OWNER");
    await pick(page, "Nenhum", "Visualizador");
    await expect(page.getByText(/comparando com/i)).toBeVisible();
    await expect(page.getByText(/Visualizador/).first()).toBeVisible();
  });

  test("mostra a hierarquia real do papel (managedBy / canManage)", async ({ page }) => {
    await page.goto("/permissions?role=ADMIN");
    await expect(page.getByText("Pode ser gerenciado por")).toBeVisible();
    await expect(page.getByText("Pode gerenciar")).toBeVisible();
    // ADMIN é gerenciado por OWNER (Proprietário)
    const managedBy = page
      .locator("div")
      .filter({ hasText: "Pode ser gerenciado por" })
      .first();
    await expect(managedBy.getByText("Proprietário")).toBeVisible();
  });

  test("a matriz corresponde ao backend (permissão concedida vs. crua)", async ({ page }) => {
    // Busca o contrato real e confere que a UI reflete pelo menos um caso.
    const api = await page.request.get("/api/admin/roles");
    expect(api.status()).toBe(200);
    const roles = (await api.json()).items as { role: string; permissions: string[] }[];
    const viewer = roles.find((r) => r.role === "VIEWER")!;
    expect(viewer.permissions).toContain("company.read");
    expect(viewer.permissions).not.toContain("company.update");

    await page.goto("/permissions?role=VIEWER");
    await page.getByPlaceholder("Buscar permissão…").fill("company.update");
    // company.update existe no catálogo, mas VIEWER não concede → ícone de não concedido
    await expect(page.getByLabel(/não concedido/i).first()).toBeVisible();
  });
});

test.describe("Permissões do BFF", () => {
  test("GET /api/admin/roles devolve o contrato real", async ({ page }) => {
    const res = await page.request.get("/api/admin/roles");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.items).toHaveLength(9);
    const owner = body.items.find((r: { role: string }) => r.role === "OWNER");
    expect(owner).toMatchObject({ system: true, name: "Proprietário" });
    expect(owner.permissions.length).toBeGreaterThan(0);
  });

  test("GET /api/admin/permissions agrupa por domínio", async ({ page }) => {
    const res = await page.request.get("/api/admin/permissions");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.total).toBeGreaterThan(0);
    expect(body.groups.some((g: { key: string }) => g.key === "crm")).toBe(true);
  });
});

test.describe("VIEWER sem company.roles.read", () => {
  test.use({ storageState: EMPTY_STATE });

  test("VIEWER não vê /roles nem /permissions e o backend recusa", async ({ page }) => {
    // VIEWER não tem company.roles.read (confirmado na auditoria do RBAC).
    await loginAs(page, VIEWER.email);

    await page.goto("/roles");
    await expect(page.getByText(/não tem permissão para ver os papéis/i)).toBeVisible();

    await page.goto("/permissions");
    await expect(page.getByText(/não tem permissão para ver as permissões/i)).toBeVisible();

    // e o backend também recusa, se alguém tentar direto pelo BFF
    const roles = await page.request.get("/api/admin/roles");
    expect(roles.status()).toBe(403);
    const perms = await page.request.get("/api/admin/permissions");
    expect(perms.status()).toBe(403);
  });

  test("a navegação de administração esconde os links para o VIEWER", async ({ page }) => {
    await loginAs(page, VIEWER.email);
    await page.goto("/settings");
    const nav = page.getByRole("navigation", { name: "Administração" });
    await expect(nav.getByRole("link", { name: "Papéis" })).toHaveCount(0);
    await expect(nav.getByRole("link", { name: "Permissões" })).toHaveCount(0);
  });
});
