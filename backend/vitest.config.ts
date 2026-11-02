import { defineConfig } from "vitest/config";

export default defineConfig(() => ({
  test: {
    environment: "node",
    clearMocks: true,
    setupFiles: ["tests/setup.ts"],
    env: {
      NEON_URL: "postgresql://user:pass@localhost/db",
      ACCESS_TOKEN_SECRET: "test-access-secret",
      REFRESH_TOKEN_SECRET: "test-refresh-token",
      NODE_ENV: "test",
      GOOGLE_CLIENT_WEB_ID: "web-id",
      GOOGLE_CLIENT_IOS_ID: "ios-id",
    },
  },
}));
