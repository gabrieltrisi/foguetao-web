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

test.describe("/design-system", () => {
  for (const vp of [
    { name: "1440x900", width: 1440, height: 900 },
    { name: "390x844", width: 390, height: 844 },
  ]) {
    test(`carrega sem overflow nem erros @ ${vp.name}`, async ({ page }) => {
      const errors = trackErrors(page);
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/design-system");
      await expect(page.getByRole("heading", { name: "Design System", level: 1 })).toBeVisible();
      await page.waitForLoadState("networkidle");
      expect(await hasHorizontalOverflow(page)).toBe(false);
      expect(errors).toEqual([]);
    });
  }

  test("não aparece na sidebar principal", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/design-system");
    const sidebar = page.locator("aside").first();
    await expect(sidebar.getByRole("link", { name: "Design System" })).toHaveCount(0);
  });

  test("dispara toast e abre/fecha modal", async ({ page }) => {
    await page.goto("/design-system");
    await page.getByRole("button", { name: "Sucesso", exact: true }).click();
    await expect(page.getByText("Salvo com sucesso")).toBeVisible();

    await page.getByRole("button", { name: "Abrir modal" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("button", { name: "Cancelar" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });
});
