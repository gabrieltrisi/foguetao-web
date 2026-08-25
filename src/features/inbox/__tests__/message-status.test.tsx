import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { MessageStatus } from "@/features/inbox/components/timeline/message/message-status";

/**
 * F2D H1: os tons são para a bolha CLARA (`bg-brand-soft`). `text-white/*` (legado da
 * bolha escura) tornava o status invisível no modo claro — este teste trava a regressão.
 */
describe("MessageStatus tones (F2D H1)", () => {
  const statuses = ["QUEUED", "SENDING", "SENT", "DELIVERED", "READ", "FAILED", "CANCELED"];

  it("nunca usa text-white/* (invisível na bolha clara)", () => {
    for (const status of statuses) {
      const { container, unmount } = render(<MessageStatus status={status} />);
      const el = container.querySelector("[role=img]");
      expect(el, status).not.toBeNull();
      expect(el!.className, status).not.toMatch(/text-white/);
      unmount();
    }
  });

  it("READ destaca (info) e FAILED alerta (danger)", () => {
    const read = render(<MessageStatus status="READ" />);
    expect(read.container.querySelector("[role=img]")!.className).toMatch(/text-info/);
    const failed = render(<MessageStatus status="FAILED" />);
    expect(failed.container.querySelector("[role=img]")!.className).toMatch(/text-danger/);
  });

  it("status desconhecido → não renderiza", () => {
    const { container } = render(<MessageStatus status="WAT" />);
    expect(container.querySelector("[role=img]")).toBeNull();
  });
});
