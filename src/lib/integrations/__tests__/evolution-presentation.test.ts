import { describe, expect, it } from "vitest";
import { presentEvolutionStatus } from "@/lib/integrations/evolution-presentation";
import type { IntegrationStatus } from "@/types/api/integrations";

const ALL: IntegrationStatus[] = [
  "DRAFT",
  "CONNECTING",
  "CONNECTED",
  "DEGRADED",
  "ERROR",
  "DISCONNECTED",
  "REVOKED",
];

describe("presentEvolutionStatus", () => {
  it("cobre todos os status sem retornar undefined", () => {
    for (const s of ALL) {
      const v = presentEvolutionStatus(s);
      expect(v.label.length).toBeGreaterThan(0);
      expect(v.description.length).toBeGreaterThan(0);
    }
  });

  it("só exibe/pollan o QR enquanto aguarda leitura (CONNECTING)", () => {
    expect(presentEvolutionStatus("CONNECTING").showQr).toBe(true);
    for (const s of ALL.filter((x) => x !== "CONNECTING")) {
      expect(presentEvolutionStatus(s).showQr).toBe(false);
    }
  });

  it("marca como transitório apenas DRAFT e CONNECTING (para o polling parar nos finais)", () => {
    expect(presentEvolutionStatus("DRAFT").isTransitional).toBe(true);
    expect(presentEvolutionStatus("CONNECTING").isTransitional).toBe(true);
    for (const s of ["CONNECTED", "DEGRADED", "ERROR", "DISCONNECTED", "REVOKED"] as const) {
      expect(presentEvolutionStatus(s).isTransitional).toBe(false);
    }
  });

  it("CONNECTED permite desconectar mas não reconectar; CONNECTING permite só desconectar", () => {
    const connected = presentEvolutionStatus("CONNECTED");
    expect(connected.canDisconnect).toBe(true);
    expect(connected.canConnect).toBe(false);
    expect(connected.tone).toBe("success");

    const connecting = presentEvolutionStatus("CONNECTING");
    expect(connecting.canConnect).toBe(false);
    expect(connecting.canDisconnect).toBe(true);
  });

  it("REVOKED é terminal: sem conectar, sem desconectar", () => {
    const v = presentEvolutionStatus("REVOKED");
    expect(v.canConnect).toBe(false);
    expect(v.canDisconnect).toBe(false);
  });
});
