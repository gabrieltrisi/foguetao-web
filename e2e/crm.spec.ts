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
  "/contacts",
  "/contacts/contact-1",
  "/contacts/new",
  "/organizations",
  "/organizations/org-1",
  "/organizations/new",
  "/pipeline",
  "/deals",
  "/deals/deal-1",
  "/deals/new",
  "/tasks",
  "/tasks/task-1",
];

const mobileRoutes = [
  "/contacts",
  "/contacts/contact-1",
  "/organizations",
  "/pipeline",
  "/deals/deal-1",
  "/tasks",
];

test.describe("CRM — desktop 1440", () => {
  for (const route of routes) {
    test(`${route} carrega sem overflow nem erros`, async ({ page }) => {
      const errors = trackErrors(page);
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(route);
      await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
      await page.waitForLoadState("networkidle");
      expect(await hasHorizontalOverflow(page), `overflow em ${route}`).toBe(false);
      expect(errors, `console em ${route}`).toEqual([]);
    });
  }
});

test.describe("CRM — mobile 390", () => {
  for (const route of mobileRoutes) {
    test(`${route} sem overflow @ 390`, async ({ page }) => {
      const errors = trackErrors(page);
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(route);
      await page.waitForLoadState("networkidle");
      expect(await hasHorizontalOverflow(page), `overflow em ${route}`).toBe(false);
      expect(errors, `console em ${route}`).toEqual([]);
    });
  }
});

test.describe("CRM — interações", () => {
  test("alterna visão de tarefas para Kanban e Calendário", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/tasks");
    await page.getByRole("tab", { name: "Kanban" }).click();
    await expect(page.getByRole("region", { name: "Em andamento" })).toBeVisible();
    await page.getByRole("tab", { name: "Calendário" }).click();
    await expect(page.getByText(/Julho de 2026/)).toBeVisible();
  });

  test("filtra contatos por status", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/contacts");
    await expect(page.getByRole("heading", { level: 1, name: "Contatos" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Novo contato" })).toBeVisible();
  });
});
