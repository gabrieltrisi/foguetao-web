import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ToastProvider, useToast } from "@/components/ui/toast";

function Harness() {
  const { toast } = useToast();
  return (
    <div>
      <button onClick={() => toast({ title: "Salvo com sucesso", variant: "success" })}>
        sucesso
      </button>
      <button onClick={() => toast({ title: "Falha ao salvar", variant: "error" })}>erro</button>
      <button onClick={() => toast({ title: "Atenção", variant: "warning" })}>aviso</button>
    </div>
  );
}

describe("Toast", () => {
  it("exibe um toast de sucesso com role status", async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <Harness />
      </ToastProvider>,
    );
    await user.click(screen.getByRole("button", { name: "sucesso" }));
    const toast = await screen.findByText("Salvo com sucesso");
    expect(toast).toBeInTheDocument();
    expect(toast.closest('[role="status"]')).not.toBeNull();
  });

  it("usa role alert para variante de erro", async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <Harness />
      </ToastProvider>,
    );
    await user.click(screen.getByRole("button", { name: "erro" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Falha ao salvar");
  });

  it("permite fechar o toast manualmente", async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <Harness />
      </ToastProvider>,
    );
    await user.click(screen.getByRole("button", { name: "aviso" }));
    expect(await screen.findByText("Atenção")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Fechar notificação" }));
    expect(screen.queryByText("Atenção")).not.toBeInTheDocument();
  });
});
