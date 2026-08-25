import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OptionCard } from "./OptionCard";
import type { QuizOption } from "../types";

const option: QuizOption = { id: "academia", label: "Academia", emoji: "🏋️" };

describe("OptionCard", () => {
  it("renderiza o rótulo e reflete o estado de seleção", () => {
    const { rerender } = render(<OptionCard option={option} selected={false} onSelect={() => {}} />);
    const btn = screen.getByRole("button", { name: /academia/i });
    expect(btn).toHaveAttribute("aria-pressed", "false");
    rerender(<OptionCard option={option} selected onSelect={() => {}} />);
    expect(screen.getByRole("button", { name: /academia/i })).toHaveAttribute("aria-pressed", "true");
  });

  it("chama onSelect com o id ao clicar", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<OptionCard option={option} selected={false} onSelect={onSelect} />);
    await user.click(screen.getByRole("button", { name: /academia/i }));
    expect(onSelect).toHaveBeenCalledWith("academia");
  });
});
