import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Pagination, CursorPagination } from "@/components/ui/pagination";
import { ActiveFilters } from "@/components/ui/filter-bar";

describe("Pagination", () => {
  it("navega para a próxima página e para uma página específica", async () => {
    const onPageChange = vi.fn();
    const user = userEvent.setup();
    render(<Pagination page={2} totalPages={5} onPageChange={onPageChange} />);

    await user.click(screen.getByRole("button", { name: "Próxima página" }));
    expect(onPageChange).toHaveBeenCalledWith(3);

    await user.click(screen.getByRole("button", { name: "4" }));
    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  it("desabilita anterior na primeira página", () => {
    render(<Pagination page={1} totalPages={5} />);
    expect(screen.getByRole("button", { name: "Página anterior" })).toBeDisabled();
  });
});

describe("CursorPagination", () => {
  it("respeita hasPrev/hasNext e dispara callbacks", async () => {
    const onNext = vi.fn();
    const user = userEvent.setup();
    render(<CursorPagination hasPrev={false} hasNext onNext={onNext} />);
    expect(screen.getByRole("button", { name: "Anterior" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Próxima" }));
    expect(onNext).toHaveBeenCalled();
  });
});

describe("ActiveFilters", () => {
  const filters = [
    { id: "status", label: "Status", value: "Ativo" },
    { id: "owner", label: "Responsável", value: "Camila" },
  ];

  it("remove um filtro e limpa todos", async () => {
    const onRemove = vi.fn();
    const onClear = vi.fn();
    const user = userEvent.setup();
    render(<ActiveFilters filters={filters} onRemove={onRemove} onClear={onClear} />);

    await user.click(screen.getByRole("button", { name: "Remover filtro Status" }));
    expect(onRemove).toHaveBeenCalledWith("status");

    await user.click(screen.getByRole("button", { name: "Limpar tudo" }));
    expect(onClear).toHaveBeenCalled();
  });
});
