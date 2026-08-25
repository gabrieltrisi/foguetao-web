import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DatePicker } from "@/components/ui/date-picker";

describe("DatePicker", () => {
  it("abre o calendário ao clicar no gatilho", async () => {
    const user = userEvent.setup();
    render(<DatePicker />);
    await user.click(screen.getByRole("button", { name: /Selecione uma data/ }));
    // react-day-picker renderiza uma grade de dias
    expect(await screen.findByRole("grid")).toBeInTheDocument();
  });
});
