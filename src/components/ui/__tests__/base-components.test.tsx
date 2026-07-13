import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MetricCard } from "@/components/ui/metric-card";
import { TrendIndicator } from "@/components/ui/trend-indicator";
import { EmptyState } from "@/components/ui/empty-state";
import { Inbox } from "lucide-react";
import type { Metric } from "@/types";

describe("Button", () => {
  it("renderiza o texto e aplica a variante primária por padrão", () => {
    render(<Button>Salvar</Button>);
    const button = screen.getByRole("button", { name: "Salvar" });
    expect(button).toBeInTheDocument();
    expect(button.className).toContain("bg-brand");
  });

  it("fica desabilitado e com aria-busy quando loading", () => {
    render(<Button loading>Enviar</Button>);
    const button = screen.getByRole("button", { name: "Enviar" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });

  it("aplica a variante danger", () => {
    render(<Button variant="danger">Excluir</Button>);
    expect(screen.getByRole("button", { name: "Excluir" }).className).toContain("bg-danger");
  });
});

describe("Badge", () => {
  it("renderiza o conteúdo com o tom informado", () => {
    render(<Badge tone="success">Ganho</Badge>);
    expect(screen.getByText("Ganho").className).toContain("text-success");
  });
});

describe("TrendIndicator", () => {
  it("formata delta numérico positivo em pt-BR e usa cor de sucesso", () => {
    render(<TrendIndicator value={8.2} trend="up" />);
    expect(screen.getByText("+8,2%")).toBeInTheDocument();
  });
});

describe("MetricCard", () => {
  const metric: Metric = {
    id: "contatos",
    label: "Contatos",
    value: "12.482",
    deltaPercent: 8.2,
    trend: "up",
    hint: "Total de contatos.",
  };

  it("renderiza label, valor e delta", () => {
    render(<MetricCard metric={metric} />);
    expect(screen.getByText("Contatos")).toBeInTheDocument();
    expect(screen.getByText("12.482")).toBeInTheDocument();
    expect(screen.getByText("+8,2%")).toBeInTheDocument();
    expect(screen.getByText("vs. período anterior")).toBeInTheDocument();
  });
});

describe("EmptyState", () => {
  it("renderiza título, descrição e ação", () => {
    render(
      <EmptyState
        icon={Inbox}
        title="Nenhum contato encontrado."
        description="Adicione contatos."
        action={<Button>Novo contato</Button>}
      />,
    );
    expect(screen.getByText("Nenhum contato encontrado.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Novo contato" })).toBeInTheDocument();
  });
});
