import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useAttachmentQueue } from "@/features/inbox/hooks/use-attachment-queue";

const file = (name: string, type: string, size = 100): File =>
  new File([new Uint8Array(size)], name, { type });

let created: string[];
let revoked: string[];
beforeEach(() => {
  created = [];
  revoked = [];
  let n = 0;
  vi.stubGlobal("URL", {
    ...URL,
    createObjectURL: vi.fn(() => {
      const u = `blob:mock-${(n += 1)}`;
      created.push(u);
      return u;
    }),
    revokeObjectURL: vi.fn((u: string) => revoked.push(u)),
  });
});
afterEach(() => vi.unstubAllGlobals());

const cfg = { maxSizeBytes: 10_000, maxCount: 10, allowedMimeTypes: ["image/png", "application/pdf"] };

describe("useAttachmentQueue (F5 — ObjectURL lifecycle)", () => {
  it("add cria ObjectURL só para previsualizável (imagem sim, PDF não)", () => {
    const { result } = renderHook(() => useAttachmentQueue(cfg));
    act(() => { result.current.add([file("a.png", "image/png"), file("b.pdf", "application/pdf")]); });
    expect(result.current.count).toBe(2);
    expect(created).toHaveLength(1); // só a imagem
    const img = result.current.items.find((a) => a.mime === "image/png")!;
    const pdf = result.current.items.find((a) => a.mime === "application/pdf")!;
    expect(img.previewUrl).toBeTruthy();
    expect(pdf.previewUrl).toBeUndefined();
  });

  it("remove revoga a ObjectURL", () => {
    const { result } = renderHook(() => useAttachmentQueue(cfg));
    act(() => { result.current.add([file("a.png", "image/png")]); });
    const id = result.current.items[0].id;
    act(() => { result.current.remove(id); });
    expect(result.current.count).toBe(0);
    expect(revoked).toEqual(created); // a URL criada foi revogada
  });

  it("clear revoga todas", () => {
    const { result } = renderHook(() => useAttachmentQueue(cfg));
    act(() => { result.current.add([file("a.png", "image/png"), file("c.png", "image/png")]); });
    expect(created).toHaveLength(2);
    act(() => { result.current.clear(); });
    expect(result.current.count).toBe(0);
    expect(revoked.sort()).toEqual(created.sort());
  });

  it("unmount revoga todas (sem vazamento)", () => {
    const { result, unmount } = renderHook(() => useAttachmentQueue(cfg));
    act(() => { result.current.add([file("a.png", "image/png")]); });
    expect(revoked).toHaveLength(0);
    unmount();
    expect(revoked).toEqual(created);
  });

  it("add retorna rejeições (não lança)", () => {
    const { result } = renderHook(() => useAttachmentQueue(cfg));
    let rejected: unknown[] = [];
    act(() => { rejected = result.current.add([file("x.zip", "application/zip")]); });
    expect(rejected).toHaveLength(1);
    expect(result.current.count).toBe(0);
  });
});
