import { test, expect, type Page } from "@playwright/test";

const EMPTY_STATE = { cookies: [], origins: [] };
// IMPORTANTE: os testes de sessão isolada usam COMMERCIAL, não OWNER. O backend
// revoga TODA a família de sessões do usuário ao detectar reuso de refresh token
// (rotação sob next start multi-worker). Usar owner aqui mataria a sessão
// compartilhada (storageState) e cascataria falhas nos demais specs.
const COMMERCIAL = { email: "commercial@foguetao.dev", password: "Str0ng!Passw0rd" };
const VIEWER = { email: "viewer@foguetao.dev", password: "Str0ng!Passw0rd" };

async function login(page: Page, creds: { email: string; password: string }) {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(creds.email);
  await page.getByLabel("Senha", { exact: true }).fill(creds.password);
  await page.getByRole("button", { name: "Entrar" }).click();
}

/* ---------- Fluxos com sessão própria (não tocam a sessão compartilhada) ---------- */

test.describe("Autenticação (sessão isolada)", () => {
  test.use({ storageState: EMPTY_STATE });

  test("login real redireciona para o dashboard", async ({ page }) => {
    await login(page, COMMERCIAL);
    await page.waitForURL("**/dashboard");
    await expect(page.getByRole("heading", { name: "Visão geral", level: 1 })).toBeVisible();
  });

  test("credenciais inválidas exibem erro", async ({ page }) => {
    await login(page, { email: "commercial@foguetao.dev", password: "senha-errada" });
    await expect(page.getByText(/E-mail ou senha incorretos/)).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test("menu administrativo respeita permissões (viewer não vê Equipe)", async ({ page }) => {
    await login(page, VIEWER);
    await page.waitForURL("**/dashboard");
    await page.goto("/settings");
    const adminNav = page.getByRole("navigation", { name: "Administração" });
    await expect(adminNav.getByRole("link", { name: "Empresa" })).toBeVisible();
    await expect(adminNav.getByRole("link", { name: "Equipe" })).toHaveCount(0);
    await expect(adminNav.getByRole("link", { name: "Permissões" })).toHaveCount(0);
  });

  test("refresh coordenado: sem access token, a sessão é renovada", async ({ page, context }) => {
    await login(page, COMMERCIAL);
    await page.waitForURL("**/dashboard");
    // Remove apenas o access token; o refresh token (httpOnly) permanece.
    await context.clearCookies({ name: "fg_at" });
    await page.reload();
    // O BFF renova via /auth/refresh e a rota protegida continua acessível.
    await expect(page.getByRole("heading", { name: "Visão geral", level: 1 })).toBeVisible();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("logout encerra a sessão e protege as rotas", async ({ page }) => {
    await login(page, COMMERCIAL);
    await page.waitForURL("**/dashboard");
    await page.getByRole("button", { name: "Conta" }).first().click();
    await page.getByRole("menuitem", { name: "Sair" }).click();
    await page.waitForURL(/\/login/);
    // Sem sessão, a rota protegida redireciona novamente para /login.
    await page.goto("/dashboard");
    await page.waitForURL(/\/login/);
    await expect(page.getByRole("heading", { name: "Bem-vindo de volta" })).toBeVisible();
  });
});

/* ---------- Fluxos read-only com a sessão compartilhada (owner via storageState) ---------- */

test.describe("Sessão autenticada (owner, read-only)", () => {
  test("company switcher mostra a empresa ativa", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/dashboard");
    await expect(page.getByRole("button", { name: /Empresa Seed/ })).toBeVisible();
  });

  test("equipe carrega membros reais da empresa", async ({ page }) => {
    await page.goto("/team");
    await expect(page.getByText(/membro\(s\) na empresa ativa/)).toBeVisible();
    await expect(page.locator("table").getByText("owner@foguetao.dev")).toBeVisible();
  });

  test("sessões lista as sessões ativas reais", async ({ page }) => {
    // A tela de sessões foi consolidada num único componente (Sprint 1.0D-4):
    // dados reais de /auth/sessions, com IP mascarado. Cobertura completa em
    // security.spec.ts.
    await page.goto("/sessions");
    await expect(
      page.getByRole("heading", { name: "Sessões e dispositivos", level: 1 }),
    ).toBeVisible();
    await expect(page.getByText(/sess(ão|ões).*ativa/i).first()).toBeVisible();
  });

  test("trocar para empresa inacessível é rejeitado", async ({ page }) => {
    await page.goto("/dashboard");
    const res = await page.request.post("/api/companies/active", {
      data: { companyId: "00000000-0000-4000-8000-000000000000" },
    });
    expect(res.ok()).toBe(false);
    expect(res.status()).toBeGreaterThanOrEqual(400);
  });
});
