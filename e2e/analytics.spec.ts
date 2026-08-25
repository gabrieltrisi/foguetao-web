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
  "/reports",
  "/reports/new",
  "/reports/report-1",
  "/analytics",
  "/funnels",
  "/attribution",
  "/cohorts",
  "/forecast",
  "/audit",
  "/activity-log",
  "/export-center",
];

const mobileRoutes = ["/reports", "/reports/report-1", "/analytics", "/funnels", "/attribution", "/cohorts", "/audit", "/export-center"];

test.describe("Analytics — desktop 1440", () => {
  for (const route of routes) {
    test(`${route} sem overflow nem erros`, async ({ page }) => {
      const errors = trackErrors(page);
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(route);
      if (route === "/reports/new") {
        await expect(page.getByLabel("Nome do relatório")).toBeVisible();
      } else {
        await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
      }
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(150);
      expect(await hasHorizontalOverflow(page), `overflow em ${route}`).toBe(false);
      expect(errors, `console em ${route}`).toEqual([]);
    });
  }
});

test.describe("Analytics — mobile 390", () => {
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

test.describe("Analytics — interações", () => {
  test("alterna relatórios para tabela", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/reports");
    await expect(page.getByRole("table")).toHaveCount(0);
    await page.getByRole("tab", { name: "Tabela" }).click();
    await expect(page.getByRole("table")).toBeVisible();
  });

  test("troca o período no analytics", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/analytics");
    const tab = page.getByRole("tab", { name: "7 dias" });
    await tab.click();
    await expect(tab).toHaveAttribute("aria-selected", "true");
  });

  test("troca o tipo de gráfico no builder", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/reports/new");
    const bar = page.getByRole("tab", { name: "Barra" });
    await bar.click();
    await expect(bar).toHaveAttribute("aria-selected", "true");
  });

  test("troca o modelo de atribuição", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/attribution");
    const linear = page.getByRole("tab", { name: "Linear" });
    await linear.click();
    await expect(linear).toHaveAttribute("aria-selected", "true");
  });

  test("troca de funil", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/funnels");
    await expect(page.getByText("Visitantes")).toBeVisible();
    await page.getByRole("tab", { name: "Funil de vendas" }).click();
    await expect(page.getByText("Novo lead")).toBeVisible();
  });

  test("exibe a tabela de cohort", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/cohorts");
    await expect(page.getByText("Jan/26")).toBeVisible();
  });

  test("abre o detalhe de auditoria", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/audit");
    await page.getByRole("button", { name: "Ver" }).first().click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText("Metadata")).toBeVisible();
  });

  test("baixa uma exportação", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/export-center");
    await page.getByRole("button", { name: "Baixar" }).first().click();
    await expect(page.getByText(/Baixando/)).toBeVisible();
  });
});
