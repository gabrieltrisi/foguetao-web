import { describe, expect, it } from "vitest";
import * as React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MultiSelect, type ComboboxOption } from "@/components/ui/combobox";

const options: ComboboxOption[] = [
  { value: "sp", label: "Matriz SP" },
  { value: "rj", label: "Filial RJ" },
  { value: "mg", label: "Filial MG" },
];

function Harness() {
  const [value, setValue] = React.useState<string[]>([]);
  return <MultiSelect options={options} value={value} onValueChange={setValue} />;
}

describe("MultiSelect", () => {
  it("abre e alterna a seleção exibindo um chip", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    // trigger é o único botão inicialmente
    await user.click(screen.getByRole("button"));

    // opções aparecem no popover
    const option = await screen.findByText("Filial RJ");
    await user.click(option);

    // chip aparece no gatilho
    const trigger = screen.getByRole("button", { expanded: true });
    expect(within(trigger).getByText("Filial RJ")).toBeInTheDocument();
  });
});
