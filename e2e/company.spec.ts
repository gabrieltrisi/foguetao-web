import { test, expect, type Page } from "@playwright/test";

const EMPTY_STATE = { cookies: [], origins: [] };
const PASS = "Str0ng!Passw0rd";
const VIEWER = { email: "viewer@foguetao.dev", password: PASS };
const SEED_COMPANY = "Empresa Seed";

/**
 * Restaura os valores originais da empresa do seed.
 *
 * A empresa é COMPARTILHADA por todas as suítes: deixar a moeda em USD ou o
 * locale em en-US quebraria os testes de dinheiro dos deals. Cada teste que
 * escreve desfaz o que fez.
 */
async function restore(page: Page) {
  await page.request.patch("/api/company", {
    data: {
      name: SEED_COMPANY,
      timezone: "America/Sao_Paulo",
      locale: "pt-BR",
      currency: "BRL",
    },
  });
}

async function loginAs(page: Page, email: string, password = PASS) {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL("**/dashboard");
}

async function pickField(page: Page, label: string, option: string | RegExp) {
  await field(page, label).click();
  await page.getByRole("option", { name: option }).click();
}

/**
 * O gatilho de um Combobox dentro de um FormField. O nome acessível vem do
 * <label> associado (não do valor selecionado) — por isso lemos o valor com
 * `toContainText`, e não por `getByRole(name: valor)`.
 */
function field(page: Page, label: string) {
  return page.getByRole("button", { name: label, exact: true });
}

test.describe("Empresa — dados reais (owner)", () => {
  test.afterEach(async ({ page }) => {
    await restore(page);
  });

  test("carrega os dados reais da empresa", async ({ page }) => {
    await page.goto("/company/general");
    await expect(page.getByRole("heading", { level: 1, name: "Empresa" })).toBeVisible();
    await expect(page.getByText("Dados da empresa")).toBeVisible();

    await expect(page.getByRole("textbox", { name: "Nome", exact: true })).toHaveValue(SEED_COMPANY);
    // slug e data de criação são reais e imutáveis
    await expect(page.getByRole("textbox", { name: "Identificador" })).toHaveValue("empresa-seed");
    await expect(page.getByRole("textbox", { name: "Identificador" })).toBeDisabled();
    // status e plano reais, vindos do backend
    await expect(page.getByText("Ativa").first()).toBeVisible();
    await expect(page.getByText(/Plano Free/i)).toBeVisible();
  });

  test("o hub de Configurações mostra a empresa real", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByRole("heading", { level: 1, name: "Configurações" })).toBeVisible();
    // Escopado ao conteúdo: o seletor de empresas também exibe o nome.
    await expect(page.locator("main").getByText(SEED_COMPANY).first()).toBeVisible();
    await expect(page.locator("main").getByText("Ativa").first()).toBeVisible();
  });

  test("edita o nome e persiste após recarregar", async ({ page }) => {
    const novo = `Empresa E2E ${Date.now()}`;
    await page.goto("/company/general");

    const nome = page.getByRole("textbox", { name: "Nome", exact: true });
    await nome.fill(novo);
    await page.getByRole("button", { name: "Salvar alterações" }).click();
    await expect(page.getByText("Dados salvos")).toBeVisible();

    await page.reload();
    await expect(page.getByRole("textbox", { name: "Nome", exact: true })).toHaveValue(novo);
  });

  test("troca o fuso horário", async ({ page }) => {
    await page.goto("/company/general");
    await pickField(page, "Fuso horário", "Europe/Lisbon");
    await page.getByRole("button", { name: "Salvar alterações" }).click();
    await expect(page.getByText("Dados salvos")).toBeVisible();

    await page.reload();
    await expect(field(page, "Fuso horário")).toContainText("Europe/Lisbon");
  });

  test("troca o idioma", async ({ page }) => {
    await page.goto("/company/general");
    await pickField(page, "Idioma", "English (US)");
    await page.getByRole("button", { name: "Salvar alterações" }).click();
    await expect(page.getByText("Dados salvos")).toBeVisible();

    await page.reload();
    await expect(field(page, "Idioma")).toContainText("English (US)");
  });

  test("troca a moeda", async ({ page }) => {
    await page.goto("/company/general");
    await pickField(page, "Moeda", "Dólar (USD)");
    await page.getByRole("button", { name: "Salvar alterações" }).click();
    await expect(page.getByText("Dados salvos")).toBeVisible();

    await page.reload();
    await expect(field(page, "Moeda")).toContainText("Dólar (USD)");
  });

  test("edita contato e documento", async ({ page }) => {
    // Valores únicos por execução: o formulário só habilita "Salvar" quando há
    // mudança real, e o restore() não reverte estes campos.
    const stamp = Date.now();
    const razao = `Empresa Seed Ltda ${stamp}`;
    const email = `contato-${stamp}@empresaseed.dev`;

    await page.goto("/company/general");
    await page.getByRole("textbox", { name: "Razão social" }).fill(razao);
    await page.getByRole("textbox", { name: "E-mail" }).fill(email);
    await page.getByRole("button", { name: "Salvar alterações" }).click();
    await expect(page.getByText("Dados salvos")).toBeVisible();

    await page.reload();
    await expect(page.getByRole("textbox", { name: "Razão social" })).toHaveValue(razao);
    await expect(page.getByRole("textbox", { name: "E-mail" })).toHaveValue(email);
  });

  test("salvar só é oferecido quando há mudança", async ({ page }) => {
    await page.goto("/company/general");
    await expect(page.getByRole("button", { name: "Salvar alterações" })).toBeDisabled();

    await page.getByRole("textbox", { name: "Nome", exact: true }).fill("Alterado");
    await expect(page.getByRole("button", { name: "Salvar alterações" })).toBeEnabled();

    await page.getByRole("button", { name: "Cancelar" }).click();
    await expect(page.getByRole("textbox", { name: "Nome", exact: true })).toHaveValue(SEED_COMPANY);
    await expect(page.getByRole("button", { name: "Salvar alterações" })).toBeDisabled();
  });

  test("e-mail inválido é recusado com mensagem clara", async ({ page }) => {
    await page.goto("/company/general");
    await page.getByRole("textbox", { name: "E-mail" }).fill("nao-e-email");
    await page.getByRole("button", { name: "Salvar alterações" }).click();
    await expect(page.getByText(/verifique os campos/i)).toBeVisible();
  });
});

test.describe("Empresa — o que NÃO existe no backend", () => {
  test("plano mostra o plano real e não oferece upgrade", async ({ page }) => {
    await page.goto("/company/plans");
    await expect(page.getByText(/plano atual da empresa é real/i)).toBeVisible();
    await expect(page.getByText("Plano atual").first()).toBeVisible();
    // não há rota de upgrade: nenhum botão ativo promete o que não existe
    await expect(page.getByRole("button", { name: "Fazer upgrade" })).toHaveCount(0);
  });

  test("branding, domínios, billing e limites avisam que são prévia", async ({ page }) => {
    for (const [route, texto] of [
      ["/company/branding", /não existem no backend/i],
      ["/company/domains", /não existem no backend/i],
      ["/company/billing", /não existe no backend/i],
      ["/company/limits", /não existem no backend/i],
    ] as const) {
      await page.goto(route);
      await expect(page.getByText("Disponível em breve").first()).toBeVisible();
      await expect(page.getByText(texto).first()).toBeVisible();
    }
  });

  test("as telas de prévia não fazem nenhuma chamada inexistente", async ({ page }) => {
    const notFound: string[] = [];
    page.on("response", (r) => {
      if (r.url().includes("/api/") && [404, 500].includes(r.status())) notFound.push(r.url());
    });

    for (const route of ["/company/branding", "/company/domains", "/company/billing", "/company/limits"]) {
      await page.goto(route);
      await page.waitForLoadState("networkidle");
    }
    expect(notFound, `rotas inexistentes chamadas: ${notFound.join(", ")}`).toEqual([]);
  });
});

test.describe("Empresa — segurança e contrato", () => {
  test("o BFF recusa slug (imutável no backend)", async ({ page }) => {
    const res = await page.request.patch("/api/company", { data: { slug: "outro-slug" } });
    expect(res.status()).toBe(400);
    expect((await res.json()).code).toBe("VALIDATION_ERROR");
  });

  test("o BFF recusa plan e status (não editáveis)", async ({ page }) => {
    for (const data of [{ plan: "ENTERPRISE" }, { status: "ACTIVE" }]) {
      const res = await page.request.patch("/api/company", { data });
      expect(res.status()).toBe(400);
    }
  });

  test("o BFF recusa settings (o backend grava mas nunca devolve)", async ({ page }) => {
    const res = await page.request.patch("/api/company", { data: { settings: { x: 1 } } });
    expect(res.status()).toBe(400);
  });

  test("o BFF recusa corpo vazio e moeda inválida", async ({ page }) => {
    expect((await page.request.patch("/api/company", { data: {} })).status()).toBe(400);
    expect((await page.request.patch("/api/company", { data: { currency: "REAL" } })).status()).toBe(
      400,
    );
  });

  test("a resposta da empresa não expõe settings", async ({ page }) => {
    const res = await page.request.get("/api/company");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).not.toHaveProperty("settings");
    expect(body).toMatchObject({ slug: "empresa-seed", status: "ACTIVE" });
  });
});

test.describe("Empresa — VIEWER somente leitura", () => {
  test.use({ storageState: EMPTY_STATE });

  test("viewer lê os dados mas não pode editar", async ({ page }) => {
    await loginAs(page, VIEWER.email, VIEWER.password);
    await page.goto("/company/general");

    // VIEWER TEM company.read (confirmado na auditoria do RBAC)
    await expect(page.getByRole("textbox", { name: "Nome", exact: true })).toHaveValue(SEED_COMPANY);
    await expect(page.getByRole("textbox", { name: "Nome", exact: true })).toBeDisabled();

    await expect(page.getByRole("button", { name: "Salvar alterações" })).toHaveCount(0);
    await expect(page.getByText(/acesso de leitura/i)).toBeVisible();
  });

  test("o backend recusa o viewer editando (403)", async ({ page }) => {
    await loginAs(page, VIEWER.email, VIEWER.password);
    const res = await page.request.patch("/api/company", { data: { name: "Viewer tentou" } });
    expect(res.status()).toBe(403);
    expect((await res.json()).code).toBe("INSUFFICIENT_PERMISSION");
  });
});
