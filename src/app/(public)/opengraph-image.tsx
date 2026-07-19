import { ImageResponse } from "next/og";

export const alt = "Foguetão — o centro de comando da sua operação";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Imagem de compartilhamento (OG) gerada — mesmo idioma da landing. */
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
            "radial-gradient(1000px 500px at 80% 120%, rgba(224,7,15,0.28), transparent 60%), radial-gradient(600px 400px at 10% -10%, rgba(255,255,255,0.05), transparent 60%)",
          padding: 72,
          fontFamily: "sans-serif",
          color: "#ffffff",
          position: "relative",
        }}
      >
        {/* anel de radar */}
        <div
          style={{
            position: "absolute",
            right: -160,
            top: 120,
            width: 620,
            height: 620,
            borderRadius: 620,
            border: "1px solid rgba(255,255,255,0.10)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: -40,
            top: 240,
            width: 380,
            height: 380,
            borderRadius: 380,
            border: "1px solid rgba(224,7,15,0.35)",
            display: "flex",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 12, height: 12, borderRadius: 12, background: "#e0070f" }} />
          <div style={{ fontSize: 22, letterSpacing: 8, color: "rgba(255,255,255,0.6)" }}>
            MISSÃO 001 — CENTRO DE COMANDO
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 96, fontWeight: 800, lineHeight: 1.0, letterSpacing: -3 }}>
            Você no centro
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 96,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -3,
            }}
          >
            <span>{"de "}</span>
            <span style={{ color: "#e0070f" }}>comando.</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ fontSize: 30, fontWeight: 700 }}>Foguetão</div>
          <div style={{ width: 1, height: 26, background: "rgba(255,255,255,0.2)" }} />
          <div style={{ fontSize: 20, letterSpacing: 6, color: "rgba(255,255,255,0.5)" }}>
            CRM · WHATSAPP · CAMPANHAS
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
