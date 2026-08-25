import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { LandingProof } from "../proof";
import { QuizProvider } from "@/features/landing/quiz";
import { getLandingContent } from "@/config/landing/segments";

vi.mock("@/features/landing/quiz/analytics/track", () => ({ track: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn(), push: vi.fn() }) }));

function renderProof(id: Parameters<typeof getLandingContent>[0]) {
  const content = getLandingContent(id);
  return render(
    <QuizProvider active={id}>
      <LandingProof proof={content.proof} />
    </QuizProvider>,
  );
}

describe("LandingProof", () => {
  it("renderiza stats + mini-case + depoimento + logos + CTA + selo Demonstração", () => {
    const proof = getLandingContent("academia").proof;
    renderProof("academia");

    expect(screen.getByText(/demonstração/i)).toBeInTheDocument();
    expect(screen.getByText(proof.stats[0].value)).toBeInTheDocument();
    // mini-case antes/depois
    expect(screen.getByText("Antes")).toBeInTheDocument();
    expect(screen.getByText("Depois")).toBeInTheDocument();
    // depoimento
    expect(screen.getByText(new RegExp(proof.testimonial.author, "i"))).toBeInTheDocument();
    // CTA da prova (abre o quiz)
    expect(screen.getByRole("button", { name: new RegExp(proof.cta!.label, "i") })).toBeInTheDocument();
  });

  it("difere por segmento (academia ≠ imobiliária)", () => {
    const a = getLandingContent("academia").proof.testimonial.quote;
    const b = getLandingContent("imobiliaria").proof.testimonial.quote;
    expect(a).not.toBe(b);
    expect(getLandingContent("academia").proof.case!.after).not.toBe(
      getLandingContent("imobiliaria").proof.case!.after,
    );
  });
});
