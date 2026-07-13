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
  "/conversations",
  "/conversations/conv-1",
  "/whatsapp",
  "/inbox",
  "/templates",
  "/labels",
  "/queues",
  "/ai-assistant",
];

const mobileRoutes = ["/conversations", "/conversations/conv-1", "/whatsapp", "/inbox", "/templates", "/queues"];

test.describe("Comunicação — desktop 1440", () => {
  for (const route of routes) {
    test(`${route} sem overflow nem erros`, async ({ page }) => {
      const errors = trackErrors(page);
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(route);
      await expect(page.locator("body")).toBeVisible();
      await page.waitForLoadState("networkidle");
      expect(await hasHorizontalOverflow(page), `overflow em ${route}`).toBe(false);
      expect(errors, `console em ${route}`).toEqual([]);
    });
  }
});

test.describe("Comunicação — mobile 390", () => {
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

test.describe("Comunicação — interações", () => {
  test("envia uma mensagem no chat", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/conversations/conv-1");
    const box = page.getByLabel("Mensagem");
    await box.fill("Mensagem de teste automatizada");
    await page.getByRole("button", { name: "Enviar" }).click();
    await expect(page.getByText("Mensagem de teste automatizada")).toBeVisible();
  });

  test("abre o QR de conexão do WhatsApp", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/whatsapp");
    await page.getByRole("button", { name: "Conectar", exact: true }).first().click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("img", { name: /QR Code/ })).toBeVisible();
  });

  test("filtra templates por favoritos", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/templates");
    await expect(page.getByRole("heading", { level: 1, name: "Templates" })).toBeVisible();
    await page.getByRole("button", { name: "Favoritos", exact: true }).click();
    await expect(page.getByText("Boas-vindas")).toBeVisible();
  });
});
