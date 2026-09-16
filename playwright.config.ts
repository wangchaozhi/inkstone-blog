import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  workers: 1,
  use: { baseURL: "http://localhost:3100", trace: "retain-on-failure" },
  webServer: {
    command: "node scripts/reset-test.mjs && npm run db:seed && npm run dev -- --port 3100",
    url: "http://localhost:3100",
    reuseExistingServer: false,
    env: {
      TURSO_DATABASE_URL: "file:test.db",
      ADMIN_PASSWORD: "test-only-password-12345",
      SESSION_SECRET: "test-only-session-secret-with-at-least-32-characters",
      NEXT_PUBLIC_SITE_URL: "http://localhost:3100",
    },
  },
});
