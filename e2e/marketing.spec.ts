import { test, expect, type Page } from "@playwright/test";

/**
 * Sprint 1.4: a auditoria provou que NÃO existe backend de Marketing — nenhum
 * model no Prisma, nenhum controller, nenhum endpoint. As permissões
 * (campaigns.*, ads.*, affiliates.*) existem no catálogo RBAC, mas são órfãs.
 * Por isso todas as telas do módulo seguem como PREVIEW, claramente
 * identificadas e sem simular persistência. A UI foi preservada.
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
  "/campaigns",
  "/campaigns/camp-1",
  "/campaigns/new",
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

const mobileRoutes = ["/campaigns", "/campaigns/camp-1", "/meta-ads", "/landing-pages", "/utm-builder", "/affiliates", "/performance"];

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
  test("alterna campanhas para visão de cards", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/campaigns");
    await expect(page.getByRole("table")).toBeVisible();
    await page.getByRole("tab", { name: "Cards" }).click();
    await expect(page.getByRole("table")).toHaveCount(0);
  });

  test("navega para o detalhe de uma campanha", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/campaigns");
    await page.getByRole("link", { name: "Black Week — Conversão" }).first().click();
    await page.waitForURL("**/campaigns/**");
    await expect(page.getByRole("heading", { level: 1, name: "Black Week — Conversão" })).toBeVisible();
  });

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
  /** Toda tela de Marketing avisa que é Preview e que nada é salvo. */
  const previewRoutes = [
    "/campaigns",
    "/campaigns/camp-1",
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

  test("nenhuma tela de Marketing chama o BFF (não há contrato)", async ({ page }) => {
    const calls: string[] = [];
    page.on("request", (r) => {
      const u = r.url();
      // ignora as chamadas de sessão/empresa que o shell da app faz
      if (u.includes("/api/") && !u.includes("/api/session") && !u.includes("/api/company")) {
        calls.push(u);
      }
    });
    await page.goto("/campaigns");
    await page.waitForLoadState("networkidle");
    await page.goto("/affiliates");
    await page.waitForLoadState("networkidle");
    expect(calls, `Marketing não deveria chamar backend: ${calls.join(", ")}`).toEqual([]);
  });
});
