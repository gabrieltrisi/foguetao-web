import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LandingProof } from "../proof";
import { getLandingContent } from "@/config/landing/segments";

describe("LandingProof", () => {
  it("renderiza stats + depoimento + selo Demonstração do segmento", () => {
    const proof = getLandingContent("academia").proof;
    render(<LandingProof proof={proof} />);

    // selo de demonstração (nunca finge cliente real)
    expect(screen.getByText(/demonstração/i)).toBeInTheDocument();
    // stat do nicho
    expect(screen.getByText(proof.stats[0].value)).toBeInTheDocument();
    // depoimento + autor
    expect(screen.getByText(new RegExp(proof.testimonial.author, "i"))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(proof.testimonial.quote.slice(0, 24), "i"))).toBeInTheDocument();
  });

  it("difere por segmento (academia ≠ imobiliária)", () => {
    const a = getLandingContent("academia").proof.testimonial.quote;
    const b = getLandingContent("imobiliaria").proof.testimonial.quote;
    expect(a).not.toBe(b);
  });
});
