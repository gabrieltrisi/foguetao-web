import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Target, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/alert-dialog";
import { CommandMenu } from "@/components/ui/command-menu";

describe("ConfirmDialog", () => {
  it("abre e confirma a ação", async () => {
    const onConfirm = vi.fn();
    const user = userEvent.setup();
    render(
      <ConfirmDialog
        trigger={<Button>Abrir</Button>}
        title="Excluir item?"
        description="Ação irreversível."
        confirmLabel="Excluir"
        destructive
        onConfirm={onConfirm}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Abrir" }));
    expect(await screen.findByRole("alertdialog")).toBeInTheDocument();
    expect(screen.getByText("Excluir item?")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Excluir" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});

describe("CommandMenu", () => {
  it("filtra e seleciona um comando", async () => {
    const onSelect = vi.fn();
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(
      <CommandMenu
        open
        onOpenChange={onOpenChange}
        groups={[
          {
            heading: "Criar",
            items: [
              { label: "Novo contato", icon: Users, onSelect },
              { label: "Nova oportunidade", icon: Target },
            ],
          },
        ]}
      />,
    );

    const input = await screen.findByPlaceholderText(/Digite um comando/);
    await user.type(input, "contato");
    await user.click(screen.getByText("Novo contato"));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
