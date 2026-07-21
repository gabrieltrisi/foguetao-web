import type { NextConfig } from "next";

/**
 * Cabeçalhos de segurança aplicados a todas as respostas. São defensivos e não
 * alteram o comportamento do app: bloqueiam embedding (clickjacking), sniffing
 * de MIME, vazamento de referrer e APIs de dispositivo não usadas. HSTS só tem
 * efeito sob HTTPS (inócuo em dev/HTTP). CSP não é incluída aqui de propósito —
 * exigiria nonces para os scripts inline do Next e do tema, o que foge do
 * escopo de "correções pequenas".
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
