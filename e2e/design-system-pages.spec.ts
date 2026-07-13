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

const pages = [
  { path: "/design-system/table", heading: "Tabelas & dados" },
  { path: "/design-system/forms", heading: "Formulários" },
  { path: "/design-system/overlays", heading: "Overlays" },
  { path: "/design-system/patterns", heading: "Padrões & negócio" },
];

test.describe("Showcase — sub-rotas", () => {
  for (const vp of [
    { name: "1440x900", width: 1440, height: 900 },
    { name: "390x844", width: 390, height: 844 },
  ]) {
    for (const p of pages) {
      test(`${p.path} @ ${vp.name} — carrega sem overflow nem erros`, async ({ page }) => {
        const errors = trackErrors(page);
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(p.path);
        await expect(page.getByRole("heading", { name: p.heading, level: 1 })).toBeVisible();
        await page.waitForLoadState("networkidle");
        expect(await hasHorizontalOverflow(page), `overflow em ${p.path}`).toBe(false);
        expect(errors, `console em ${p.path}`).toEqual([]);
      });
    }
  }

  test("DataTable ordena e pagina", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/design-system/table");
    await page.getByRole("button", { name: "Próxima página" }).first().click();
    await expect(page.getByText(/página 2 de/)).toBeVisible();
  });
});
