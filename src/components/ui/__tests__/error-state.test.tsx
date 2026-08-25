import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ErrorState } from "@/components/ui/error-state";

describe("ErrorState", () => {
  it("renderiza título e mensagem padrão", () => {
    render(<ErrorState />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Algo deu errado")).toBeInTheDocument();
  });

  it("chama onRetry ao clicar em Tentar novamente", async () => {
    const onRetry = vi.fn();
    const user = userEvent.setup();
    render(<ErrorState onRetry={onRetry} />);
    await user.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("não exibe botão quando onRetry não é fornecido", () => {
    render(<ErrorState variant="card" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
