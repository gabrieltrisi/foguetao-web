import { describe, expect, it } from "vitest";
import { campaignActionsByStatus, primaryActionForStatus } from "@/lib/campaigns/actions";

describe("campaignActionsByStatus", () => {
  it("DRAFT: editar, duplicar, excluir, enviar agora (sem pausar/retomar)", () => {
    const a = campaignActionsByStatus("DRAFT");
    expect(a).toMatchObject({ edit: true, remove: true, sendNow: true, pause: false, resume: false });
  });
  it("SCHEDULED: enviar agora + cancelar; sem excluir", () => {
    const a = campaignActionsByStatus("SCHEDULED");
    expect(a).toMatchObject({ sendNow: true, cancel: true, remove: false });
  });
  it("SENDING: pausar + cancelar; sem enviar agora/retomar", () => {
    const a = campaignActionsByStatus("SENDING");
    expect(a).toMatchObject({ pause: true, cancel: true, sendNow: false, resume: false });
  });
  it("PAUSED: retomar + cancelar", () => {
    const a = campaignActionsByStatus("PAUSED");
    expect(a).toMatchObject({ resume: true, cancel: true, pause: false });
  });
  it("terminais: só duplicar (sem pausar/retomar/cancelar/enviar)", () => {
    for (const s of ["COMPLETED", "COMPLETED_WITH_ERRORS", "CANCELED"]) {
      const a = campaignActionsByStatus(s);
      expect(a).toMatchObject({
        duplicate: true,
        sendNow: false,
        pause: false,
        resume: false,
        cancel: false,
        remove: false,
      });
    }
  });
});

describe("primaryActionForStatus", () => {
  it("mapeia a ação principal contextual", () => {
    expect(primaryActionForStatus("DRAFT")).toBe("sendNow");
    expect(primaryActionForStatus("SCHEDULED")).toBe("sendNow");
    expect(primaryActionForStatus("SENDING")).toBe("pause");
    expect(primaryActionForStatus("PAUSED")).toBe("resume");
    expect(primaryActionForStatus("COMPLETED")).toBe("duplicate");
  });
});
