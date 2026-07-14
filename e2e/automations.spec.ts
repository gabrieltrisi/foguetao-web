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
  "/automations",
  "/automations/new",
  "/automations/auto-1",
  "/automations/auto-1/executions",
  "/automation-templates",
  "/automation-executions",
  "/automation-executions/exec-1",
  "/automation-variables",
  "/scheduler",
  "/webhooks",
  "/automation-ai",
];

const mobileRoutes = ["/automations", "/automations/auto-1", "/automation-templates", "/automation-executions/exec-1", "/scheduler", "/webhooks", "/automation-ai"];

test.describe("Automações — desktop 1440", () => {
  for (const route of routes) {
    test(`${route} sem overflow nem erros`, async ({ page }) => {
      const errors = trackErrors(page);
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(route);
      await expect(page.locator("body")).toBeVisible();
      await page.waitForLoadState("networkidle");
      // Determinístico: aguarda o layout estabilizar (evita corrida de medição
      // durante a hidratação do canvas). Overflow real persistente ainda falha.
      await expect
        .poll(() => hasHorizontalOverflow(page), { message: `overflow em ${route}`, timeout: 5000 })
        .toBe(false);
      expect(errors, `console em ${route}`).toEqual([]);
    });
  }
});

test.describe("Automações — mobile 390", () => {
  for (const route of mobileRoutes) {
    test(`${route} sem overflow @ 390`, async ({ page }) => {
      const errors = trackErrors(page);
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(route);
      await page.waitForLoadState("networkidle");
      await expect
        .poll(() => hasHorizontalOverflow(page), { message: `overflow em ${route}`, timeout: 5000 })
        .toBe(false);
      expect(errors, `console em ${route}`).toEqual([]);
    });
  }
});

test.describe("Automações — interações", () => {
  test("alterna lista para cards", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/automations");
    await expect(page.getByRole("table")).toBeVisible();
    await page.getByRole("tab", { name: "Cards" }).click();
    await expect(page.getByRole("table")).toHaveCount(0);
  });

  test("abre o editor e alterna o status", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/automations");
    await page.getByRole("link", { name: "Boas-vindas — novo lead" }).first().click();
    await page.waitForURL("**/automations/auto-1");
    await expect(page.getByRole("heading", { level: 1, name: "Boas-vindas — novo lead" })).toBeVisible();
    await page.getByRole("switch").click();
    await expect(page.getByText(/Automação pausada|Automação ativada/)).toBeVisible();
  });

  test("usa um template", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/automation-templates");
    await page.getByRole("button", { name: "Usar template" }).first().click();
    await page.waitForURL("**/automations/new");
    await expect(page.getByRole("heading", { level: 1, name: "Nova automação" })).toBeVisible();
  });

  test("mostra a próxima execução no agendador", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/scheduler");
    await expect(page.getByText("Próxima execução").first()).toBeVisible();
  });

  test("copia a URL de um webhook", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/webhooks");
    await page.getByRole("button", { name: "Copiar URL" }).first().click();
    await expect(page.getByText("URL copiada")).toBeVisible();
  });

  test("exibe logs da execução", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/automation-executions/exec-1");
    await page.getByRole("tab", { name: "Logs" }).click();
    await expect(page.getByText(/Execução iniciada/)).toBeVisible();
  });
});
