import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LoginForm } from "@/components/auth/login-form";
import { ToastProvider } from "@/components/ui/toast";

const { replace, nextRef } = vi.hoisted(() => ({
  replace: vi.fn(),
  nextRef: { current: null as string | null },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push: replace }),
  useSearchParams: () => ({ get: (key: string) => (key === "next" ? nextRef.current : null) }),
}));

function renderForm() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <ToastProvider>
        <LoginForm />
      </ToastProvider>
    </QueryClientProvider>,
  );
}

/** Mocka o fetch do BFF (/api/auth/login). */
function mockLoginFetch(ok: boolean) {
  return vi.fn(async () =>
    ok
      ? new Response(JSON.stringify({ user: { id: "u1", name: "Owner", email: "owner@foguetao.dev" } }), {
          status: 200,
          headers: { "content-type": "application/json" },
        })
      : new Response(
          JSON.stringify({ statusCode: 401, code: "UNAUTHORIZED", message: "Credenciais inválidas" }),
          { status: 401, headers: { "content-type": "application/json" } },
        ),
  );
}

describe("LoginForm", () => {
  beforeEach(() => {
    replace.mockClear();
    nextRef.current = null;
  });
  afterEach(() => vi.unstubAllGlobals());

  it("exibe erros de validação quando os campos estão vazios", async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole("button", { name: /Entrar/i }));

    expect(await screen.findByText("Informe seu e-mail.")).toBeInTheDocument();
    expect(screen.getByText("Informe sua senha.")).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it("valida o formato do e-mail", async () => {
    const user = userEvent.setup();
    renderForm();
    await user.type(screen.getByLabelText("E-mail"), "not-an-email");
    await user.type(screen.getByLabelText("Senha"), "123456");
    await user.click(screen.getByRole("button", { name: /Entrar/i }));

    expect(await screen.findByText("Digite um e-mail válido.")).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it("mostra erro de credenciais inválidas (backend 401)", async () => {
    vi.stubGlobal("fetch", mockLoginFetch(false));
    const user = userEvent.setup();
    renderForm();
    await user.type(screen.getByLabelText("E-mail"), "errado@foguetao.dev");
    await user.type(screen.getByLabelText("Senha"), "senhaerrada");
    await user.click(screen.getByRole("button", { name: /Entrar/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/E-mail ou senha incorretos/);
    expect(replace).not.toHaveBeenCalled();
  });

  it("redireciona para /dashboard com credenciais válidas", async () => {
    vi.stubGlobal("fetch", mockLoginFetch(true));
    const user = userEvent.setup();
    renderForm();
    await user.type(screen.getByLabelText("E-mail"), "owner@foguetao.dev");
    await user.type(screen.getByLabelText("Senha"), "Str0ng!Passw0rd");
    await user.click(screen.getByRole("button", { name: /Entrar/i }));

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/dashboard"), { timeout: 3000 });
  });

  it("honra um next interno seguro", async () => {
    nextRef.current = "/deals/new";
    vi.stubGlobal("fetch", mockLoginFetch(true));
    const user = userEvent.setup();
    renderForm();
    await user.type(screen.getByLabelText("E-mail"), "owner@foguetao.dev");
    await user.type(screen.getByLabelText("Senha"), "Str0ng!Passw0rd");
    await user.click(screen.getByRole("button", { name: /Entrar/i }));

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/deals/new"), { timeout: 3000 });
  });

  it("bloqueia next protocol-relative (open redirect) e cai no /dashboard", async () => {
    nextRef.current = "//evil.com";
    vi.stubGlobal("fetch", mockLoginFetch(true));
    const user = userEvent.setup();
    renderForm();
    await user.type(screen.getByLabelText("E-mail"), "owner@foguetao.dev");
    await user.type(screen.getByLabelText("Senha"), "Str0ng!Passw0rd");
    await user.click(screen.getByRole("button", { name: /Entrar/i }));

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/dashboard"), { timeout: 3000 });
    expect(replace).not.toHaveBeenCalledWith("//evil.com");
  });

  it("permite alternar a visibilidade da senha", async () => {
    const user = userEvent.setup();
    renderForm();
    const password = screen.getByLabelText("Senha") as HTMLInputElement;
    expect(password.type).toBe("password");
    await user.click(screen.getByRole("button", { name: "Mostrar senha" }));
    expect(password.type).toBe("text");
  });
});
