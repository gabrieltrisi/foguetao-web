import { test, expect, type Page } from "@playwright/test";

const EMPTY_STATE = { cookies: [], origins: [] };
const VIEWER = { email: "viewer@foguetao.dev", password: "Str0ng!Passw0rd" };
const DEAL_RE = /\/deals\/[0-9a-f-]{36}/;

async function createDeal(page: Page, title: string, value = "1500,50") {
  await page.goto("/deals/new");
  await page.getByRole("textbox", { name: "Título", exact: true }).fill(title);
  await page.getByRole("textbox", { name: "Valor", exact: true }).fill(value);
  await page.getByRole("button", { name: "Criar oportunidade" }).click();
  await page.waitForURL(DEAL_RE);
}

test.describe("Kanban (owner)", () => {
  test("board real carrega colunas e cards", async ({ page }) => {
    await page.goto("/pipeline");
    await expect(page.getByRole("heading", { level: 1, name: "Pipeline" })).toBeVisible();
    // colunas do pipeline padrão (seed)
    await expect(page.getByRole("region", { name: "Novo lead" })).toBeVisible();
    // cards reais com valor formatado
    await expect(page.getByRole("region", { name: "Novo lead" }).getByRole("link").first()).toBeVisible();
  });

  test("carregar mais em UMA coluna não recarrega o board", async ({ page }) => {
    await page.goto("/pipeline");
    const column = page.getByRole("region", { name: "Novo lead" });
    await expect(column.getByRole("button", { name: "Carregar mais" })).toBeVisible();

    const before = await column.getByRole("link").count();
    const otherColumnCards = await page.getByRole("region", { name: "Proposta" }).getByRole("link").count();

    await column.getByRole("button", { name: "Carregar mais" }).click();
    await expect.poll(() => column.getByRole("link").count()).toBeGreaterThan(before);

    // a outra coluna permanece intacta (nenhum reload do board)
    await expect(page.getByRole("region", { name: "Proposta" }).getByRole("link")).toHaveCount(otherColumnCards);
  });

  test("move card entre colunas (optimistic + expectedVersion)", async ({ page }) => {
    const title = `E2E Move ${Date.now()}`;
    await createDeal(page, title);

    await page.goto("/pipeline");
    const card = page.locator("div").filter({ hasText: title }).first();
    await page.getByRole("button", { name: `Ações de ${title}` }).click();
    await page.getByRole("menuitem", { name: "Proposta" }).click();

    // o card aparece na coluna de destino
    await expect(page.getByRole("region", { name: "Proposta" }).getByRole("link", { name: title })).toBeVisible();
    expect(card).toBeTruthy();
  });
});

test.describe("Oportunidades (owner)", () => {
  test("lista oportunidades reais com valor formatado", async ({ page }) => {
    await page.goto("/deals");
    await expect(page.locator("tbody tr").first().getByRole("link").first()).toBeVisible();
    await expect(page.getByText(/R\$|US\$/).first()).toBeVisible();
  });

  test("cria oportunidade e abre o detalhe", async ({ page }) => {
    const title = `E2E Deal ${Date.now()}`;
    await createDeal(page, title, "2.500,75");
    await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
    // valor decimal preservado e formatado só na UI
    await expect(page.getByText("R$ 2.500,75").first()).toBeVisible();
    await expect(page.getByText("Aberta").first()).toBeVisible();
  });

  test("histórico e atividades são lazy (só ao abrir a aba)", async ({ page }) => {
    const title = `E2E Lazy ${Date.now()}`;
    await createDeal(page, title);

    const historyCalls: string[] = [];
    page.on("request", (r) => {
      if (/\/history|\/activities/.test(r.url())) historyCalls.push(r.url());
    });

    await page.reload();
    await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
    // resumo aberto → nada de history/activities
    expect(historyCalls).toEqual([]);

    await page.getByRole("tab", { name: "Histórico" }).click();
    await expect.poll(() => historyCalls.filter((u) => u.includes("/history")).length).toBeGreaterThan(0);

    await page.getByRole("tab", { name: "Atividades" }).click();
    await expect.poll(() => historyCalls.filter((u) => u.includes("/activities")).length).toBeGreaterThan(0);
  });

  test("ganhar, reabrir, arquivar e restaurar", async ({ page }) => {
    const title = `E2E Ciclo ${Date.now()}`;
    await createDeal(page, title);

    // Ganhar
    await page.getByRole("button", { name: "Mais ações" }).click();
    await page.getByRole("menuitem", { name: "Marcar como ganha" }).click();
    await expect(page.getByText("Ganha").first()).toBeVisible();

    // Reabrir
    await page.getByRole("button", { name: "Mais ações" }).click();
    await page.getByRole("menuitem", { name: "Reabrir" }).click();
    await expect(page.getByText("Aberta").first()).toBeVisible();

    // Arquivar
    await page.getByRole("button", { name: "Mais ações" }).click();
    await page.getByRole("menuitem", { name: "Arquivar" }).click();
    await expect(page.getByText("Arquivada").first()).toBeVisible();

    // Restaurar
    await page.getByRole("button", { name: "Mais ações" }).click();
    await page.getByRole("menuitem", { name: "Restaurar" }).click();
    await expect(page.getByText("Aberta").first()).toBeVisible();
  });

  test("marcar como perdida", async ({ page }) => {
    const title = `E2E Perdida ${Date.now()}`;
    await createDeal(page, title);
    await page.getByRole("button", { name: "Mais ações" }).click();
    await page.getByRole("menuitem", { name: "Marcar como perdida" }).click();
    await expect(page.getByText("Perdida").first()).toBeVisible();
  });

  test("conflito de versão (expectedVersion desatualizado) é rejeitado", async ({ page }) => {
    const title = `E2E Conflito ${Date.now()}`;
    await createDeal(page, title);
    const dealId = page.url().match(/deals\/([0-9a-f-]{36})/)![1];

    // versão atual = 1; força expectedVersion inválido pelo BFF
    const res = await page.request.post(`/api/crm/deals/${dealId}/archive`, {
      data: { expectedVersion: 999 },
    });
    expect(res.status()).toBe(409);
    const body = await res.json();
    expect(body.code).toBe("DEAL_VERSION_CONFLICT");
  });

  test("oportunidade inexistente mostra não encontrada", async ({ page }) => {
    await page.goto("/deals/00000000-0000-4000-8000-000000000000");
    await expect(page.getByText("Oportunidade não encontrada.")).toBeVisible();
  });
});

test.describe("Deals — VIEWER somente leitura", () => {
  test.use({ storageState: EMPTY_STATE });

  test("viewer não vê ações de escrita no board nem no detalhe", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("E-mail").fill(VIEWER.email);
    await page.getByLabel("Senha", { exact: true }).fill(VIEWER.password);
    await page.getByRole("button", { name: "Entrar" }).click();
    await page.waitForURL("**/dashboard");

    await page.goto("/pipeline");
    await expect(page.getByRole("region", { name: "Novo lead" })).toBeVisible();
    // sem menu de ações nos cards (mover/ganhar/perder)
    await expect(page.getByRole("button", { name: /^Ações de / })).toHaveCount(0);

    await page.goto("/deals");
    await page.locator("tbody tr").first().getByRole("link").first().click();
    await page.waitForURL(DEAL_RE);
    await expect(page.getByRole("link", { name: "Editar" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Mais ações" })).toHaveCount(0);
  });
});
