import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60000,
  workers: 1,
  use: {
    baseURL: "http://localhost:8080",
    headless: true,
    launchOptions: {
      ...(process.env.CHROMIUM_PATH
        ? { executablePath: process.env.CHROMIUM_PATH }
        : {}),
      args: ["--no-sandbox", "--disable-dev-shm-usage"],
    },
    trace: "off",
    screenshot: "off",
    video: "off",
  },
  webServer: {
    command: "node --import tsx scripts/test-server.ts",
    url: "http://localhost:8080/api/health",
    timeout: 30000,
    reuseExistingServer: false,
  },
  reporter: "list",
});
