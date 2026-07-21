import { test, expect, type Page } from "@playwright/test";

function trackErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(err.message));
  return errors;
}

async function hasHorizontalOverflow(page: Page): Promise<boolean> {
  return page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );
}

const routes = [
  "/settings",
  "/company",
  "/company/general",
  "/company/branding",
  "/company/domains",
  "/company/plans",
  "/company/billing",
  "/company/limits",
  "/team",
  "/team/new",
  "/roles",
  "/permissions",
  "/invitations",
  "/security",
  "/sessions",
  "/api-keys",
  "/integrations",
  "/marketplace",
  "/onboarding",
];

const mobileRoutes = [
  "/settings",
  "/company/branding",
  "/company/plans",
  "/team",
  "/permissions",
  "/company/billing",
  "/integrations",
  "/marketplace",
  "/onboarding",
];

test.describe("Admin — desktop 1440", () => {
  for (const route of routes) {
    test(`${route} sem overflow nem erros`, async ({ page }) => {
      const errors = trackErrors(page);
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(route);
      await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(150);
      expect(await hasHorizontalOverflow(page), `overflow em ${route}`).toBe(false);
      expect(errors, `console em ${route}`).toEqual([]);
    });
  }
});

test.describe("Admin — mobile 390", () => {
  for (const route of mobileRoutes) {
    test(`${route} sem overflow @ 390`, async ({ page }) => {
      const errors = trackErrors(page);
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(route);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(150);
      expect(await hasHorizontalOverflow(page), `overflow em ${route}`).toBe(false);
      expect(errors, `console em ${route}`).toEqual([]);
    });
  }
});

test.describe("Admin — interações", () => {
  test("preview de branding atualiza em tempo real", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/company/branding");
    const name = page.getByLabel("Nome da empresa");
    await name.fill("Minha Marca");
    await expect(page.getByText("Minha Marca").first()).toBeVisible();
  });

  test("compara planos e mostra o plano real", async ({ page }) => {
    // Sprint 1.0D-3: o plano ATUAL vem do backend. Não existe rota de upgrade
    // (o campo `plan` não é editável), então o botão foi desativado em vez de
    // simular um upgrade. Cobertura completa em company.spec.ts.
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/company/plans");
    await expect(page.getByText("Mais popular")).toBeVisible();
    await expect(page.getByText(/Enterprise/).first()).toBeVisible();
    await expect(page.getByText("Plano atual").first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Fazer upgrade" })).toHaveCount(0);
  });

  test("exibe barras de progresso nos limites", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/company/limits");
    expect(await page.getByRole("progressbar").count()).toBeGreaterThan(4);
  });

  test("exibe o formulário de convite", async ({ page }) => {
    // Sprint 1.0D-2: o backend não cria contas por aqui — /team/new emite um
    // CONVITE, que a pessoa aceita com a própria conta.
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/team/new");
    await expect(page.getByRole("heading", { level: 1, name: "Convidar membro" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "E-mail", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Enviar convite" })).toBeVisible();
  });

  test("abre o perfil real de um membro", async ({ page }) => {
    // O perfil mock tinha abas (Sessões etc.). O real mostra papel, status e
    // as ações permitidas — cobertura completa em team.spec.ts.
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/team");
    await page.locator("tbody").getByText("Commercial Dev").click();
    await page.waitForURL(/\/team\/[0-9a-f-]{36}/);
    await expect(page.getByRole("heading", { level: 1, name: "Commercial Dev" })).toBeVisible();
    await expect(page.getByText("Papel", { exact: true })).toBeVisible();
  });

  test("a matriz de permissões é somente leitura (sem switches)", async ({ page }) => {
    // Sprint 1.0D-5: a matriz virou real e SOMENTE LEITURA — os switches
    // editáveis do mock deram lugar a ícones de concedido/não concedido.
    // Cobertura completa em rbac.spec.ts.
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/permissions");
    await expect(page.getByText(/somente leitura/i)).toBeVisible();
    await expect(page.getByRole("switch")).toHaveCount(0);
  });

  test("filtra integrações por categoria", async ({ page }) => {
    // O catálogo agora é real (Sprint 1.0D-1): as categorias vêm do backend,
    // não do antigo mock com abas fixas. Cobertura completa em integrations.spec.ts.
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/integrations");
    const catalog = page.getByRole("list", { name: "Catálogo de integrações" });
    await expect(catalog.getByText("Integração MOCK")).toBeVisible();

    await page.getByRole("button", { name: "Todas as categorias" }).click();
    await page.getByRole("option", { name: "Anúncios" }).click();
    await expect(catalog.getByText("Meta Ads")).toBeVisible();
    await expect(catalog.getByText("Integração MOCK")).toHaveCount(0);
  });

  test("mascara valores no API Keys", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/api-keys");
    await expect(page.getByText(/sk_live_••••/).first()).toBeVisible();
  });

  test("redireciona ao dashboard quando o usuário já tem empresa", async ({ page }) => {
    // Sprint MVP 1: o onboarding agora cria a PRIMEIRA empresa. O SessionGate
    // impede que um usuário que já possui empresa (caso deste e2e autenticado)
    // fique preso no onboarding — ele é levado direto ao dashboard.
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/onboarding");
    await expect(page.getByRole("heading", { name: "Visão geral", level: 1 })).toBeVisible();
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
