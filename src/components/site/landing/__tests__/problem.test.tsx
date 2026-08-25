import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LandingProblem } from "../problem";
import { LandingFeatures } from "../features";
import { getLandingContent } from "@/config/landing/segments";

describe("LandingProblem (personalizado)", () => {
  it("renderiza as dores do segmento", () => {
    const problems = getLandingContent("imobiliaria").problems;
    render(<LandingProblem problems={problems} />);
    expect(screen.getByText(problems[0].title)).toBeInTheDocument();
    expect(screen.getByText(problems[1].title)).toBeInTheDocument();
  });

  it("as dores diferem entre segmentos", () => {
    const a = getLandingContent("academia").problems.map((p) => p.title).join("|");
    const b = getLandingContent("imobiliaria").problems.map((p) => p.title).join("|");
    expect(a).not.toBe(b);
  });
});

describe("LandingFeatures (recursos destacados)", () => {
  it("marca os recursos destacados do segmento como Recomendado", () => {
    render(<LandingFeatures highlight={["Pipeline"]} />);
    expect(screen.getAllByText(/recomendado/i).length).toBeGreaterThan(0);
  });

  it("sem destaque, não marca nenhum recurso", () => {
    render(<LandingFeatures highlight={[]} />);
    expect(screen.queryByText(/recomendado/i)).not.toBeInTheDocument();
  });
});
