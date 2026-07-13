import { test, expect, type Page } from "@playwright/test";

const viewports = [
  { name: "1440x900", width: 1440, height: 900 },
  { name: "1280x800", width: 1280, height: 800 },
  { name: "768x1024", width: 768, height: 1024 },
  { name: "390x844", width: 390, height: 844 },
];

const routes = ["/", "/login", "/dashboard", "/contacts", "/pipeline"];

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

test.describe("Carregamento, responsividade e console", () => {
  for (const vp of viewports) {
    for (const route of routes) {
      test(`${route} @ ${vp.name} — sem overflow horizontal e sem erros de console`, async ({
        page,
      }) => {
        const errors = trackErrors(page);
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(route);
        await expect(page.locator("body")).toBeVisible();
        // Aguarda pintura estável.
        await page.waitForLoadState("networkidle");

        expect(await hasHorizontalOverflow(page), "não deve haver overflow horizontal").toBe(false);
        expect(errors, `erros de console em ${route} @ ${vp.name}`).toEqual([]);
      });
    }
  }
});

test.describe("Telas principais", () => {
  test("landing exibe hero e CTA", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /Escale sem limites/ })).toBeVisible();
    await expect(page.getByRole("link", { name: "Começar agora" }).first()).toBeVisible();
  });

  test("login exibe o formulário", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Bem-vindo de volta" })).toBeVisible();
    await expect(page.getByLabel("E-mail")).toBeVisible();
  });

  test("dashboard exibe título e métricas", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: "Visão geral", level: 1 })).toBeVisible();
    await expect(page.getByText("12.482")).toBeVisible();
    await expect(page.getByText("Funil de vendas")).toBeVisible();
  });
});

test.describe("Sidebar", () => {
  test("recolhe e expande no desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/dashboard");

    const sidebar = page.locator("aside").first();
    await expect(sidebar.getByRole("link", { name: "Contatos" })).toBeVisible();

    await page.getByRole("button", { name: "Recolher menu", exact: true }).click();
    await expect(page.getByRole("button", { name: "Expandir menu", exact: true })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: "Contatos" })).toHaveCount(0);

    await page.getByRole("button", { name: "Expandir menu", exact: true }).click();
    await expect(sidebar.getByRole("link", { name: "Contatos" })).toBeVisible();
  });
});

test.describe("Drawer mobile", () => {
  test("abre e fecha no viewport 390x844", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/dashboard");

    // A sidebar desktop fica oculta; o menu abre o drawer.
    await page.getByRole("button", { name: "Abrir menu" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("link", { name: "Contatos" })).toBeVisible();

    await page.getByRole("button", { name: "Fechar menu" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });
});

test.describe("Fluxo de login mockado", () => {
  test("credenciais válidas redirecionam para o dashboard", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("E-mail").fill("camila@foguetao.com.br");
    await page.getByLabel("Senha", { exact: true }).fill("foguetao123");
    await page.getByRole("button", { name: "Entrar" }).click();

    await page.waitForURL("**/dashboard");
    await expect(page.getByRole("heading", { name: "Visão geral", level: 1 })).toBeVisible();
  });
});
