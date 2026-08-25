import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { InboxSendabilityBanner } from "@/components/messaging/inbox/inbox-sendability-banner";
import { sendability } from "@/lib/messaging/display";

describe("InboxSendabilityBanner (Bloco 2)", () => {
  it("não renderiza nada quando o envio está disponível (canSend=true)", () => {
    const { container } = render(<InboxSendabilityBanner view={sendability(true, null)} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("mostra explicação humana quando indisponível — sem expor CONNECTION_*", () => {
    const view = sendability(false, {
      code: "CONNECTION_REVOKED",
      retryable: false,
      connectionStatus: "REVOKED",
    });
    render(<InboxSendabilityBanner view={view} />);
    expect(screen.getByText("Sessão revogada")).toBeInTheDocument();
    expect(screen.getByText("A sessão foi revogada e precisa ser configurada novamente.")).toBeInTheDocument();
    expect(screen.queryByText(/CONNECTION_/)).not.toBeInTheDocument();
    expect(screen.queryByText(/REVOKED/)).not.toBeInTheDocument();
  });

  it("usa tom de aviso (warning) quando o problema é retryable", () => {
    const view = sendability(false, {
      code: "CONNECTION_CONNECTING",
      retryable: true,
      connectionStatus: "CONNECTING",
    });
    render(<InboxSendabilityBanner view={view} />);
    const banner = screen.getByRole("status");
    expect(banner.className).toContain("bg-warning/5");
    expect(banner.className).not.toContain("bg-danger");
  });
});
