import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LandingComparison } from "../comparison";

describe("LandingComparison", () => {
  it("compara Planilha, WhatsApp e Foguetão", () => {
    render(<LandingComparison />);
    expect(screen.getByText("Planilha")).toBeInTheDocument();
    expect(screen.getByText("WhatsApp")).toBeInTheDocument();
    expect(screen.getByText("Foguetão")).toBeInTheDocument();
  });

  it("usa marcas com rótulo acessível (leitura rápida)", () => {
    render(<LandingComparison />);
    // marcas "Sim"/"Não"/"Parcial" existem como texto sr-only
    expect(screen.getAllByText("Sim").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Não").length).toBeGreaterThan(0);
  });
});
