import { test, expect, type Page } from "@playwright/test";

/**
 * Marketing — telas SEM contrato de backend.
 *
 * A Sprint 1.4 provou que não existia domínio de Marketing. A Sprint 1.5A-1
 * criou APENAS o core de campanhas; por isso /campaigns, /campaigns/new e
 * /campaigns/[id] saíram do Preview e são cobertas por `campaigns.spec.ts`.
 * TODAS as demais telas continuam Preview, sem simular persistência.
 */

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
  "/meta-ads",
  "/google-ads",
  "/tiktok-ads",
  "/landing-pages",
  "/landing-pages/lp-1",
  "/tracking",
  "/utm-builder",
  "/lead-sources",
  "/forms",
  "/affiliates",
  "/affiliates/aff-1",
  "/commissions",
  "/performance",
];

const mobileRoutes = ["/meta-ads", "/landing-pages", "/utm-builder", "/affiliates", "/performance"];

test.describe("Marketing — desktop 1440", () => {
  for (const route of routes) {
    test(`${route} sem overflow nem erros`, async ({ page }) => {
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

test.describe("Marketing — mobile 390", () => {
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

test.describe("Marketing — interações", () => {
  test("copia link no UTM Builder", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/utm-builder");
    await page.getByRole("button", { name: "Copiar link" }).click();
    await expect(page.getByText("Link copiado")).toBeVisible();
  });

  test("exibe ranking de afiliados", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/affiliates");
    await expect(page.getByRole("heading", { level: 1, name: "Afiliados" })).toBeVisible();
    await expect(page.getByText("Ranking")).toBeVisible();
  });
});

test.describe("Marketing — Preview (sem backend)", () => {
  /** As telas que continuam sem contrato avisam que são Preview. */
  const previewRoutes = [
    "/performance",
    "/meta-ads",
    "/google-ads",
    "/tiktok-ads",
    "/landing-pages",
    "/landing-pages/lp-1",
    "/tracking",
    "/utm-builder",
    "/lead-sources",
    "/forms",
    "/affiliates",
    "/affiliates/aff-1",
    "/commissions",
  ];

  for (const route of previewRoutes) {
    test(`${route} está marcada como Preview e não persiste`, async ({ page }) => {
      await page.goto(route);
      await expect(page.getByText("Preview — disponível em breve.").first()).toBeVisible();
      await expect(page.getByText(/nada é salvo/i).first()).toBeVisible();
    });
  }

  test("as telas ainda em Preview não chamam o BFF (não há contrato)", async ({ page }) => {
    const calls: string[] = [];
    page.on("request", (r) => {
      const u = r.url();
      // ignora as chamadas de sessão/empresa que o shell da app faz
      if (u.includes("/api/") && !u.includes("/api/session") && !u.includes("/api/company")) {
        calls.push(u);
      }
    });
    await page.goto("/performance");
    await page.waitForLoadState("networkidle");
    await page.goto("/affiliates");
    await page.waitForLoadState("networkidle");
    expect(calls, `estas telas não deveriam chamar backend: ${calls.join(", ")}`).toEqual([]);
  });
});
