import { describe, it, expect, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { SegmentReconciler } from "../segment-reconciler";

beforeEach(() => {
  document.cookie = "fg_segment=; max-age=0; path=/";
  window.localStorage.clear();
});

describe("SegmentReconciler (LP3.1 — home universal)", () => {
  it("uma escolha explícita da URL (fromUrl) persiste o segmento", () => {
    render(<SegmentReconciler active="academia" fromUrl />);
    expect(document.cookie).toContain("fg_segment=academia");
    expect(window.localStorage.getItem("fg_segment")).toBe("academia");
  });

  it("home sem contexto (fromUrl=false) NÃO restaura nem persiste nicho, mesmo com localStorage salvo", () => {
    window.localStorage.setItem("fg_segment", "academia");
    render(<SegmentReconciler active="default" fromUrl={false} />);
    // não escreve cookie de nicho (nada é restaurado a partir do storage)
    expect(document.cookie).not.toContain("fg_segment=academia");
  });
});
