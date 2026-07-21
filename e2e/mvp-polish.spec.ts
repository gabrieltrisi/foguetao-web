import { test, expect, type Page } from "@playwright/test";

/**
 * Contrato de polimento do MVP (Sprint 1.1): a experiência normal não deve
 * expor módulos preview/mock nem elementos "não entregues". Usa o owner
 * (storageState do setup) e apenas NAVEGA (não muta sessão).
 */

function trackConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  return errors;
}

const MVP_PAGES: { path: string; heading: string }[] = [
  { path: "/dashboard", heading: "Visão geral" },
  { path: "/tasks", heading: "Tarefas" },
  { path: "/contacts", heading: "Contatos" },
  { path: "/organizations", heading: "Organizações" },
  { path: "/pipeline", heading: "Pipeline" },
  { path: "/deals", heading: "Oportunidades" },
  { path: "/campaigns", heading: "Campanhas" },
  { path: "/settings", heading: "Configurações" },
];

test.describe("MVP polish — navegação limpa", () => {
  for (const p of MVP_PAGES) {
    test(`${p.path} carrega com título e sem erros`, async ({ page }) => {
      const errors = trackConsoleErrors(page);
      await page.goto(p.path);
      await expect(page.getByRole("heading", { level: 1, name: p.heading })).toBeVisible();
      expect(errors, `erros de console em ${p.path}`).toEqual([]);
    });
  }

  test("sidebar mostra só os módulos do MVP (sem Ajuda/Conversas/WhatsApp/Integrações)", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    const sidebar = page.getByRole("navigation", { name: "Navegação principal" });
    for (const ok of ["Contatos", "Oportunidades", "Campanhas", "Configurações", "Tarefas"]) {
      await expect(sidebar.getByRole("link", { name: ok })).toBeVisible();
    }
    for (const hidden of ["Ajuda", "Conversas", "WhatsApp", "Integrações", "Meta Ads", "Automações"]) {
      await expect(sidebar.getByRole("link", { name: hidden })).toHaveCount(0);
    }
  });

  test("header não tem busca global morta", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(
      page.getByPlaceholder("Buscar contatos, oportunidades e conversas…"),
    ).toHaveCount(0);
  });

  test("menu Criar leva a rotas reais e sem 'Nova mensagem'", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("button", { name: "Criar" }).click();
    await expect(page.getByRole("menuitem", { name: "Novo contato" })).toHaveAttribute(
      "href",
      "/contacts/new",
    );
    await expect(page.getByRole("menuitem", { name: "Nova campanha" })).toHaveAttribute(
      "href",
      "/campaigns/new",
    );
    await expect(page.getByRole("menuitem", { name: "Nova mensagem" })).toHaveCount(0);
  });

  test("notificações não mostram dados fictícios", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("button", { name: "Notificações" }).click();
    await expect(page.getByText("Você está em dia.")).toBeVisible();
    await expect(page.getByText(/Vertex Farma|Zenit Corp|Black Week/)).toHaveCount(0);
  });

  test("dashboard não expõe módulos ocultos (Conversas/activity-log)", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("link", { name: "Abrir inbox" })).toHaveCount(0);
    await expect(page.getByText("Conversas recentes")).toHaveCount(0);
  });

  test("Configurações mostra só áreas funcionais", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByRole("heading", { level: 1, name: "Configurações" })).toBeVisible();
    // Cada área funcional aparece na aba de admin e/ou no card do hub.
    for (const ok of ["Dados da empresa", "Equipe", "Papéis", "Permissões"]) {
      await expect(page.getByRole("link", { name: new RegExp(ok) }).first()).toBeVisible();
    }
    for (const hidden of ["Branding", "Domínios", "Marketplace", "API Keys", "Limites de uso"]) {
      await expect(page.getByText(hidden, { exact: false })).toHaveCount(0);
    }
    // Nenhum banner de preview na tela de Configurações.
    await expect(page.getByText(/Disponível em breve|Prévia/)).toHaveCount(0);
  });
});
