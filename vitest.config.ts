import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    css: false,
    // Env exigida pela validação de startup (src/lib/env.ts).
    env: {
      NEXT_PUBLIC_API_URL: "http://localhost:3000",
    },
  },
  resolve: {
    alias: {
      // "server-only" é um no-op fora do bundler do Next (permite testar a camada HTTP).
      "server-only": fileURLToPath(new URL("./src/test/server-only-stub.ts", import.meta.url)),
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
