import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Users } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";

type Row = { id: string; name: string; value: number };

const rows: Row[] = Array.from({ length: 15 }).map((_, i) => ({
  id: `id-${i}`,
  name: `Item ${i}`,
  value: 15 - i, // Item 0 => 15 ... Item 14 => 1
}));

const columns: DataTableColumn<Row>[] = [
  { id: "name", header: "Nome", sortable: true, sortAccessor: (r) => r.name, cell: (r) => r.name },
  { id: "value", header: "Valor", sortable: true, sortAccessor: (r) => r.value, cell: (r) => r.value },
];

function renderTable(extra?: Partial<React.ComponentProps<typeof DataTable<Row>>>) {
  return render(
    <DataTable
      data={rows}
      columns={columns}
      getRowId={(r) => r.id}
      selectable
      searchAccessor={(r) => r.name}
      empty={{ icon: Users, title: "Nada aqui." }}
      {...extra}
    />,
  );
}

function bodyRows() {
  const all = screen.getAllByRole("row");
  return all.slice(1); // remove header
}

describe("DataTable", () => {
  it("pagina: mostra 10 de 15 e navega para a próxima página", async () => {
    const user = userEvent.setup();
    renderTable();
    expect(bodyRows()).toHaveLength(10);
    expect(screen.getByText(/15 resultado\(s\)/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Próxima página" }));
    expect(bodyRows()).toHaveLength(5);
  });

  it("ordena por Valor (ascendente) ao clicar no cabeçalho", async () => {
    const user = userEvent.setup();
    renderTable();
    await user.click(screen.getByRole("button", { name: "Ordenar por Valor" }));
    // menor valor (1) pertence a "Item 14"
    expect(bodyRows()[0]).toHaveTextContent("Item 14");
  });

  it("filtra pela busca", async () => {
    const user = userEvent.setup();
    renderTable();
    await user.type(screen.getByRole("searchbox"), "Item 14");
    const rowsNow = bodyRows();
    expect(rowsNow).toHaveLength(1);
    expect(rowsNow[0]).toHaveTextContent("Item 14");
  });

  it("seleciona a página e mostra a barra de ações em massa", async () => {
    const user = userEvent.setup();
    renderTable();
    await user.click(screen.getByRole("checkbox", { name: "Selecionar página" }));
    expect(screen.getByText("10 selecionado(s)")).toBeInTheDocument();
  });

  it("exibe estado vazio quando não há dados", () => {
    renderTable({ data: [] });
    expect(screen.getByText("Nada aqui.")).toBeInTheDocument();
  });
});
