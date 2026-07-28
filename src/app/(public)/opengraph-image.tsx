import { ImageResponse } from "next/og";

export const alt = "Foguetão — CRM para times comerciais que crescem";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Imagem de compartilhamento (OG) — mesmo idioma de crescimento da landing. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#08080a",
          backgroundImage:
            "radial-gradient(1100px 600px at 50% -20%, rgba(224,7,15,0.28), transparent 60%), radial-gradient(700px 400px at 90% 130%, rgba(224,7,15,0.16), transparent 60%)",
          padding: 80,
          fontFamily: "sans-serif",
          color: "#ffffff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 12, height: 12, borderRadius: 12, background: "#e0070f" }} />
          <div style={{ fontSize: 22, letterSpacing: 8, color: "rgba(255,255,255,0.6)" }}>
            CRM PARA EMPRESAS QUE QUEREM VENDER MAIS
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 82, fontWeight: 800, lineHeight: 1.02, letterSpacing: -3 }}>
            Mais vendas.
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              fontSize: 82,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -3,
            }}
          >
            <span style={{ color: "#e0070f" }}>Menos oportunidades perdidas.</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ fontSize: 30, fontWeight: 700 }}>Foguetão</div>
          <div style={{ width: 1, height: 26, background: "rgba(255,255,255,0.2)" }} />
          <div style={{ fontSize: 20, letterSpacing: 6, color: "rgba(255,255,255,0.5)" }}>
            CRM · PIPELINE · NEGÓCIOS · TAREFAS
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
