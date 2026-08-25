import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LiveNumber, LiveBar } from "../product-ui-live";

/**
 * Em jsdom o IntersectionObserver é stub (nunca dispara) → `useInView` fica
 * false e não anima: os componentes renderizam o VALOR FINAL. É exatamente a
 * garantia que queremos (SSR/no-JS/leitor de tela leem o real).
 */
describe("LiveNumber", () => {
  it("renderiza o valor final com prefixo/sufixo", () => {
    render(<LiveNumber target={31} suffix="%" />);
    expect(screen.getByText("31%")).toBeInTheDocument();
  });

  it("formata milhares quando pedido", () => {
    render(<LiveNumber target={486200} prefix="R$ " thousands />);
    expect(screen.getByText("R$ 486.200")).toBeInTheDocument();
  });
});

describe("LiveBar", () => {
  it("renderiza a largura final e o conteúdo", () => {
    render(
      <LiveBar pct={60} className="bar">
        <span>ok</span>
      </LiveBar>,
    );
    expect(screen.getByText("ok")).toBeInTheDocument();
  });
});
