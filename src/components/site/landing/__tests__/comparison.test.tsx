import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LandingComparison } from "../comparison";

describe("LandingComparison", () => {
  it("compara Planilha, WhatsApp, CRM e Foguetão (4 colunas)", () => {
    render(<LandingComparison />);
    expect(screen.getByText("Planilha")).toBeInTheDocument();
    expect(screen.getByText("WhatsApp")).toBeInTheDocument();
    expect(screen.getByText("CRM")).toBeInTheDocument();
    expect(screen.getByText("Foguetão")).toBeInTheDocument();
  });

  it("aceita uma intro personalizada por segmento (note)", () => {
    render(<LandingComparison note="Intro do nicho X." />);
    expect(screen.getByText("Intro do nicho X.")).toBeInTheDocument();
  });

  it("usa marcas com rótulo acessível (leitura rápida)", () => {
    render(<LandingComparison />);
    // marcas "Sim"/"Não"/"Parcial" existem como texto sr-only
    expect(screen.getAllByText("Sim").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Não").length).toBeGreaterThan(0);
  });
});
