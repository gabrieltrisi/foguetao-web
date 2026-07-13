import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "@/components/auth/login-form";
import { ToastProvider } from "@/components/ui/toast";
import { mockCredentials } from "@/mocks/account";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

function renderForm() {
  return render(
    <ToastProvider>
      <LoginForm />
    </ToastProvider>,
  );
}

describe("LoginForm", () => {
  beforeEach(() => push.mockClear());

  it("exibe erros de validação quando os campos estão vazios", async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByText("Informe seu e-mail.")).toBeInTheDocument();
    expect(screen.getByText("Informe sua senha.")).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it("valida o formato do e-mail", async () => {
    const user = userEvent.setup();
    renderForm();
    await user.type(screen.getByLabelText("E-mail"), "not-an-email");
    await user.type(screen.getByLabelText("Senha"), "123456");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByText("Digite um e-mail válido.")).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it("mostra erro de credenciais inválidas (mock)", async () => {
    const user = userEvent.setup();
    renderForm();
    await user.type(screen.getByLabelText("E-mail"), "errado@foguetao.com.br");
    await user.type(screen.getByLabelText("Senha"), "senhaerrada");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/E-mail ou senha incorretos/);
    expect(push).not.toHaveBeenCalled();
  });

  it("redireciona para /dashboard com credenciais válidas mockadas", async () => {
    const user = userEvent.setup();
    renderForm();
    await user.type(screen.getByLabelText("E-mail"), mockCredentials.email);
    await user.type(screen.getByLabelText("Senha"), mockCredentials.password);
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/dashboard"), { timeout: 3000 });
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
