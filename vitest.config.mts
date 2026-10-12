import { defineConfig } from "vitest/config";
import path from "node:path";

const alias = { "@": path.resolve(import.meta.dirname) };

export default defineConfig({
  resolve: { alias },
  test: {
    projects: [
      {
        resolve: { alias },
        test: {
          name: "node",
          environment: "node",
          include: ["lib/**/__tests__/**/*.test.ts"],
        },
      },
      {
        resolve: { alias },
        test: {
          name: "dom",
          environment: "jsdom",
          include: ["lib/**/__tests__/**/*.test.tsx"],
          setupFiles: ["./vitest.setup.ts"],
          // next-intl/navigation imports bare "next/navigation", which Node cannot resolve when the package is
          // externalised; inlining lets Vite resolve it, so tests use the real locale-aware Link.
          server: { deps: { inline: ["next-intl"] } },
        },
      },
    ],
  },
});
