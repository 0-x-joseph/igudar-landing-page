import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT ?? 3000);
const widths = [390, 768, 1280, 1600];

export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: "./test-results/artifacts",
  timeout: 90_000,
  retries: 0,
  reporter: [["list"]],
  use: { baseURL: `http://localhost:${PORT}`, trace: "on-first-retry" },
  webServer: {
    command: `npm run dev -- -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: widths.map((w) => ({
    name: `w${w}`,
    use: { ...devices["Desktop Chrome"], viewport: { width: w, height: 900 } },
  })),
});
